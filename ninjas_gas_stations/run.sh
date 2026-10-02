#!/bin/sh
set -eu

mkdir -p /data
LOG_LEVEL="$(python -c 'import json; print(json.load(open("/data/options.json", encoding="utf-8")).get("log_level", "INFO").lower())' 2>/dev/null || printf 'info')"
export LOG_LEVEL
exec uvicorn app.main:app --host 0.0.0.0 --port 8099 --log-level "$LOG_LEVEL"
