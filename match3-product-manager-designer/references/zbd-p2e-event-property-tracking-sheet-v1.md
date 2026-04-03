# ZBD P2E Event Property Tracking Sheet v1

Bu dokuman analytics, client ve backend ekiplerinin ortak event implementasyon kontrol listesi olarak kullanilabilir.

## 1. Tracking Sheet

| Event Name | Trigger Point | Owner | Required Properties | Optional Properties | Notes |
|---|---|---|---|---|---|
| `deeplink_received` | App launch deep link parse | Client | `user_id`, `session_id`, `event_ts`, `deep_link_type`, `country`, `platform`, `app_version` | `deeplink_campaign_id`, `deeplink_partner`, `deeplink_raw_type` | Session basinda 1 kez |
| `session_classified` | Eligibility resolved | Client | `user_id`, `session_id`, `event_ts`, `entry_source`, `session_currency_type`, `is_new_user`, `country`, `ab_bucket` | `eligibility_reason`, `geo_eligible`, `currency_type_resolved` | Reward flow branch kaynagi |
| `ab_bucket_assigned` | Experiment bucket set | Backend or Client | `user_id`, `session_id`, `event_ts`, `ab_bucket` | `experiment_id`, `bucket_name` | Tek source of truth belirlenmeli |
| `p2e_cta_shown` | CTA render | Client | `user_id`, `session_id`, `event_ts`, `screen_name`, `cta_variant`, `entry_source`, `is_p2e_active` | `cta_text` | Story end, map, pre-level |
| `p2e_cta_clicked` | CTA tap | Client | `user_id`, `session_id`, `event_ts`, `screen_name`, `cta_variant` | - | Funnel girisi |
| `p2e_info_popup_shown` | Popup shown | Client | `user_id`, `session_id`, `event_ts`, `screen_name`, `popup_reason`, `popup_variant`, `is_p2e_active` | - | Targeted vs organic ayrimi izlenmeli |
| `p2e_info_popup_activate_clicked` | Activate tap | Client | `user_id`, `session_id`, `event_ts`, `screen_name`, `popup_variant` | - | Organic activation CTA |
| `p2e_info_popup_decline_clicked` | No Thanks tap | Client | `user_id`, `session_id`, `event_ts`, `screen_name`, `popup_variant` | - | Rejection tracking |
| `p2e_activated` | P2E state true oldu | Client | `user_id`, `session_id`, `event_ts`, `activation_source`, `is_p2e_active` | `welcome_bonus_units` | State transition event |
| `welcome_bonus_granted` | Bonus balance'a yazildi | Client or Backend | `user_id`, `session_id`, `event_ts`, `bonus_units`, `bonus_reason` | `display_balance_units` | Economy etkisi icin ayrik event |
| `wallet_opened` | Wallet screen open | Client | `user_id`, `session_id`, `event_ts`, `wallet_open_reason`, `is_p2e_active`, `is_zbd_initialized` | `display_balance_units`, `withdrawable_balance_units` | Wallet intent |
| `zbd_activation_started` | SDK or webview start | Client | `user_id`, `session_id`, `event_ts`, `start_reason`, `start_surface` | - | Provider funnel step |
| `zbd_activation_completed` | Activation success | Client or Backend | `user_id`, `session_id`, `event_ts`, `completion_surface`, `is_zbd_initialized` | - | Success source net olmali |
| `zbd_activation_failed` | Activation fail | Client or Backend | `user_id`, `session_id`, `event_ts`, `error_code`, `error_category` | `completion_surface` | Alert icin kritik |
| `level_reward_calculated` | End-of-level reward calc | Client | `user_id`, `session_id`, `event_ts`, `level_id`, `level_band`, `entry_source`, `session_currency_type`, `remaining_moves`, `remaining_rocket`, `remaining_bomb`, `remaining_disco`, `base_reward_units`, `move_reward_units`, `rocket_reward_units`, `bomb_reward_units`, `disco_reward_units`, `raw_reward_units`, `streak_multiplier`, `ad_multiplier`, `final_reward_units` | `display_currency_value`, `config_snapshot_id` | Deterministic calc audit |
| `streak_multiplier_applied` | Streak animation finalize | Client | `user_id`, `session_id`, `event_ts`, `level_id`, `streak_index`, `streak_multiplier`, `pre_streak_units`, `post_streak_units` | - | Targeted and activated only |
| `rewarded_ad_offer_shown` | Rewarded offer visible | Client | `user_id`, `session_id`, `event_ts`, `level_id`, `offer_surface`, `offered_multiplier` | - | Ad attach denominator |
| `rewarded_ad_watched` | Rewarded complete | Client | `user_id`, `session_id`, `event_ts`, `level_id`, `offer_surface`, `watched_multiplier` | - | Ad attach numerator |
| `rewarded_ad_multiplier_applied` | Multiplier written | Client | `user_id`, `session_id`, `event_ts`, `level_id`, `pre_ad_units`, `post_ad_units`, `ad_multiplier` | - | Economy lift |
| `wallet_balance_updated` | Balance persisted | Client | `user_id`, `session_id`, `event_ts`, `delta_units`, `display_balance_units`, `withdrawable_balance_units`, `fractional_remainder_units` | `display_currency_value` | Player-visible balance source |
| `auto_initialize_triggered` | Threshold control fires | Client or Backend | `user_id`, `session_id`, `event_ts`, `threshold_usd`, `current_display_usd`, `trigger_surface` | - | Threshold validation |
| `cashout_screen_opened` | Cashout enter | Client | `user_id`, `session_id`, `event_ts`, `display_balance_units`, `withdrawable_balance_units` | `session_currency_type` | Cashout intent |
| `cashout_requested` | Cashout CTA tap | Client | `user_id`, `session_id`, `event_ts`, `requested_units`, `requested_display_value` | `session_currency_type` | Request creation |
| `payout_sent` | Provider request accepted | Backend | `user_id`, `session_id`, `event_ts`, `sent_units`, `provider_request_id` | `provider_name` | Source of truth backend olmali |
| `payout_failed` | Provider request failed | Backend | `user_id`, `session_id`, `event_ts`, `sent_units`, `provider_error_code`, `provider_error_category` | `provider_name` | Ops alert event |
| `fraud_status_changed` | Fraud status update | Backend | `user_id`, `session_id`, `event_ts`, `old_status`, `new_status`, `fraud_reason` | `provider_name` | Risk tracking |
| `p2e_disabled_for_user` | Coin-only fallback | Backend or Client | `user_id`, `session_id`, `event_ts`, `disable_reason`, `fallback_mode` | - | Final fail-safe state |

## 2. Naming Rules

- Event isimleri snake_case olmali.
- Property isimleri snake_case olmali.
- Money-like alanlar icin `*_units` ve `*_display_value` ayrimi korunmali.
- Bool alanlar `is_` prefix ile baslamali.

## 3. Validation Checklist

- Her event duplicate firing riski acisindan kontrol edilmeli.
- `level_reward_calculated` ayni level sonucu icin bir kez gonderilmeli.
- `wallet_balance_updated` sadece state write olduktan sonra gonderilmeli.
- Provider source-of-truth eventleri backend tarafinda tutulmali.
- `config_snapshot_id` varsa reward audit icin evente eklenmeli.

## 4. Recommended Delivery Process

1. Analytics event adlarini onaylar.
2. Client trigger noktalarini isaretler.
3. Backend provider event ownership'ini alir.
4. Dashboard tarafinda KPI mapping yapilir.
5. QA debug build ile event firing kontrol edilir.
