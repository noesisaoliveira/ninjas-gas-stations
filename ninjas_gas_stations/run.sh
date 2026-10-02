#!/usr/bin/with-contenv bashio
set -euo pipefail

mkdir -p /data
export LOG_LEVEL="$(bashio::config 'log_level' 'INFO')"
exec uvicorn app.main:app --host 0.0.0.0 --port 8099 --log-level "$(bashio::config 'log_level' 'info' | tr '[:upper:]' '[:lower:]')"
