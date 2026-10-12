from pathlib import Path

import pytest
from fastapi import FastAPI

from app import serve


def test_server_configs_keep_ingress_http_when_tls_is_disabled() -> None:
    application = FastAPI()
    configs = serve.server_configs({"ssl": False}, application)

    assert len(configs) == 1
    assert configs[0].port == 8099
    assert configs[0].lifespan == "on"
    assert configs[0].app is application


def test_server_configs_share_app_and_start_lifespan_once_for_tls(
    tmp_path: Path, monkeypatch
) -> None:
    certfile = tmp_path / "fullchain.pem"
    keyfile = tmp_path / "privkey.pem"
    certfile.write_text("test certificate", encoding="utf-8")
    keyfile.write_text("test private key", encoding="utf-8")
    monkeypatch.setattr(serve, "SSL_DIR", tmp_path)
    application = FastAPI()

    configs = serve.server_configs(
        {"ssl": True, "certfile": certfile.name, "keyfile": keyfile.name},
        application,
    )

    assert len(configs) == 2
    assert configs[0].port == 8099
    assert configs[1].port == 8443
    assert configs[0].app is application
    assert configs[1].app is application
    assert configs[0].lifespan == "on"
    assert configs[1].lifespan == "off"
    assert configs[1].ssl_certfile == str(certfile)
    assert configs[1].ssl_keyfile == str(keyfile)


def test_tls_rejects_paths_outside_ssl_directory(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setattr(serve, "SSL_DIR", tmp_path)

    with pytest.raises(ValueError, match="filename in /ssl"):
        serve.server_configs(
            {"ssl": True, "certfile": "../secret.pem", "keyfile": "key.pem"},
            FastAPI(),
        )
