# Collection Implementation Plan B - Tag-Based Reward Router (Different Angle)

## Goal

Collection ekonomisini hizli entegre etmek, ama feature bazli tek tek entegrasyon maliyetini daha da dusurmek.
Ana odak: "odul nereden gelirse gelsin ayni kuralla Collection'a baglansin."

## Core Idea

Source bazli kod yazmak yerine reward slotlarina etiket (tag) eklenir.
Claim aninda router bu tag'i okuyup otomatik karar verir:
- Collection pasifse legacy
- Collection aktifse uygun pack/card reward

## Why This Is Different

- Plan A adapter'i source mapping tablosuna dayanir.
- Plan B merkezi "tag router" ile source bilgisini ikinci plana atar.
- Yeni feature eklendiginde kod degil, sadece reward tag konfigi gerekir.

## Why This Can Be Faster

- Feature bazli degisiklik sayisi azalir.
- Uzun mapping tablolari yerine ortak routing kurali kullanilir.
- Canli operasyon ekibi config uzerinden daha hizli degisim yapar.

## Scope (v1)

1. Reward tag semasi:
  - `COLLECTION_ELIGIBLE`
  - `COLLECTION_PACK_TYPE`
  - `COLLECTION_SOURCE_WEIGHT` (opsiyonel)
2. Unlock + season state + season reset
3. 15x9 card catalog
4. Guided random + guarantee kurallari
5. Duplicate stars + chest economy
6. Completion odulu + badge/frame
7. Animasyon yok, hook/event altyapisi var

## Technical Method

1. `Reward Tag Router`
- Tek pipeline:
  - reward slot tag kontrolu
  - player collection state kontrolu
  - aktif season kart havuzu kontrolu
  - son reward ciktisi uretimi

2. `Catalog-Driven Card Selection`
- Season catalog tek dosyada tutulur (`set`, `card`, `tier`, `is_tradeable`).
- Router her claim'de bu katalogdan secim yapar.

3. `Policy Layer`
- Baslangic garantileri policy olarak ayri tutulur.
- Duplicate stars policy olarak ayri tutulur.
- Ops tarafi policy parametrelerini config'den degistirebilir.

4. `Observability`
- Eventler:
  - `collection_reward_routed`
  - `collection_card_granted`
  - `collection_duplicate_converted`
  - `collection_set_completed`
  - `collection_completed`

5. `Season Bundle Delivery`
- `season_manifest` endpoint'i tag router'dan bagimsiz calisir.
- Manifest: `season_id`, `catalog_version`, `asset_bundle_version`, `asset_list`, `hash`.
- App acilisinda/season refresh'te manifest cekilir, yeni bundle varsa arka planda indirilir.
- Hash dogrulamasi ve minimum bundle readiness saglanmadan yeni sezon aktif edilmez.
- Hata durumunda son stabil bundle + son stabil season pointer ile devam edilir.

## Timeline (Single Engineer)

### Week 1 (Days 1-5)

1. Gun 1: Tag semasi + season catalog yapisi
2. Gun 2-3: Tag router implementasyonu + legacy/collection switch
3. Gun 4: Guided random + guarantee policy
4. Gun 5: Duplicate star policy + chest redemption

### Week 2 (Days 6-10)

1. Gun 6: Client temel ekranlari (animasyonsuz)
2. Gun 7: Completion odulu + badge/frame
3. Gun 8: Season reset + migration
4. Gun 9: Telemetry + sanity dashboard queryleri
5. Gun 10: E2E test + rollout prep

## Expected Delivery Time

- Agresif: 10 is gunu
- Gercekci buffer ile: 11-13 is gunu

## Tradeoffs vs Plan A

1. Artisi: Uzun vadede yeni source eklemek daha ucuz.
2. Artisi: Ops ekibi config ile daha bagimsiz hareket eder.
3. Eksisi: Ilk kurulumda tag standardini dogru oturtmak gerekir.
4. Eksisi: Reward icerik ekibinin tag disiplini gerekir.

## Risks And Controls

1. Risk: Yanlis tag atamasi
- Kontrol: pre-release "tag linter" script + coverage raporu

2. Risk: Router policy cakismalari
- Kontrol: policy precedence dokumani + unit test

3. Risk: Sezon gecisinde yanlis katalog pointer
- Kontrol: season switch checklist + dry-run

## v1.1 Deferred

1. Sosyal trade/request
2. Grand active flow
3. Completion fallback economy detaylari
4. UI polish ve animasyon

## Bundle Impact On Time

- Ek implementasyon maliyeti: +1 ile +2 is gunu
- Guncel toplam sure:
  - Agresif: 11-12 is gunu
  - Gercekci buffer ile: 12-15 is gunu
