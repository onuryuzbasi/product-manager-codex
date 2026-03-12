#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /absolute/path/to/codex-state-YYYYmmdd-HHMMSS.tar.gz" >&2
  exit 1
fi

ARCHIVE_PATH="$1"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$CODEX_HOME-backup-$STAMP"

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "ERROR: archive not found: $ARCHIVE_PATH" >&2
  exit 1
fi

mkdir -p "$CODEX_HOME"
mkdir -p "$BACKUP_DIR"

for item in config.toml skills automations rules auth.json; do
  if [[ -e "$CODEX_HOME/$item" ]]; then
    mv "$CODEX_HOME/$item" "$BACKUP_DIR/"
  fi
done

tar -C "$CODEX_HOME" -xzf "$ARCHIVE_PATH"

echo "Imported archive into: $CODEX_HOME"
echo "Previous local state backup: $BACKUP_DIR"
