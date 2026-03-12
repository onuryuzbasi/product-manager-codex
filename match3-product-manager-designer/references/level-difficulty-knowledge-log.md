# Level Difficulty Knowledge Log

## Source

- Notion URL: `https://www.notion.so/narcade/B-lgesel-Level-Difficulty-Format-2b60199ecb4c802d838ef1ff8a6548d3?source=copy_link`
- Captured at: `2026-02-26`
- Source quality: extracted from user-provided screenshots (Notion page itself is sign-in gated)

## Confirmed Model: Regional Level Difficulty Format

### Base block (main config)

- `version` (number)
- `IsActive` (boolean)
- `DecrementMove` (number)
- `Thresholds` (array)
- `Thresholds[].RemainingMove` (number, required)
- `Thresholds[].MissionObjectsThresholdToEasen` (number)
- `Thresholds[].MissionObjectsThresholdToHarden` (number)
- `Thresholds[].DiscosThresholdToHarden` (number)

### Overrides block

- `Overrides` is an array of partial patches.
- Each override has `Ranges` (string).
- `Ranges` supports:
1. single level, example: `"355"`
2. interval, example: `"351-465"`
3. comma-separated mixed values, example: `"1-100, 250-351, 355"`
- Any main-config field can be overridden partially; full object repetition is not required.

### Type rule in overrides

- In main block, numeric/boolean values use native types.
- In overrides, overridden values are passed as strings (quoted) for compact partial patches.
- Exception: `Thresholds[].RemainingMove` must stay numeric.

### Merge and conflict resolution

For a given level:

1. Start from main config.
2. Collect all overrides whose `Ranges` include that level.
3. Apply matching overrides in list order.
4. Non-conflicting keys are combined.
5. If same key conflicts, the later override in the list wins.
6. Multiple overrides targeting the same level are allowed; system keeps running.

### Operational rules

- Invalid JSON in remote param can break game startup.
- Validate before publishing at:
`https://narcade.pages.dev/difficulty-seed`
- Validator also has a test-level input to preview effective difficulty config for a specific level.

## Example behavior observed in screenshots

- Base `DecrementMove` can be `2`.
- Override on `"351-465"` can set `DecrementMove` to `"15"`.
- Override on `"355"` can set `DecrementMove` to `"16"`.
- Due to last-write-wins, level `355` ends up with `"16"` for `DecrementMove`.
