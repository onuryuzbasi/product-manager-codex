#!/usr/bin/env bash

set -euo pipefail

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
OUT_DIR="${1:-$PWD}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_PATH="$OUT_DIR/codex-state-$STAMP.tar.gz"
INCLUDE_AUTH="${INCLUDE_AUTH:-0}"

if [[ ! -d "$CODEX_HOME" ]]; then
  echo "ERROR: CODEX_HOME not found at $CODEX_HOME" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

declare -a ITEMS=()
for item in config.toml skills automations rules; do
  if [[ -e "$CODEX_HOME/$item" ]]; then
    ITEMS+=("$item")
  fi
done

if [[ "$INCLUDE_AUTH" == "1" && -f "$CODEX_HOME/auth.json" ]]; then
  ITEMS+=("auth.json")
fi

if [[ "${#ITEMS[@]}" -eq 0 ]]; then
  echo "ERROR: No exportable Codex files found in $CODEX_HOME" >&2
  exit 1
fi

tar -C "$CODEX_HOME" -czf "$ARCHIVE_PATH" "${ITEMS[@]}"

echo "Created: $ARCHIVE_PATH"
echo "Included: ${ITEMS[*]}"
if [[ "$INCLUDE_AUTH" != "1" ]]; then
  echo "Auth token not included (set INCLUDE_AUTH=1 to include auth.json)."
fi
