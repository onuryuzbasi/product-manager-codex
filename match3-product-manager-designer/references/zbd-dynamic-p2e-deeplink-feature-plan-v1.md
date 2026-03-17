# ZBD Dynamic P2E + Deep Link Onboarding Feature Plan v1

## 1) Issue Framing

- Issue title: Dynamic P2E (Play-to-Earn) and Deep Link Onboarding System
- Issue type: Feature
- Player problem: Early-game reward messaging, earn activation, and wallet onboarding are not aligned with acquisition source, so targeted users do not see the correct monetized experience and organic users can be exposed to value messaging too early.
- Product objective: Route players into the correct BTC/USD or standard coin journey at session start, gate P2E activation correctly, and connect the earn loop to ZBD wallet activation and payout.
- Success signal: Targeted users complete first-session P2E onboarding with correct currency display, organic users do not see BTC/USD earnings before activation, and wallet activation start rate increases without breaking win-flow clarity.

## 2) Current State and Context

- Current behavior: The feature request assumes one common onboarding and reward flow, without a source-aware split between targeted deep-link traffic and organic users.
- Desired behavior: Session source controls first-session UI, reward currency, info popup logic, and wallet activation state across story end, map, pre-level, win screen, and wallet.
- Why now: The game needs ad-driven P2E acquisition support with ZBD integration while preserving a safe default organic flow.
- Related prior decisions: No prior ZBD/P2E decision is recorded in the repository yet.

## 3) Game Design Plan

- Core mechanic impact: Reward calculation splits into two modes:
  - Standard coin mode for non-activated organic users.
  - P2E unit mode for targeted users and organic users after activation.
- Level or board rule changes: No board logic change is required; only reward output, win presentation, and destination wallet bar change.
- Booster/blocker interactions: Remaining moves and unspent boosters continue to resolve at level end, but their reward values are read from remote config and added into the raw earn total.
- Balance considerations:
  - Reward values must be configurable by level range/region so P2E value can be tuned independently from standard coin economy.
  - BTC and USD modes share the same internal earn unit; only wallet presentation/conversion differs.
  - If ZBD cashout accepts only integers, the payout pipeline must floor/round at a defined step before send.
- Win/fail condition impact:
  - Win flow is extended for P2E-active users with streak multiplier presentation before chest/reach rewards.
  - Lose flow should show no misleading BTC/USD earn amount for non-winning states unless separately defined later.

## 4) Product Design Plan

- Player flow updates:
  - App open: classify session as `targeted` or `organic` from deep link presence/type.
  - Story end / Level 1 CTA:
    - Targeted: arrow + "Play to Earn".
    - Organic: default guidance text.
  - Map wallet CTA:
    - Targeted: show current amount and currency icon/value.
    - Organic inactive: show "Earn".
  - Pre-level menu:
    - Targeted or activated: wallet CTA with amount.
    - Organic inactive: "Earn" CTA.
  - Post-Level 1 map return:
    - Targeted: guide arrow to wallet button, then show info popup once.
    - Organic inactive: no auto-popup; popup appears only on tap.
  - Organic popup CTA set: "Activate" and "No Thanks".
  - After activation: future wins use the targeted P2E sequence.
- UI/state changes:
  - Local state:
    - `is_p2e_active`
    - `session_currency_type`
    - `display_currency_icon`
    - `has_seen_info_popup`
  - Wallet view must switch between BTC/Satoshi display, USD display, and standard inactive state.
  - Wallet screen includes a persistent "ZBD Wallet Activation" CTA near the bottom.
- Feedback and affordance updates:
  - Targeted/activated win flow:
    1. Raw earn appears after end-of-level explosions.
    2. Streak bar slides in.
    3. Multiplier value pulses and changes highlight color.
    4. Counter animates to final value.
    5. Level reach/chest rewards resolve.
    6. Final earn flies to wallet.
  - Organic inactive flow:
    1. Raw coin value appears.
    2. No streak bar or multiplier animation.
    3. Chest/reach reward resolves.
    4. Coin flies to coin bar instead of wallet.
- Copy/content direction:
  - Map inactive CTA: "Earn"
  - Organic popup CTAs: "Activate", "No Thanks"
  - Level start tooltip: "Play to Earn" for targeted, standard text for organic
- Accessibility constraints:
  - Currency/icon meaning should not rely on color alone.
  - Counters and pulse states should remain legible on small devices and during animation.
  - Popup re-entry logic must be predictable and not trap user navigation.

## 5) Economy and Progression

- Currency impact:
  - Organic inactive users remain fully on standard coin economy.
  - Targeted and activated users earn a raw internal P2E value that is converted for wallet display based on session currency type.
- Reward changes:
  - Remote-config variables currently requested:
    - `lvl_win_base_reward`
    - `reward_per_move`
    - `reward_per_rocket`
    - `reward_per_bomb`
    - `reward_per_disco`
    - `rewarded_ad_multiplier`
    - `btc_conversion_rate`
    - `usd_conversion_rate`
  - Existing request also mentions:
    - `currency_mode`
    - `p2e_base_reward_multiplier`
    - `p2e_move_value`
    - `p2e_powerup_values`
  - Product decision needed: keep one naming set only, or define alias/migration rules to avoid config drift.
  - Level-band support is required so values can vary by ranges such as `1-100`.
  - If wallet total exceeds `$0.95`, the user should auto-initialize and bundled rewards should be sent in batch.
- Potential exploit/fairness risks:
  - Organic users seeing P2E values before activation breaks the core funnel gate.
  - Deep-link spoofing could grant unintended currency mode if session source is not validated.
  - Fractional wallet values vs integer ZBD transfer units can create visible-earned vs sent-earned mismatch.

