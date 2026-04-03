# ZBD Dynamic P2E Operating Model v1

Bu dokuman, paylasilan ZBD planini kayit altina alir ve onu uygulanabilir bir sistem taslagina cevirir:

- Hesaplama modeli
- Takip edilecek veri ve event seti
- LiveOps / mudahale cercevesi
- AB test ve rollout mantigi
- Acik karar noktalar

## 1. Saved Source Summary

Kaynak plandan korunan ana kurallar:

- Kullanici session basinda `targeted` veya `organic` olarak siniflanir.
- `targeted` kullanici P2E-active baslar.
- `organic` kullanici `Activate` demeden BTC/USD kazanci gormez.
- BTC ve USD ayni internal earn unit ile hesaplanir; fark sadece wallet ve payout gosterimindedir.
- Level sonu kazanclari remote config ile yonetilir.
- Targeted ve activated organic kullanicilar streak bar + multiplier sekansini gorur.
- Wallet icinde ZBD activation butonu vardir.
- Belirli bir threshold ustunde kullanici auto initialize / payout hazirligina alinabilir.

## 2. Canonical Reward Model

En onemli urun karari: hesaplama motoru BTC/USD odemesiyle degil, `raw earn unit` ile calismali. Boylece ekonomi tek yerden yonetilir, sadece wallet katmaninda farkli para birimi gosterilir.

### 2.1 Reward Formula

Onerilen standart formul:

```text
raw_reward_units =
  level_win_base
  + (remaining_moves * reward_per_move)
  + (remaining_rockets * reward_per_rocket)
  + (remaining_bombs * reward_per_bomb)
  + (remaining_discos * reward_per_disco)

final_reward_units =
  raw_reward_units
  * streak_multiplier
  * rewarded_ad_multiplier_if_applicable
```

Notlar:

- `streak_multiplier` sadece P2E-active flow icin gorunur ve uygulanir.
- `rewarded_ad_multiplier_if_applicable` reklam izlendiginde devreye girer.
- `final_reward_units` oyuncunun gormesi gereken "real money balance" temelini olusturur.

### 2.2 Wallet Display Conversion

Tek hesaplama, iki gosterim:

```text
btc_display_value = final_reward_units * btc_conversion_rate
usd_display_value = final_reward_units * usd_conversion_rate
```

Burada kritik kural:

- Oyun ici odul mantigi `USD reward` ve `BTC reward` diye ikiye ayrilmaz.
- Sadece `display_currency_type` ve conversion rate degisir.

Bu sayede:

- Economy tuning tek yerden yapilir.
- BTC/USD parity daha kolay korunur.
- AB testlerde sadece conversion veya presentation degistirilebilir.

### 2.3 Integer Payout Rule

ZBD tarafina giden unit tam sayi olmak zorundaysa iki bakiye ayrilmali:

- `display_balance_units`: oyuncunun ekranda gordugu tum birikim
- `withdrawable_balance_units`: payout icin tam sayiya donusen kisim

Onerilen kural:

```text
withdrawable_units = floor(display_balance_units)
remainder_units = display_balance_units - withdrawable_units
```

Bu model:

- Oyuncunun kazanimi kaybolmus gibi hissettirmez.
- Cashout aninda yuvarlama hatasi yaratmaz.
- Fractional kalan bakiyeyi bir sonraki kazanca tasir.

## 3. Remote Config Schema

Mevcut planda iki farkli naming set var. Canli operasyonda hata riskini dusurmek icin tek canonical schema kullanilmali.

### 3.1 Onerilen Config Gruplari

#### Session

- `p2e_entry_mode_by_link`
- `allowed_geo_for_p2e`
- `auto_initialize_threshold_usd`
- `welcome_bonus_units`

#### Reward Economy

- `level_win_base`
- `reward_per_move`
- `reward_per_rocket`
- `reward_per_bomb`
- `reward_per_disco`
- `rewarded_ad_multiplier`
- `streak_multiplier_table`

#### Conversion

- `btc_conversion_rate`
- `usd_conversion_rate`
- `withdraw_unit_size`

#### UI / Copy

- `map_cta_targeted_template`
- `map_cta_organic_text`
- `organic_activate_text`
- `organic_decline_text`
- `level1_p2e_tooltip_text`

