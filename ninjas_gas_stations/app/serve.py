from __future__ import annotations

import asyncio
import json
import logging
import os
import signal
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import Any

import uvicorn

OPTIONS_PATH = Path(os.getenv("OPTIONS_FILE", "/data/options.json"))
SSL_DIR = Path("/ssl")
logger = logging.getLogger("ninjas_gas_stations.server")


def _options() -> dict[str, Any]:
    try:
        value = json.loads(OPTIONS_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    return value if isinstance(value, dict) else {}


def _certificate_path(filename: str, option_name: str) -> Path:
    if not filename or Path(filename).name != filename or filename in {".", ".."}:
        raise ValueError(f"{option_name} must be a filename in /ssl")
    path = SSL_DIR / filename
    if not path.is_file() or not os.access(path, os.R_OK):
        raise FileNotFoundError(f"{option_name} file is not readable: {path}")
    return path


def server_configs(options: dict[str, Any], application: Any) -> list[uvicorn.Config]:
    log_level = os.getenv("LOG_LEVEL", "INFO").lower()
    configs = [
        uvicorn.Config(
            application,
            host="0.0.0.0",
            port=8099,
            log_level=log_level,
            lifespan="on",
        )
    ]
    if options.get("ssl", False):
        certfile = _certificate_path(str(options.get("certfile", "fullchain.pem")), "certfile")
        keyfile = _certificate_path(str(options.get("keyfile", "privkey.pem")), "keyfile")
        configs.append(
            uvicorn.Config(
                application,
                host="0.0.0.0",
                port=8443,
                log_level=log_level,
                lifespan="off",
                ssl_certfile=str(certfile),
                ssl_keyfile=str(keyfile),
            )
        )
    return configs


class _ServerWithoutSignalCapture(uvicorn.Server):
    @contextmanager
    def capture_signals(self) -> Iterator[None]:
        yield


async def _wait_until_started(server: uvicorn.Server, task: asyncio.Task[None]) -> None:
    while not server.started:
        if task.done():
            await task
            raise RuntimeError("HTTP ingress server exited before startup completed")
        await asyncio.sleep(0.01)


async def run() -> int:
    options = _options()
    from app.main import app

    servers = [_ServerWithoutSignalCapture(config) for config in server_configs(options, app)]
    tasks: list[asyncio.Task[None]] = []
    stop_requested = asyncio.Event()
    loop = asyncio.get_running_loop()
    for handled_signal in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(handled_signal, stop_requested.set)

    try:
        http_task = asyncio.create_task(servers[0].serve())
        tasks.append(http_task)
        await _wait_until_started(servers[0], http_task)

        if len(servers) == 2:
            tls_task = asyncio.create_task(servers[1].serve())
            tasks.append(tls_task)
            await _wait_until_started(servers[1], tls_task)

        if options.get("ssl", False):
            logger.info("Serving Supervisor ingress on HTTP :8099 and direct API on HTTPS :8443")
        else:
            logger.info("Serving Supervisor ingress on HTTP :8099; direct TLS is disabled")

        stop_waiter = asyncio.create_task(stop_requested.wait())
        done, _ = await asyncio.wait([*tasks, stop_waiter], return_when=asyncio.FIRST_COMPLETED)
        if stop_waiter in done:
            for server in servers:
                server.should_exit = True
            await asyncio.gather(*tasks)
            return 0

        finished = next(task for task in tasks if task in done)
        if finished.exception() is not None:
            logger.error("A web server exited unexpectedly: %s", finished.exception())
        else:
            logger.error("A web server exited unexpectedly")
        for server in servers:
            server.should_exit = True
        await asyncio.gather(*tasks, return_exceptions=True)
        return 1
    finally:
        for server in servers:
            server.should_exit = True
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)


if __name__ == "__main__":
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())
    raise SystemExit(asyncio.run(run()))
