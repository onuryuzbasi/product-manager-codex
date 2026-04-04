# Match-3 Economy Operations Plan

## Purpose
This document defines the operating model for reviewing and balancing a match-3 economy system across core progression, side features, rewards, hoarding, and churn risk.

## Core Principles
- Raw data should be event-based.
- Operational reporting should be daily.
- Diagnosis should be segmented by `level_band`, not only global averages.
- Tuning should be iterative and controlled, not constant random adjustment.
- Problems should be classified before action: `difficulty`, `economy friction`, `reward irrelevance`, or `fatigue`.

## Recommended Segments
- `1-20`
- `21-50`
- `51-100`
- `101-200`
- `201-500`
- `500+`

Also break out when needed by:
- `payer_status`
- `new vs mature users`
- `country`
- `app_version`

## Event Model
Use an event ledger with fields like:

```text
event_time
user_id
session_id
level_id
level_band
feature_name
resource_type
flow_type
amount
reason_code
balance_before
balance_after
attempt_no
payer_status
app_version
```

## Daily Reports

### 1. Daily Economy Health
Track per `resource_type`:

```text
date
resource_type
source_total
sink_total
net_flow
avg_source_per_dau
avg_sink_per_dau
median_balance
zero_balance_rate
top_10_holder_share
```

Interpretation:
- `net_flow` consistently positive: inflation risk
- `net_flow` consistently negative: scarcity risk
- `median_balance` rising over time: stock accumulation
- `zero_balance_rate` rising: users are getting stuck
- `top_10_holder_share` rising: stock is concentrating in a small group

Notes:
- `DAU` here should mean users with at least one meaningful gameplay or economy event that day.
- Always read this report at `global`, then `level_band`, then `payer_status`.

### 2. Daily Feature Source-Sink
Track per `feature_name` and `resource_type`:

```text
date
feature_name
resource_type
source_total
sink_total
net_flow
users_earned
users_spent
```

Drilldown order:
1. Daily feature view
2. `feature x level_band`
3. `feature x reward_type`
4. `feature x step_or_tier`

Use this to identify which feature is over-issuing or under-utilizing a resource.

### 3. Daily Level Difficulty Health
Track per `level_band`:

```text
date
level_band
attempts
win_rate
avg_attempts_to_win
same_level_retry_rate
quit_after_fail_rate
booster_use_rate
extra_move_buy_rate
```

Interpretation:
- `same_level_retry_rate` up + `quit_after_fail_rate` up: difficulty spike
- `booster_use_rate` up + `win_rate` flat: resources are not solving the friction
- `extra_move_buy_rate` up + churn risk up: monetization pressure may be too high

### 4. Daily Hoarding Watchlist
Track only alarm indicators:

```text
date
resource_type
net_stock_change
earn_spend_ratio
median_balance
top_10_holder_share
users_no_use_7d
feature_with_max_issue_qty
feature_with_lowest_use_7d
```

Use this as the trigger list for deeper hoarding analysis.

### 5. Daily Pre-Churn Risk
This is an early warning view, not the full churn study.

Track per `level_band`:

```text
date
level_band
users_at_3d_churn_risk
fail_streak_last_10
same_level_retry_last_10
quit_after_fail_last_10
booster_use_delta_vs_baseline
levels_per_session_delta
```

Use this daily to detect emerging problem bands.

## Hoarding Framework

### Definition
Hoarding means a resource is being accumulated faster than it is entering real use.

### Hoarding Analysis Order
1. `Resource-level health`
2. `Feature attribution`
3. `Reward-type analysis`
4. `Step/tier analysis`

Do not start by reviewing every step manually.

### Resource-Level Hoarding Dashboard

```text
resource_type
starting_stock
earned
spent
ending_stock
net_stock_change
earn_spend_ratio
median_balance
zero_balance_rate
top_10_holder_share
users_stock_gte_5
users_stock_gte_10
users_no_use_7d
median_levels_to_first_use
```

### Feature Attribution Dashboard

```text
resource_type
feature_name
issued_qty
claimed_qty
used_1d
used_7d
stock_growth_after_issue
median_levels_to_first_use
```

### Reward-Type Dashboard

```text
feature_name
reward_type
issue_count
claim_rate
use_1d
use_7d
median_levels_to_first_use
avg_stock_before_issue
avg_stock_after_7d
```

### Step/Tier Dashboard

```text
feature_name
step_or_tier
reward_type
users_reached
users_claimed
claim_rate
use_7d
stock_growth_after_claim
```

### Hoarding Decision Tree
1. Is `net_stock_change` consistently positive?
2. Is `use_7d` low?
3. Is `stock_before_issue` already high?
4. Is the problem tied to one feature?
5. Is it limited to one segment?

Action mapping:
- Too much issuance: reduce quantity or change reward mix
- Low claim rate: fix claim UX or visibility
- Low use rate: improve use cases, tutorials, or contextual prompts
- High stock before issue: switch to dynamic or alternative rewards
- Segment-specific problem: tune by segment instead of globally