## 6) Technical Scope

- Systems touched:
  - Deep link parser / attribution handoff
  - Session state store
  - Story end CTA state
  - Map wallet CTA
  - Pre-level menu HUD
  - Win/lose reward pipeline
  - Streak bar animation state
  - Wallet screen
  - ZBD SDK init + webview trigger
  - Remote config and level-band config resolution
  - Cashout/payout formatter
- Data/config needs:
  - Session classification (`targeted` vs `organic`)
  - Currency enum (`BTC`, `USD`, `NONE`)
  - Popup persistence flag
  - Reward config by level range
  - Conversion config by currency type
  - Integer payout rounding strategy
  - Offline queue/retry policy for activation and payout
- Telemetry events:
  - `deeplink_session_classified`
  - `p2e_info_popup_shown`
  - `p2e_info_popup_action`
  - `p2e_activated`
  - `p2e_reward_calculated`
  - `wallet_opened`
  - `zbd_activation_started`
  - `zbd_activation_completed`
  - `p2e_payout_enqueued`
  - `p2e_payout_sent`
  - `p2e_payout_failed`
- Dependencies:
  - ZBD SDK/webview integration
  - Remote config support for grouped reward values
  - Persisted local state
  - Final decision on offline scenario handling
  - Final decision on payout integer conversion rule

## 7) Acceptance Criteria

1. Organic users do not see BTC/USD earnings, wallet amount UI, or targeted multiplier flow until they explicitly activate P2E.
2. Targeted deep-link users see the correct currency icon and wallet value format based on the incoming BTC or USD link type from first session onward.
3. After Level 1, targeted users receive a one-time info popup and future wallet-button taps open wallet directly instead of repeating the popup.
4. Organic inactive users only see the info popup when tapping "Earn", and that popup continues to reappear until they choose "Activate".
5. The wallet screen exposes a "ZBD Wallet Activation" button that initializes the SDK and starts the expected webview flow.
6. Win reward values for P2E-active users are calculated from remote-configured base reward, remaining moves, remaining boosters, and optional ad multiplier.
7. BTC and USD sessions share the same raw earned value and differ only by conversion/display logic in wallet and UI surfaces.
8. When payout transfer requires integer units, the sent unit value follows one explicit rule and does not exceed the visibly earned transferable balance.

## 8) Risks and Mitigations

- Risk: Two overlapping remote-config naming schemes can create implementation ambiguity and liveops mistakes.
- Severity: High
- Mitigation: Collapse to one canonical schema before implementation and document migration/ownership.

- Risk: Auto-initialize threshold at `$0.95` may trigger unexpectedly if conversion rate updates after earnings are already shown.
- Severity: Medium
- Mitigation: Evaluate threshold using one stable server/config snapshot per payout cycle and log the evaluated rate.

- Risk: Offline activation or payout states can leave wallet UI in a false-active or false-sent state.
- Severity: High
- Mitigation: Separate local activation intent, SDK activation result, and payout delivery status in state and UI messaging.

- Risk: Targeted-only animations increase win-flow duration and can hurt session pacing if not tuned.
- Severity: Medium
- Mitigation: Cap animation duration and allow skip/fast-forward behavior after first exposure.

## 9) Rollout Plan

- Release strategy:
  - Internal QA with BTC and USD deep-link variants plus organic baseline
  - Limited cohort rollout behind remote config
  - Expand after payout reliability, activation funnel, and UI correctness are stable
- Guardrail metrics:
  - Level 1 completion to wallet-open rate
  - Popup-to-activation conversion
  - ZBD activation success rate
  - Reward calculation mismatch rate
  - Payout failure rate
  - D1 retention delta between targeted and organic cohorts
- Rollback trigger:
  - Wrong currency shown for session source
  - Organic users exposed to P2E values pre-activation
  - ZBD activation/webview failure spike
  - Reward send mismatch or payout queue growth beyond threshold

## 10) Decision Log

- Confirmed:
  - Session start must branch into targeted and organic behavior based on deep-link source.
  - Targeted users are P2E-active by default.
  - Organic users remain inactive until they explicitly choose "Activate".
  - Targeted users get a one-time info popup after Level 1 wallet guidance.
  - Organic inactive users see the popup only on "Earn" tap and continue to see it until activation.
  - Wallet contains a ZBD activation CTA.
  - Raw earn calculation uses remote-configured level win, moves, and booster values.
  - BTC and USD share one internal earned value and differ only in displayed conversion.
- Assumed:
  - "Deeplink Without Only US" means an organic/non-targeted US cohort that should not auto-activate P2E.
  - Activated organic users use the same win-sequence visuals as targeted users.
  - Auto-initialize at `$0.95` refers to wallet activation/payout readiness, not immediate forced cashout UI.
  - Level chest/reach animation exists already and only reward destination/value presentation changes.
- Unknown:
  - Exact server authority for deep-link trust and source validation.
  - Offline behavior for activation, reward accumulation, and payout send retries.
  - Exact integer-rounding rule for ZBD transfers.
  - Final naming and structure of remote-config keys.
  - Whether lose-state rewards or consolation flows need P2E-specific treatment.

## 11) Template Improvement Note

- What was missing in this template: The current template does not explicitly separate session segmentation rules, dynamic config schemas, and animated reward sequencing, all of which matter for monetized acquisition/onboarding features.
- Proposed change for next version: Add optional subsections for `Segmentation`, `Config Schema`, and `Animation Sequence` in issue-plan template v1.1.
