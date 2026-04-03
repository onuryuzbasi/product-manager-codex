# ZBD P2E Reward Calculation + Payout State Machine v1

Bu dokuman, kullanicinin kazancinin nasil hesaplanacagini ve payout akisinin hangi state'lerden gececegini tanimlar.
Amac:

- Reward logic'i deterministic yapmak
- UI state karmaşasını azaltmak
- Payout mismatch ve retry riskini kontrol etmek

## 1. Core Design Rule

Uc farkli katman birbirinden ayrilmali:

- Reward calculation
- Wallet display
- Payout transfer

Bu uc katman birbirine bagli ama ayni sey degil.

## 2. Reward Calculation Flow

### 2.1 Inputlar

- `level_id`
- `level_band`
- `remaining_moves`
- `remaining_rockets`
- `remaining_bombs`
- `remaining_discos`
- `streak_index`
- `rewarded_ad_watched`
- `config_snapshot`
- `is_p2e_active`

### 2.2 Calculation Rule

```text
base_units = level_win_base
move_units = remaining_moves * reward_per_move
rocket_units = remaining_rockets * reward_per_rocket
bomb_units = remaining_bombs * reward_per_bomb
disco_units = remaining_discos * reward_per_disco

raw_reward_units =
  base_units +
  move_units +
  rocket_units +
  bomb_units +
  disco_units

streaked_reward_units =
  raw_reward_units * streak_multiplier

final_reward_units =
  streaked_reward_units * ad_multiplier_if_any
```

### 2.3 Branch Rule

- `is_p2e_active = false` ise standart coin flow kullanilir
- `is_p2e_active = true` ise P2E reward flow kullanilir

Organic activate eden kullanici icin karar noktasi:

- Oneri: `Activate` sonrasi ilk bir sonraki win ekranindan itibaren P2E reward flow'a gecis

## 3. Wallet Balance Model

Iki farkli bakiye tutulmali:

- `display_balance_units`
- `withdrawable_balance_units`

Ve bir de kalan kusurat:

- `fractional_remainder_units`

Guncelleme kuralı:

```text
display_balance_units += final_reward_units
withdrawable_balance_units = floor(display_balance_units)
fractional_remainder_units =
  display_balance_units - withdrawable_balance_units
```

Bu modelde:

- Oyuncu tum kazancini gorur
- Provider sadece tam sayi kadar unit alir
- Kusurat kaybolmaz

## 4. Currency Display Layer

Wallet ekraninda:

```text
btc_display = display_balance_units * btc_conversion_rate
usd_display = display_balance_units * usd_conversion_rate
```

Cashout ekraninda:

```text
withdrawable_btc_display =
  withdrawable_balance_units * btc_conversion_rate

withdrawable_usd_display =
  withdrawable_balance_units * usd_conversion_rate
```

Bu ayrim gereklidir cunku:

- Kullanici 10.7 unit gormus olabilir
- Ama sadece 10 unit gonderilebilir

## 5. State Machine

### 5.1 User State Definitions

- `INACTIVE_ORGANIC`
- `ACTIVE_P2E_NOT_INITIALIZED`
- `INITIALIZING_ZBD`
- `ACTIVE_P2E_INITIALIZED`
- `PAYOUT_READY`
- `PAYOUT_PENDING`
- `PAYOUT_FAILED_RETRYABLE`
- `PAYOUT_BLOCKED_FRAUD`
- `COIN_ONLY_FALLBACK`

### 5.2 State Meanings

#### `INACTIVE_ORGANIC`

- Earn butonu gorur
- BTC/USD value gormez
- Reward coin olarak akar

#### `ACTIVE_P2E_NOT_INITIALIZED`

- Reward P2E units olarak birikir
- Wallet acilabilir
- ZBD activation henuz tamamlanmamistir

#### `INITIALIZING_ZBD`

- SDK/webview akisi devam eder
- Kullanici duplicate initialize'a zorlanmamali

#### `ACTIVE_P2E_INITIALIZED`

- P2E reward birikimi aktif
- Wallet ve payout hazirdir

#### `PAYOUT_READY`

- Kullanici threshold veya min withdrawable seviyesine gelmistir
- Cashout ya da auto initialize mantigi devreye girebilir

#### `PAYOUT_PENDING`

