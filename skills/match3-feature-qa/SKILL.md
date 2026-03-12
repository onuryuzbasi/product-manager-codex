---
name: match3-feature-qa
description: Generate QA test cases for new match-3/mobile game features from product plans. Use when a user shares a feature brief, v1/v2 scope, UI flows, backend or offline requirements, and asks for Jira-ready outputs such as a single issue checklist, detailed case tables, acceptance criteria, regression coverage, or edge-case scenarios.
---

# Match3 Feature QA

## Workflow

1. Parse the plan into `in-scope`, `out-of-scope`, dependencies, and assumptions.
2. Build coverage by domain:
   - UI and navigation
   - Core functional flow
   - Self vs other-player behavior
   - Data persistence, offline mode, and reconnect sync
   - Text/content and localization
   - Regression risks
3. Prioritize checks with `P0`, `P1`, `P2`.
4. Produce the format requested by the user:
   - Detailed test case table (`ID`, `Scenario`, `Steps`, `Expected Result`, `Priority`)
   - Single Jira issue checklist
   - Optional CSV-style output for import
5. End with missing information and explicit assumptions.

## Output Rules

- Use the user's language; default to Turkish if the request is Turkish.
- Reuse exact feature terms from the plan.
- Keep `v2` items visible but mark them as out of scope for `v1` validation.
- Do not invent backend-complete behavior; write assumption notes when needed.
- Keep checklist lines atomic and verifiable.
- For single-card Jira checklist requests, return concise sectioned checklists.

## Templates

- Use `references/detailed-testcase-template.md` for detailed case output.
- Use `references/jira-checklist-template.md` for single-card Jira output.

## Match-3 Focus Checks

- Validate first-time user gating flows.
- Validate regressions when entry points move (button relocation, removed settings actions).
- Validate offline-first behavior and reconnect synchronization.
- Validate other-player profile visibility vs edit restrictions.
- Validate stats counters for non-negative values, formatting safety, and persistence.
