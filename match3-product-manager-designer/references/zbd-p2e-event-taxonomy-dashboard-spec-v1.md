# ZBD P2E Event Taxonomy + Dashboard Spec v1

Bu dokuman, ZBD P2E sisteminin nasil olculecegini tanimlar.
Amac:

- Hangi eventlerin gonderilecegini netlestirmek
- Event property setini standardize etmek
- Dashboard tarafinda hangi KPI'larin izlenecegini belirlemek
- LiveOps ve product kararlarini veriyle yonetmek

## 1. Measurement Principles

Bu sistemde eventler 4 karar alanini beslemeli:

- Acquisition: kullanici nasil geldi
- Activation: earn sistemine giris oldu mu
- Economy: ne kadar kazandi, hangi kuralla kazandi
- Payout/Risk: payout, initialize, fraud ve fail durumlari

Temel ilke:

- Her event tek bir is kararini desteklemeli.
- Her eventte ortak property seti olmali.
- Hesaplanan reward eventleri deterministic olmalı; ayni input ayni output'u vermeli.

## 2. Shared Event Properties

Tum ilgili eventlerde mumkun oldugunca bu ortak alanlar tasinmali:

- `user_id`
- `session_id`
- `event_ts`
- `country`
- `platform`
- `app_version`
- `is_new_user`
- `entry_source`
- `deep_link_type`
- `ab_bucket`
- `session_currency_type`
- `is_p2e_active`
- `is_zbd_initialized`
- `fraud_status`
- `level_id`
- `level_band`

Not:

- `level_id` ve `level_band` sadece level-bagli eventlerde zorunlu olmali.
- `session_currency_type` degerleri: `BTC`, `USD`, `NONE`
- `entry_source` degerleri: `targeted`, `organic`

## 3. Event Taxonomy

### 3.1 Acquisition / Eligibility

#### `deeplink_received`

Ne zaman:

- App acilisinda deep link parse edildiginde

Ek properties:

- `deeplink_campaign_id`
- `deeplink_partner`
- `deeplink_raw_type`

#### `session_classified`

Ne zaman:

- Kullanici targeted/organic ve currency mode olarak siniflandiginda

Ek properties:

- `eligibility_reason`
- `geo_eligible`
- `currency_type_resolved`

#### `ab_bucket_assigned`

Ne zaman:

- AB test bucketi set edildiginde

Ek properties:

- `experiment_id`
- `bucket_name`

### 3.2 Onboarding / Activation

#### `p2e_cta_shown`

Ne zaman:

- Story end, map veya pre-level ekranda P2E-related CTA gorundugunde

Ek properties:

- `screen_name`
- `cta_variant`
- `cta_text`

#### `p2e_cta_clicked`

Ne zaman:

- Earn / wallet / play-to-earn CTA tiklandiginda

Ek properties:

- `screen_name`
- `cta_variant`

#### `p2e_info_popup_shown`

Ne zaman:

- Info popup render oldugunda

Ek properties:

- `screen_name`
- `popup_reason`
- `popup_variant`

#### `p2e_info_popup_activate_clicked`

Ne zaman:

- Organic kullanici `Activate` dediginde

Ek properties:

- `screen_name`
- `popup_variant`

#### `p2e_info_popup_decline_clicked`

Ne zaman:

- Organic kullanici `No Thanks` dediginde

Ek properties:

- `screen_name`
- `popup_variant`

#### `p2e_activated`

Ne zaman:

- Kullanici P2E-active state'e gectiginde

Ek properties:

- `activation_source`
- `welcome_bonus_units`

#### `welcome_bonus_granted`

Ne zaman:

- Sisteme katilim bonusu verildiginde

Ek properties:

- `bonus_units`
- `bonus_reason`

#### `wallet_opened`

Ne zaman:

- Wallet ekrani acildiginda

Ek properties:

- `wallet_open_reason`

#### `zbd_activation_started`

Ne zaman:

- ZBD SDK initialize / webview akisi baslatildiginda

Ek properties:

- `start_reason`
- `start_surface`

#### `zbd_activation_completed`

Ne zaman:

- ZBD activation basariyla tamamlandiginda

Ek properties:

- `completion_surface`

#### `zbd_activation_failed`

Ne zaman:

- ZBD activation fail oldugunda

Ek properties:

- `error_code`
- `error_category`

### 3.3 Reward Economy

#### `level_reward_calculated`

Ne zaman:

- Level sonu reward hesaplandiginda

Ek properties:

- `remaining_moves`
- `remaining_rocket`
- `remaining_bomb`
- `remaining_disco`
- `base_reward_units`
- `move_reward_units`
- `rocket_reward_units`
- `bomb_reward_units`
- `disco_reward_units`
- `raw_reward_units`
- `streak_multiplier`
- `ad_multiplier`
- `final_reward_units`
- `display_currency_value`

#### `streak_multiplier_applied`

