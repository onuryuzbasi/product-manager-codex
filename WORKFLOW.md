# Repo Workflow

This file defines the default operating flow for this repository.

## Push Trigger

When the user says `pushla` (or equivalent), run a full local-to-remote push flow.

## Required Updates Before Push

1. Update `PROJECT_LOG.md` with:
   - date (`YYYY-MM-DD`)
   - change type (`plan`, `feature`, `fix`, `infra`, `docs`)
   - short summary
   - touched files
   - notes/risks (if any)
2. Update `SKILL_UPDATES.md` if any skill file, template, or knowledge reference changed.
3. If the work includes reusable match-3 product/design decisions, update:
   - `match3-product-manager-designer/references/game-product-knowledge-log.md`
   - `match3-product-manager-designer/references/level-difficulty-knowledge-log.md` (if level balancing is impacted)

## Standard Push Sequence

```bash
GIT=/Library/Developer/CommandLineTools/usr/bin/git
$GIT status --short
$GIT add -A
$GIT commit -m "<type>: <short summary>"
$GIT push origin main
```

If there are no changes, report that there is nothing new to push.
