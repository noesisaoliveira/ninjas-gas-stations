from pathlib import Path

import pytest

from app import serve


def test_server_commands_keep_ingress_http_when_tls_is_disabled() -> None:
    commands = serve.server_commands({"ssl": False})

    assert len(commands) == 1
    assert commands[0][commands[0].index("--port") + 1] == "8099"
    assert "--ssl-certfile" not in commands[0]


def test_server_commands_start_tls_on_separate_port(tmp_path: Path, monkeypatch) -> None:
    certfile = tmp_path / "fullchain.pem"
    keyfile = tmp_path / "privkey.pem"
    certfile.write_text("test certificate", encoding="utf-8")
    keyfile.write_text("test private key", encoding="utf-8")
    monkeypatch.setattr(serve, "SSL_DIR", tmp_path)

    commands = serve.server_commands(
        {"ssl": True, "certfile": certfile.name, "keyfile": keyfile.name}
    )

    assert len(commands) == 2
    assert commands[0][commands[0].index("--port") + 1] == "8099"
    assert commands[1][commands[1].index("--port") + 1] == "8443"
    assert commands[1][commands[1].index("--ssl-certfile") + 1] == str(certfile)
    assert commands[1][commands[1].index("--ssl-keyfile") + 1] == str(keyfile)


def test_tls_rejects_paths_outside_ssl_directory(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setattr(serve, "SSL_DIR", tmp_path)

    with pytest.raises(ValueError, match="filename in /ssl"):
        serve.server_commands({"ssl": True, "certfile": "../secret.pem", "keyfile": "key.pem"})
