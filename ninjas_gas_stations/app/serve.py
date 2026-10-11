from __future__ import annotations

import asyncio
import json
import logging
import os
import signal
import sys
from pathlib import Path
from typing import Any

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


def server_commands(options: dict[str, Any]) -> list[list[str]]:
    log_level = os.getenv("LOG_LEVEL", "INFO").lower()
    commands = [
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            "8099",
            "--log-level",
            log_level,
        ]
    ]
    if options.get("ssl", False):
        certfile = _certificate_path(str(options.get("certfile", "fullchain.pem")), "certfile")
        keyfile = _certificate_path(str(options.get("keyfile", "privkey.pem")), "keyfile")
        commands.append(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--host",
                "0.0.0.0",
                "--port",
                "8443",
                "--log-level",
                log_level,
                "--ssl-certfile",
                str(certfile),
                "--ssl-keyfile",
                str(keyfile),
            ]
        )
    return commands


async def _stop_process(process: asyncio.subprocess.Process) -> None:
    if process.returncode is not None:
        return
    process.terminate()
    try:
        await asyncio.wait_for(process.wait(), timeout=10)
    except TimeoutError:
        process.kill()
        await process.wait()


async def run() -> int:
    options = _options()
    commands = server_commands(options)
    processes: list[asyncio.subprocess.Process] = []
    stop_requested = asyncio.Event()
    loop = asyncio.get_running_loop()
    for handled_signal in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(handled_signal, stop_requested.set)

    try:
        for command in commands:
            processes.append(await asyncio.create_subprocess_exec(*command))
        if options.get("ssl", False):
            logger.info("Serving Supervisor ingress on HTTP :8099 and direct API on HTTPS :8443")
        else:
            logger.info("Serving Supervisor ingress on HTTP :8099; direct TLS is disabled")

        waiters = [asyncio.create_task(process.wait()) for process in processes]
        stop_waiter = asyncio.create_task(stop_requested.wait())
        done, pending = await asyncio.wait(
            [*waiters, stop_waiter], return_when=asyncio.FIRST_COMPLETED
        )
        for waiter in pending:
            waiter.cancel()
        if stop_waiter in done:
            return 0

        exit_codes = [process.returncode or 0 for process in processes]
        logger.error("A web server exited unexpectedly: %s", exit_codes)
        return next((code for code in exit_codes if code not in (None, 0)), 1)
    finally:
        await asyncio.gather(*(_stop_process(process) for process in processes))


if __name__ == "__main__":
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper())
    raise SystemExit(asyncio.run(run()))
