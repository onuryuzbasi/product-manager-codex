# Match-3 Game + Product Knowledge Log Schema

Use this structure while planning issues.

## Confirmed Game Rules

- Board size/shape constraints
- Match and cascade behavior
- Special tile and blocker interactions
- Move count, win/fail boundaries

## Confirmed Product/UX Rules

- Core UX flow and screen hierarchy
- Feedback principles (animation, haptic, audio, copy tone)
- Error and empty-state behaviors
- Accessibility/device constraints
- ZBD/P2E onboarding rule: targeted deep-link users start P2E-active, while organic users stay inactive until explicit activation.
- ZBD/P2E popup rule: targeted users get one post-Level-1 info popup, organic inactive users see the popup only on Earn tap and it repeats until activation.
- ZBD/P2E wallet rule: wallet CTA shows amount for targeted/activated users and "Earn" for inactive organic users.
- ZBD/P2E win-flow rule: targeted and activated users use streak/multiplier wallet-destination feedback; inactive organic users stay on the standard coin sequence.
- ZBD/P2E reward rule: reward calculation should use one canonical raw earn unit, while BTC and USD remain wallet-side conversion/display layers.
- ZBD/P2E payout rule: display balance and withdrawable integer balance should be tracked separately to handle fractional unit carry-over safely.

## Confirmed Economy and Meta Rules

- Currency sinks/sources
- Booster pricing and grant logic
- Reward cadence and retention hooks
- ZBD/P2E economy rule: BTC and USD sessions share one internal earned unit; conversion differences are display/wallet-side, not reward-logic-side.
- ZBD/P2E config rule: earn values for level win, remaining moves, and remaining boosters must be remote-configurable and support level-band tuning.
- ZBD/P2E LiveOps rule: reward economy should be tunable by country, AB bucket, level band, and currency display mode without changing gameplay logic.
- ZBD/P2E telemetry rule: acquisition, activation, reward, and payout/fraud should be tracked as separate event layers with shared properties.
- ZBD/P2E state rule: reward calculation, wallet display, and payout transfer should be modeled as separate layers to avoid state mismatch.
- ZBD/P2E documentation rule: analytics tracking sheet, example config payload, and simplified state diagram are useful companion artifacts for engineering handoff.
- ZBD/P2E dashboard rule: economy review should center on net contribution margin, reward cost ratio, reward velocity, and config-snapshot-based interpretation.
- Match-3 core economy dashboard rule: first-version LiveOps economy view should stay intentionally small and focus on source/sink ratio, spend session rate, zero-balance rate, hoarding rate, median balance, spend rescue rate, and level-band pressure.
- Match-3 economy + level-design rule: economy dashboards must include level-band and outlier-level views so difficulty spikes are not misread as healthy monetization pressure.

## Risk History

- Repeated bug/design debt clusters
- Sensitive balance areas
- Metrics with historical regressions

## Active Assumptions

- Mechanics not yet confirmed
- UX patterns inferred but unverified
- Technical assumptions affecting scope
- "Auto-initialize above $0.95" refers to payout readiness/activation handling, but the exact UX and server contract are still unconfirmed.
- ZBD transfer payload likely requires integer units, but final rounding/flooring policy is still open.
- Fraud responses may force a fallback from real-money mode to coin-only mode, but the exact provider contract and player messaging are still unconfirmed.

## Template Evolution Notes

- Missing sections discovered during planning
- Sections that are redundant and should be merged
- Proposed next template version and rationale
- v1.1 should add optional sections for segmentation rules, dynamic config schema, and sequential reward animation flow.
- Future planning docs for monetized onboarding should also include KPI framework, intervention playbook, and payout-state modeling.
