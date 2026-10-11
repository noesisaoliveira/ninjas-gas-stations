#!/bin/sh
set -eu

mkdir -p /data
LOG_LEVEL="$(python -c 'import json; print(json.load(open("/data/options.json", encoding="utf-8")).get("log_level", "INFO").lower())' 2>/dev/null || printf 'info')"
export LOG_LEVEL
exec python -m app.serve