### 3.2 Segmented Config Resolution

Config tek deger olmamali; en az su segmentleri desteklemeli:

- `country`
- `platform`
- `ab_bucket`
- `level_band`
- `session_currency_type`

Onerilen precedence:

```text
country + ab_bucket + level_band -> country + level_band -> global + level_band -> global_default
```

### 3.3 Level Band Structure

Baslangic icin:

- `1-100`
- `101-300`
- `301+`

Canliya cikmadan once her band icin beklenen:

- ortalama win reward
- ortalama ad-multiplied reward
- D1/D7 retention etkisi
- ARPDAU uplift / erosion etkisi

## 4. State Model

Onerilen client state:

- `user_entry_source`: `targeted`, `organic`
- `session_currency_type`: `BTC`, `USD`, `NONE`
- `is_p2e_active`
- `is_zbd_initialized`
- `has_seen_info_popup`
- `display_balance_units`
- `withdrawable_balance_units`
- `pending_fractional_units`
- `last_reward_units`
- `current_streak_index`
- `ab_test_bucket`
- `fraud_status`: `clear`, `suspected`, `blocked`

Sunucu tarafinda ayrica tutulmali:

- `lifetime_raw_earned_units`
- `lifetime_withdrawn_units`
- `first_real_money_level`
- `first_zbd_signup_ts`
- `last_payout_status`
- `pending_payout_queue`

## 5. Event Tracking Plan

Bu sistemde sadece event toplamak yetmez; eventleri 4 katmanda dusunmeliyiz:

- acquisition
- activation
- reward economy
- payout / fraud

### 5.1 Core Events

#### Acquisition / Session

- `deeplink_received`
- `session_classified`
- `ab_bucket_assigned`
- `p2e_eligibility_resolved`

Properties:

- `deep_link_type`
- `entry_source`
- `country`
- `is_new_user`
- `ab_bucket`
- `session_currency_type`

#### Onboarding / Activation

- `p2e_cta_shown`
- `p2e_cta_clicked`
- `p2e_info_popup_shown`
- `p2e_info_popup_activate_clicked`
- `p2e_info_popup_decline_clicked`
- `p2e_activated`
- `welcome_bonus_granted`
- `wallet_opened`
- `zbd_activation_started`
- `zbd_activation_completed`
- `zbd_activation_failed`

Properties:

- `screen_name`
- `popup_reason`
- `activation_source`
- `welcome_bonus_units`
- `zbd_error_code`

#### Reward Economy

- `level_reward_calculated`
- `streak_multiplier_applied`
- `rewarded_ad_offer_shown`
- `rewarded_ad_watched`
- `rewarded_ad_multiplier_applied`
- `wallet_balance_updated`

Properties:

- `level_id`
- `level_band`
- `remaining_moves`
- `remaining_rocket`
- `remaining_bomb`
- `remaining_disco`
- `raw_reward_units`
- `streak_multiplier`
- `ad_multiplier`
- `final_reward_units`
- `display_currency_type`
- `display_currency_value`

#### Payout / Risk

- `auto_initialize_triggered`
- `cashout_screen_opened`
- `cashout_requested`
- `payout_sent`
- `payout_failed`
- `fraud_status_changed`
- `p2e_disabled_for_user`

Properties:

- `display_balance_units`
- `withdrawable_units`
- `fractional_remainder_units`
- `threshold_usd`
- `fraud_reason`
- `provider_response_code`

## 6. KPI Framework

Bu feature icin bakilacak KPI'lari 3 seviyeye ayirmak gerekir.

### 6.1 Funnel KPIs

- Deeplink -> Level 1 start rate
- Level 1 complete rate
- Level 1 complete -> wallet click rate
- Info popup -> activate CTR
- Activate -> ZBD start rate
- ZBD start -> ZBD complete rate

### 6.2 Economy KPIs

- Avg raw reward units per win
- Avg final reward units per DAU
- Rewarded ad attach rate
- Rewarded ad uplift on reward units
- Real money balance growth rate
- Withdrawable balance reach time
- Time to first cashout eligible balance

### 6.3 Business / Risk KPIs