## Top 10 Percent Holder Share

### Why It Matters
`top_10_holder_share` shows whether inventory is circulating across the population or parking in a small minority.

### How To Read It
High share by itself is not enough. Read it together with:
- `earn_spend_ratio`
- `median_balance`
- `zero_balance_rate`
- `level_band`
- `feature attribution`

### Action Logic
- High share + high issuance: reduce or redistribute rewards
- High share + low usage: strengthen sinks and usage moments
- High share only in late game: may be acceptable, but keep under watch

This metric is an alarm, not a standalone action rule.

## Battle Pass Reward Review
Battle pass should not be analyzed by fixed `level_id`. Use claim-time context:
- `player_level_band_at_claim`
- `days_since_season_start`
- `tier`
- `keys_earned`
- `sessions_since_claim`
- `levels_completed_since_claim`

### Required Event Funnel
- `bp_key_earned`
- `bp_tier_unlocked`
- `bp_reward_claim_available`
- `bp_reward_claimed`
- `reward_granted`
- `reward_item_used`

### Review Funnel

```text
Reached Tier
-> Claim Available
-> Claimed
-> Used Within 1d
-> Used Within 7d
-> Used Within Next 5 Levels
```

### Sample Size Guidance
If a single step is sparse:
- combine similar tiers
- group by reward type
- expand the time window to weekly or seasonal
- widen segmentation bands

Never judge reward quality only from claimed users if claim rate is low.

## Churn and Last 10 Attempts

### Churn Definitions
- `soft churn`: no return for 3 days
- `hard churn`: no return for 7 days

Session end is not churn.

### When To Review
- Daily: only the pre-churn risk summary
- Weekly: full churn study using last 10 attempts
- Ad hoc: when a daily report shows a strong band-level issue

### Why Last 10 Attempts
It captures a short friction pattern without being too noisy.

Use:
- `last 3 attempts` for immediate triggers
- `last 10 attempts` for pattern diagnosis
- `last 20 attempts` for extended trend checks

### Weekly Pre-Churn Dataset
For churned users, compare the last 10 attempts against retained users in the same `level_band`.

Track:

```text
level_band
avg_win_rate_last_10
avg_fail_streak_last_10
same_level_retry_rate
quit_after_fail_rate
booster_use_delta_vs_baseline
extra_move_buy_rate
zero_balance_rate
levels_per_session
time_between_attempts
```

### Classification
- `difficulty-driven`: low win rate, repeated same-level failures, high quit-after-fail
- `economy-friction`: resource use rises, but progress does not improve
- `fatigue/disengagement`: failures are not extreme, but sessions shorten and retries fade

## Review Cadence

### Daily
- Review `Daily Economy Health`
- Review `Daily Level Difficulty Health`
- Review `Daily Hoarding Watchlist`
- Review `Daily Pre-Churn Risk`
- Drill into `Daily Feature Source-Sink` only where daily alarms appear

### Weekly
- Full feature source-sink review
- Full hoarding root-cause review
- Full pre-churn last 10 attempts analysis
- Reward effectiveness review
- Level-band tuning review
- A/B test result review

### Monthly or Seasonally
- Battle pass reward audit
- Event reward audit
- Resource inflation/deflation review
- Segment-based reward redesign
- Economy policy review for core and side features

## Alerting and Good/Bad Signals
Do not rely on universal static thresholds. Use:
- 28-day baseline
- week-over-week trend
- patch-over-patch comparison
- segment comparison

### Practical Alert Rules
- `zero_balance_rate` is more than 20 percent above baseline
- `top_10_holder_share` rises for 2 consecutive weeks
- `use_7d` drops materially after a reward change
- `quit_after_fail_rate` rises in a level band
- `net_flow` stays one-directional for 7 days
- `booster_use_rate` rises but `win_rate` does not improve

## Example Interpretation

Example for `hammer`:

```text
source_total: 120000
sink_total: 35000
net_flow: +85000
avg_source_per_dau: 1.8
avg_sink_per_dau: 0.4
median_balance: 7
zero_balance_rate: 12%
top_10_holder_share: 68%
```

Interpretation:
- Hammers are entering the economy much faster than they are leaving.
- Typical users already have meaningful stock.
- A large share of stock is concentrated in a small group.

Action:
1. Open feature attribution for `hammer`
2. Identify the features issuing the most hammers
3. Check `claim_rate`, `use_7d`, and `stock_before_issue`
4. Reduce issuance, replace reward type, or improve hammer use moments depending on the cause

## Standard Investigation Sequence
1. Read global daily economy health
2. Break by `level_band`
3. Identify the resource or band with the biggest anomaly
4. Open feature source-sink for that resource
5. Open hoarding attribution if stock is building
6. Open last 10 attempts analysis if friction or churn signals appear
7. Decide whether the fix belongs to `level design`, `reward design`, `sink design`, or `live ops pacing`
