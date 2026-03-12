# Collection Implementation Plan A - Adapter Overlay (Time-Optimized)

## Goal

Collection feature'i tek kiside en kisa surede canliya alinabilir hale getirmek.
Hedef korunur: odul ekonomisini Collection'a baglamak ve retention hedefini desteklemek.

## Core Idea

Yeni bir sistem yazmak yerine mevcut reward claim akisinin ustune ince bir "Collection Adapter" katmani eklenir.
Mevcut feature odulleri ayni kalir; yalnizca claim aninda "legacy mi collection mi" karari verilir.

## Why This Is Faster

- Kaynak feature bazli ozel kod yazimi minimuma iner.
- Yeni UI akislarinin sayisi dusuk kalir.
- Migration ve data tasima karmaşasi azalir.
- Config ile canli tuning yapilabildigi icin tekrar deploy ihtiyaci azalir.

## Scope (v1)

1. Unlock + season state + season reset
2. 15 set x 9 card modeli
3. Reward mapping adapter (tum isaretli kaynaklar)
4. Guided random (sade calisir kural)
5. Baslangic garanti kurallari (3/5/12)
6. Duplicate stars + 100/250/500 chest
7. Completion odulu + badge/frame kaliciligi
8. Animasyon yok, sadece event hook altyapisi

## Technical Method

1. `Reward Adapter`
- Tek nokta: reward claim pipeline.
- Girdi: reward slot, player state, active season.
- Cikti: legacy reward veya collection pack reward.

2. `Collection State`
- Oyuncu bazli minimum state:
  - `unlocked`
  - `season_id`
  - `set_progress`
  - `owned_cards`
  - `duplicate_star_balance`

3. `Guided Random Runtime`
- U -> F hesaplamasi (mevcut kural).
- Near/teaser havuz secimi.
- Pack icinde duplicate engeli.
- Yeni kart yoksa duplicate -> star donusumu.

4. `Ops Config`
- unlock level
- aktif season
- source->pack mapping
- odds ve guarantee parametreleri
- kill-switch

5. `Season Bundle Delivery`
- `season_manifest` endpoint'i eklenir (`season_id`, `asset_bundle_version`, `asset_list`, `hash`).
- App acilisinda manifest cekilir, yeni bundle varsa arka planda CDN'den indirilir.
- Hash dogrulamasi basarili olmadan yeni sezon aktif edilmez.
- Hata durumunda son stabil bundle kullanilir ve retry backoff uygulanir.

## Timeline (Single Engineer)

### Week 1 (Days 1-5)

1. Gun 1: State modeli, config semasi, season pointer
2. Gun 2-3: Reward adapter + tum kaynaklarin mapping entegrasyonu
3. Gun 4: Guided random + pack draw
4. Gun 5: Guarantee kurallari + duplicate stars altyapisi

### Week 2 (Days 6-10)

1. Gun 6: 100/250/500 chest flow
2. Gun 7: Client temel ekran akislari (animasyonsuz)
3. Gun 8: Completion odulu + badge/frame yazimi
4. Gun 9: Season reset + migration edge-case
5. Gun 10: Smoke/regression + rollout hazirligi

## Expected Delivery Time

- Agresif: 10 is gunu
- Gercekci buffer ile: 12 is gunu

## Risks And Controls

1. Risk: Kaynak bazli mapping eksik kalmasi
- Kontrol: source coverage checklist + pre-release dry run

2. Risk: Economy dengesinin erken bozulmasi
- Kontrol: canli odds config + kill-switch

3. Risk: Season reset buglari
- Kontrol: season transition test matrix + rollback snapshot

## v1.1 Deferred

1. Sosyal trade/request
2. Grand active flow
3. Completion fallback economy detaylari
4. Gelismis UI polish ve animasyon

## Bundle Impact On Time

- Ek implementasyon maliyeti: +1 ile +2 is gunu
- Guncel toplam sure:
  - Agresif: 11-12 is gunu
  - Gercekci buffer ile: 13-14 is gunu