- Provider'a istek atilmistir
- Sonuc beklenir

#### `PAYOUT_FAILED_RETRYABLE`

- Request fail olmustur
- Tekrar denenebilir

#### `PAYOUT_BLOCKED_FRAUD`

- Fraud veya provider block donmustur
- Real money mode durdurulabilir

#### `COIN_ONLY_FALLBACK`

- Kullanici artik coin flow'una alinmistir
- P2E odul loop'u kapatilir

## 6. State Transitions

### 6.1 Entry / Activation

```text
targeted user -> ACTIVE_P2E_NOT_INITIALIZED
organic user -> INACTIVE_ORGANIC
INACTIVE_ORGANIC + activate_click -> ACTIVE_P2E_NOT_INITIALIZED
ACTIVE_P2E_NOT_INITIALIZED + zbd_start -> INITIALIZING_ZBD
INITIALIZING_ZBD + zbd_success -> ACTIVE_P2E_INITIALIZED
INITIALIZING_ZBD + zbd_fail -> ACTIVE_P2E_NOT_INITIALIZED
```

### 6.2 Reward / Threshold

```text
ACTIVE_P2E_NOT_INITIALIZED + reward_accumulates -> ACTIVE_P2E_NOT_INITIALIZED
ACTIVE_P2E_INITIALIZED + reward_accumulates -> ACTIVE_P2E_INITIALIZED
ACTIVE_P2E_* + threshold_reached -> PAYOUT_READY
PAYOUT_READY + auto_initialize_needed -> INITIALIZING_ZBD
```

### 6.3 Cashout / Provider

```text
PAYOUT_READY + cashout_request -> PAYOUT_PENDING
PAYOUT_PENDING + payout_success -> ACTIVE_P2E_INITIALIZED
PAYOUT_PENDING + payout_fail_retryable -> PAYOUT_FAILED_RETRYABLE
PAYOUT_FAILED_RETRYABLE + retry -> PAYOUT_PENDING
PAYOUT_PENDING + fraud_block -> PAYOUT_BLOCKED_FRAUD
PAYOUT_BLOCKED_FRAUD -> COIN_ONLY_FALLBACK
```

## 7. Auto Initialize Rule

Onerilen kural:

- Kullanici `display USD >= auto_initialize_threshold_usd` oldugunda kontrol edilir
- Eger `is_zbd_initialized = false` ise auto initialize akisi tetiklenir
- Bu karar wallet ekranina bagli kalmamali; session-safe bir kontrol olmali

Ancak UX olarak:

- Ani ve baglamsiz pop-up olmasin
- Win sonrasi ya da wallet acilisinda context icinde gosterilsin

## 8. Offline Handling

Offline senaryoda uc sey ayrismali:

- reward calculation
- activation intent
- payout transfer

### 8.1 Reward

- Reward calculation local tamamlanabilir
- Balance local pending state ile artirilabilir

### 8.2 Activation

- `zbd_activation_started` local intent olarak tutulabilir
- Gercek success server/provider donusu olmadan finalize edilmemeli

### 8.3 Payout

- Offline iken payout request immediate fail yerine queue'ya alinmali
- Queue state UI'da ayrica belirtilmeli

## 9. Fraud Handling

Provider fraud donerse:

- `fraud_status = blocked`
- Yeni payout durdurulur
- Kullanici `COIN_ONLY_FALLBACK` ya da `P2E_LOCKED` benzeri bir mode'a alinabilir

PM karari gereken nokta:

- Var olan birikim ne olacak
- Kullaniciya hangi metinle bilgi verilecek

## 10. QA Critical Cases

- Organic kullanici activate etmeden BTC/USD gormemeli
- Targeted kullanici first session'da P2E-active olmali
- Fractional balance gorunurken cashout sadece floor unit kadar istemeli
- Auto initialize threshold bir kez ve dogru anda tetiklenmeli
- ZBD fail sonrasi state geri donmeli ama balance kaybolmamali
- Fraud block sonrasi yeni P2E reward gosterim mantigi net olmali

## 11. Recommended Engineering Split

- Client:
  reward calculation trigger, UI state, local persistence
- Backend:
  payout queue, provider mapping, fraud handling
- Shared/Product logic:
  config resolve, threshold rule, rounding policy
