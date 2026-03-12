# Codex Multi-Computer Sync

This folder gives you a practical way to continue on another machine with the same Codex setup.

## What gets synced

- `~/.codex/skills`
- `~/.codex/automations` (if present)
- `~/.codex/rules` (if present)
- `~/.codex/config.toml` (if present)
- Optional: `~/.codex/auth.json` (only if you explicitly include it)

## Source computer (current machine)

1. Make scripts executable:

```bash
chmod +x "/Users/yuzbasi/Desktop/Product Manager- Codex/codex-sync/export-codex-state.sh" \
         "/Users/yuzbasi/Desktop/Product Manager- Codex/codex-sync/import-codex-state.sh"
```

2. Create export archive (without auth token):

```bash
"/Users/yuzbasi/Desktop/Product Manager- Codex/codex-sync/export-codex-state.sh" "/tmp"
```

3. Optional: include login token too (only for trusted personal device):

```bash
INCLUDE_AUTH=1 "/Users/yuzbasi/Desktop/Product Manager- Codex/codex-sync/export-codex-state.sh" "/tmp"
```

4. Copy generated archive from `/tmp/codex-state-*.tar.gz` to the new computer (AirDrop, USB, SCP, cloud drive).

## Target computer (new machine)

1. Put the archive on the new machine (example: `~/Downloads/codex-state-*.tar.gz`).
2. Run import script:

```bash
bash "/path/to/import-codex-state.sh" "/Users/<you>/Downloads/codex-state-YYYYmmdd-HHMMSS.tar.gz"
```

The script automatically backs up previous local state to:

`~/.codex-backup-YYYYmmdd-HHMMSS`

## Project sync (recommended via Git)

Use git for project files; use the scripts above for Codex local state.

```bash
# on source machine
cd "/Users/yuzbasi/Desktop/Product Manager- Codex"
git add -A
git commit -m "Sync before moving to second machine"
git push

# on target machine
git clone <your-repo-url> "/Users/<you>/Desktop/Product Manager- Codex"
```
