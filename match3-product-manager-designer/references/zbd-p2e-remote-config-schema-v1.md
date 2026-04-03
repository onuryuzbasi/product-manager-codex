# ZBD P2E Remote Config Schema v1

Bu dokuman, ZBD P2E sistemi icin canonical remote config yapisini tanimlar.
Amac:

- Tum canli ayarlarin tek schema altinda toplanmasi
- Naming karmasasinin onlenmesi
- Segment bazli tuning yapilabilmesi
- AB testlerin config uzerinden yonetilebilmesi

## 1. Config Design Principles

- Reward hesaplama icin tek canonical key set kullanilmali.
- BTC ve USD ayrimi reward logic'te degil, conversion katmaninda olmali.
- Config degerleri seviye bandi ve segment bazli override edilebilmeli.
- Riskli configler icin default fallback zorunlu olmali.

## 2. Top-Level Schema

```json
{
  "p2e_system": {
    "eligibility": {},
    "rewards": {},
    "streak": {},
    "conversion": {},
    "activation": {},
    "wallet": {},
    "cashout": {},
    "ux_copy": {},
    "experiments": {}
  }
}
```

## 3. Eligibility Config

```json
{
  "eligibility": {
    "enabled": true,
    "allowed_countries": ["US"],
    "new_users_only": true,
    "deeplink_modes": {
      "btc": "TARGETED_BTC",
      "usd": "TARGETED_USD",
      "none": "ORGANIC"
    }
  }
}
```

Kullanim:

- Hangi ulkelerde aktif
- Sadece new user mi
- Hangi link tipi hangi entry mode'a baglaniyor

## 4. Reward Config

```json
{
  "rewards": {
    "level_bands": [
      {
        "min_level": 1,
        "max_level": 100,
        "level_win_base": 0.2,
        "reward_per_move": 0.01,
        "reward_per_rocket": 0.01,
        "reward_per_bomb": 0.03,
        "reward_per_disco": 0.05,
        "rewarded_ad_multiplier": 5.0
      }
    ],
    "default_band": {
      "level_win_base": 0.1,
      "reward_per_move": 0.005,
      "reward_per_rocket": 0.01,
      "reward_per_bomb": 0.02,
      "reward_per_disco": 0.03,
      "rewarded_ad_multiplier": 3.0
    }
  }
}
```

Kurallar:

- `level_bands` oncelikli okunur
- Eslesen band yoksa `default_band` kullanilir
- Tum reward degerleri `raw earn unit` uzerinden tanimlidir

## 5. Streak Config

```json
{
  "streak": {
    "enabled_for_p2e_active": true,
    "multiplier_table": [
      { "streak_index": 1, "multiplier": 1.0 },
      { "streak_index": 2, "multiplier": 1.1 },
      { "streak_index": 3, "multiplier": 1.25 },
      { "streak_index": 4, "multiplier": 1.5 },
      { "streak_index": 5, "multiplier": 2.0 }
    ]
  }
}
```

Kurallar:

- Sadece `is_p2e_active = true` durumda kullanilir
- Streak artisi gameplay degil odul carpanini etkiler

## 6. Conversion Config

```json
{
  "conversion": {
    "btc_conversion_rate": 0.000001,
    "usd_conversion_rate": 0.01,
    "display_precision": {
      "BTC": 8,
      "USD": 2
    }
  }
}
```

Kurallar:

- Ayni `final_reward_units` iki farkli para formatina cevirebilir
- Conversion wallet/display katmanina aittir

## 7. Activation Config

```json
{
  "activation": {
    "organic_requires_manual_activate": true,
    "targeted_auto_active": true,
    "show_targeted_info_popup_once": true,
    "show_organic_popup_until_activate": true,
    "welcome_bonus_units": 10.0
  }
}
```

Kurallar:

- Welcome bonus raw unit cinsinden tutulur
- Organic activate sonrasi bonus eklenirse event ile loglanir

## 8. Wallet Config

```json
{
  "wallet": {
    "show_amount_for_active_users": true,
    "show_earn_label_for_inactive_users": true,
    "zbd_activation_button_enabled": true
  }
}
```

## 9. Cashout Config

```json
{
  "cashout": {
    "auto_initialize_threshold_usd": 0.95,
    "integer_payout_only": true,
    "withdraw_rounding_mode": "FLOOR",
    "min_withdrawable_units": 1
  }
}
```

Kurallar:

- `withdraw_rounding_mode` ilk versiyonda `FLOOR` kalmali
- Fractional units cashout'a gitmez, balance'ta tasinmaya devam eder

## 10. UX Copy Config

```json
{
  "ux_copy": {
    "map_cta_targeted_template": "{amount} {currency_icon}",
    "map_cta_organic_text": "Earn",
    "organic_activate_text": "Activate",
    "organic_decline_text": "No Thanks",
    "level1_p2e_tooltip_text": "Play to Earn"
  }
}
```

## 11. Experiment Config

```json
{
  "experiments": {
    "us_new_user_launch_test": {
      "enabled": true,
      "population": {
        "countries": ["US"],
        "new_users_only": true
      },
      "buckets": [
        {
          "name": "passive",
          "weight": 50,
          "overrides": {
            "activation.targeted_auto_active": false
          }
        },
        {
          "name": "active",
          "weight": 50,
          "overrides": {
            "activation.targeted_auto_active": true
          }
        }
      ]
    }
  }
}
```

Not:

- Override path mantigi backend ya da remote-config wrapper katmaninda cozulebilir
- Bucket bazli reward tuning ayri testte tanimlanmali

## 12. Resolution Order

Config okuma sirasi:

1. experiment bucket override
2. country override
3. level band override
4. global default

Onerilen teknik davranis:

- Resolve edilen final config runtime'da tek object olarak cache'lensin
- Her session basinda `config_snapshot_id` uretilsin
- Reward eventlerine bu snapshot id property olarak gecilsin

## 13. Validation Rules

- `level_win_base >= 0`
- tum reward per-x degerleri `>= 0`
- `rewarded_ad_multiplier >= 1`
- `welcome_bonus_units >= 0`
- `auto_initialize_threshold_usd > 0`
- `withdraw_rounding_mode` whitelist kontrolu
- level band'ler overlap etmemeli

## 14. Recommended First Release Defaults

- Country: `US`
- New users only: `true`
- Cashout rounding: `FLOOR`
- Threshold: `0.95 USD`
- Welcome bonus: kucuk ama hissedilir bir unit
- Streak: aktif ama agresif olmayan multiplier table

## 15. Open Implementation Questions

1. Country override ve experiment override ayni anda gelirse ownership kimde olacak?
2. Conversion rate ne siklikla guncellenecek?
3. `welcome_bonus_units` first-session mi, first-activation mi?
4. Threshold degeri display USD mi yoksa provider-side USD mi?