- D1 / D7 retention by bucket
- Payer conversion / buyer CVR
- Total revenue per user
- Reward cost as % of ad + IAP revenue
- Payout failure rate
- Fraud-flag rate
- Organic cannibalization rate

## 7. Intervention Playbook

Bu sistem kurulduktan sonra en degerli kisim, ne zaman neye mudahale edecegimizi onceden tanimlamak olacak.

### 7.1 Activation Dusukse

Belirti:

- Popup -> Activate CTR dusuk
- Wallet click var ama activation yok

Mudahale:

- Welcome bonus arttir
- Popup copy sadeleştir
- Wallet CTA'yi daha acik hale getir
- Activate sonrasi anlik "balance fly-in" odulunu belirginlestir

### 7.2 Reward Cost Fazlaysa

Belirti:

- Reward cost / revenue hizla yukseliyor
- Cashout eligible rate cok hizli artiyor

Mudahale:

- `level_win_base` dusur
- `reward_per_move` dusur
- Streak multiplier table yumusat
- Ad multiplier'ini segment bazli azalt

### 7.3 Kullanici Ilgisi Dusukse

Belirti:

- Earn butonuna tik var ama tekrar kullanim yok
- D1 retention targeted cohortta dusuyor

Mudahale:

- Erken flow'da daha hizli "ilk gercek kazanc" hissi ver
- Level 1-10 bandinda odulu artisli kurgula
- Wallet ekraninda progress bar ile cashout yakinligi goster

### 7.4 Fraud veya Provider Sorunu Varsa

Belirti:

- Fraud flag artiyor
- Payout fail spike var

Mudahale:

- Kullaniciyi `coin-only fallback` moduna al
- Yeni payout'lari queue'ya al
- Wallet'ta gecici bilgilendirme goster
- Fraud response mapping'ini telemetry ile kaydet

## 8. Dashboard Recommendation

Tek dashboard yetmez; 3 pano gerekir:

### 8.1 Exec View

- DAU
- Activated user %
- ZBD signup %
- Avg reward cost / user
- Net revenue uplift
- Cashout eligible users

### 8.2 PM / LiveOps View

- Cohort bazli activation funnel
- Level band bazli reward units
- Bucket bazli retention ve revenue
- Welcome bonus performansi
- Auto initialize trigger count

### 8.3 Ops / Fraud View

- Payout queue size
- Payout fail rate
- Avg time to payout
- Fraud status distribution
- Country / device bazli anomaly

## 9. Suggested AB Test Structure

Kaynak nottaki rollout mantigini daha net hale getirmek icin:

### Test 1: Passive vs Active

- Population: US, new users only
- Bucket A: passive
- Bucket B: active
- Goal: P2E onboarding retention'i bozuyor mu, wallet interest yaratiyor mu

### Test 2: Higher Reward vs Passive

- Population: US, new users only
- Bucket A: passive
- Bucket B: active_high_reward
- Goal: Daha yuksek odul activation ve retention'i ne kadar yukari cekiyor

Bu iki testte sabit tutulmasi gerekenler:

- same country
- same acquisition channel mix
- same level band config except reward deltas
- same popup UX unless UX da test ediliyorsa

## 10. Open Decisions

Canliya cikmadan once netlestirilmesi gerekenler:

1. `organic activated` kullaniciya streak multiplier hangi andan itibaren uygulanacak; ayni session mi, bir sonraki win mi?
2. Auto initialize tam olarak hangi ekranda ve hangi UX ile yapilacak?
3. `0.95 USD` threshold sabit mi, config mi?
4. ZBD fraud response mapping nasil normalize edilecek?
5. Offline durumda activation intent, reward accumulation ve payout send nasil ayrisacak?
6. Welcome bonus hangi birimde tutulacak: raw units mi, display currency mi?
7. Cashout icin minimum tam sayi kuralinda kullanicinin fractional bakiyesi UI'da nasil anlatilacak?

## 11. Recommended Next Build Order

Bu sistemi gelistirirken onerilen implementasyon sirasi:

1. Canonical config schema
2. Raw reward calculator
3. Wallet display conversion layer
4. State + persistence model
5. Event instrumentation
6. Wallet activation + auto initialize logic
7. Dashboard + alerting
8. Fraud / fallback handling