Ne zaman:

- Streak bar final reward'a carpan uyguladiginda

Ek properties:

- `streak_index`
- `streak_multiplier`
- `pre_streak_units`
- `post_streak_units`

#### `rewarded_ad_offer_shown`

Ne zaman:

- Rewarded video teklifi gosterildiginde

Ek properties:

- `offer_surface`
- `offered_multiplier`

#### `rewarded_ad_watched`

Ne zaman:

- Kullanici rewarded ad'i tamamladiginda

Ek properties:

- `offer_surface`
- `watched_multiplier`

#### `rewarded_ad_multiplier_applied`

Ne zaman:

- Reward final'e ad carpanı uygulandiginda

Ek properties:

- `pre_ad_units`
- `post_ad_units`
- `ad_multiplier`

#### `wallet_balance_updated`

Ne zaman:

- Balance artisi wallet state'e yazildiginda

Ek properties:

- `delta_units`
- `display_balance_units`
- `withdrawable_balance_units`
- `fractional_remainder_units`

### 3.4 Payout / Risk

#### `auto_initialize_triggered`

Ne zaman:

- Kullanici threshold'a ulasip otomatik initialize akisina girdiginde

Ek properties:

- `threshold_usd`
- `current_display_usd`
- `trigger_surface`

#### `cashout_screen_opened`

Ne zaman:

- Cashout ekranina girildiginde

Ek properties:

- `display_balance_units`
- `withdrawable_balance_units`

#### `cashout_requested`

Ne zaman:

- Kullanici payout talebi gonderdiginde

Ek properties:

- `requested_units`
- `requested_display_value`

#### `payout_sent`

Ne zaman:

- Provider'a payout istegi basariyla gonderildiginde

Ek properties:

- `sent_units`
- `provider_request_id`

#### `payout_failed`

Ne zaman:

- Provider request fail oldugunda

Ek properties:

- `sent_units`
- `provider_error_code`
- `provider_error_category`

#### `fraud_status_changed`

Ne zaman:

- Fraud state degistiginde

Ek properties:

- `old_status`
- `new_status`
- `fraud_reason`

#### `p2e_disabled_for_user`

Ne zaman:

- Kullanici coin-only fallback moduna alindiginda

Ek properties:

- `disable_reason`
- `fallback_mode`

## 4. KPI Layer

### 4.1 Funnel KPI'lari

- Deeplink -> session classified rate
- Classified targeted -> Level 1 complete rate
- Level 1 complete -> wallet open rate
- Popup shown -> activate CTR
- Activate -> ZBD start rate
- ZBD start -> ZBD complete rate

### 4.2 Economy KPI'lari

- Avg raw reward units per win
- Avg final reward units per active user
- Rewarded ad attach rate
- Rewarded ad uplift
- Avg display balance growth per day
- Time to first withdrawable unit
- Time to threshold reach

### 4.3 Risk / Ops KPI'lari

- Payout request rate
- Payout fail rate
- Pending payout queue size
- Fraud flagged user %
- P2E disabled user %

### 4.4 Business KPI'lari

- D1 retention by bucket
- D7 retention by bucket
- Rewarded revenue per user
- IAP revenue per user
- Total revenue per user
- Reward cost / revenue ratio

## 5. Dashboard Spec

### 5.1 Exec Dashboard

Amac:

- Sistemin is sonucunu tek ekranda gormek

Kartlar:

- P2E eligible users
- Activated users
- ZBD signup rate
- Avg reward cost per active user
- Net revenue uplift
- Payout fail rate

Kirlimlar:

- by country
- by platform
- by AB bucket

### 5.2 PM / LiveOps Dashboard

Amac:

- Funnel ve economy tuning kararlarini desteklemek

Grafikler:

- Activation funnel
- Reward units by level band
- Rewarded ad attach by bucket
- Threshold reach curve
- Welcome bonus conversion impact

Tablolar:

- Country x bucket performance
- Level band x reward config outcome

### 5.3 Ops / Fraud Dashboard

Amac:

- Provider ve risk kaynakli sorunlari hizli yakalamak

Kartlar:

- Payout queue size
- Avg payout latency
- Fail rate by provider code
- Fraud rate by device/country
- P2E disabled users

## 6. Alert Suggestions

- `payout_failed rate > %5` son 1 saat
- `zbd_activation_failed rate > %10` son 1 saat
- `popup_shown -> activate CTR` 3 gun rolling ortalamadan %20 dusus
- `reward cost / revenue ratio` hedef ustu
- `fraud_status_changed` ani spike

## 7. Recommended Ownership

- Product Manager: KPI tanimi ve dashboard karar mantigi
- Analytics: event pipeline, naming, property validation
- Client Engineering: event trigger noktalarinin implementasyonu
- Backend: payout, fraud, provider response eventleri
- LiveOps: config degisiklikleri ve segment bazli takip
