# Match-3 LiveOps Economy Dashboard Plan v1

## 1) Issue Framing

- Issue title: LiveOps entegre sade game economy dashboard
- Issue type: feature + operating model
- Player problem: Oyuncu bazen kaynaksiz kalip progresyonda surtunme yasiyor, bazen de fazla kaynak biriktirip harcama ihtiyaci hissetmiyor.
- Product objective: Harcama davranisini arttirirken oyuncuyu "resource dead-end"e sokmadan saglikli ekonomi gerilimi kurmak.
- Success signal: Spend rate artarken retention, frustration, ve hard-stop oranlari bozulmuyor.

## 2) Current State and Context

- Current behavior: Economy kararlarinin level design, LiveOps, ve monetization tarafinda ortak bir kontrol paneli yok.
- Desired behavior: Tek ekranda kolay okunan, aksiyona baglanan, segment ve level-band kirilimi olan bir ekonomi health paneli olmali.
- Why now: Harcamayi arttirmak icin yalnizca fiyat veya reward ayarlamak yetmez; source/sink dengesi ve level zorlugu ayni panelde okunmali.
- Related prior decisions:
  - Reward ve economy tuning config-snapshot bazli yorumlanmali.
  - Segment bazli override mantigi country, AB bucket, ve level band seviyesinde desteklenmeli.

## 3) Recommended Dashboard Shape

Dashboard tek sayfa olmali ve 4 bloktan olusmali:

### A. Executive Health Strip

- Active users
- Economy health score
- Source / sink ratio
- Spend session rate
- Zero-balance session rate
- Hoarding rate

Bu alan 30 saniyede okunmali. Her kartta mevcut deger, 7 gun once farki, hedef aralik, ve risk rengi olmali.

### B. Resource Flow Block

- Main source'lar: level win reward, daily reward, event grants, compensation, purchase bonus
- Main sink'ler: pre-level booster spend, mid-level continue spend, fail recovery spend, shop spend
- Net balance delta per active user
- Median end-of-day soft balance
- P25 / P50 / P75 balance dagilimi

Bu blok "sistem oyuncuya ne kadar veriyor, oyuncu ne kadar geri harciyor" sorusunu cevaplar.

### C. Friction and Spend Block

- Resource-gated fail streak rate
- Spend-to-save win rate
- Booster purchase attach rate
- Continue offer accept rate
- Spend sonrasinda D1/D7 retention uplift
- "No resource + churn risk" cohort size

Bu blok harcamanin faydali mi yoksa cezalandirici mi oldugunu gosterir.

### D. Segments and Level Design Block

- Level band bazli source / sink ratio
- Level band bazli zero-balance rate
- Segment bazli spend rate
- Outlier level listesi: beklenenin ustunde fail, spend, veya drop yaratan level'lar
- Son 7 gunde uygulanan config / level design degisiklik listesi

Bu blok LiveOps ve level design kararlarini ayni okuma yuzeyine getirir.

## 4) Minimum KPI Set

Asiri kompleks olmamak icin ilk versiyonda su KPI'lar yeterli:

1. `source_sink_ratio = total_sources / total_sinks`
2. `spend_session_rate = spend_sessions / active_sessions`
3. `zero_balance_session_rate = sessions_ending_with_0 / active_sessions`
4. `hoarding_rate = users_above_soft_balance_cap / active_users`
5. `median_soft_balance`
6. `resource_gated_fail_rate = fail_sessions_with_insufficient_resources / fail_sessions`
7. `spend_rescue_rate = wins_after_spend / spend_sessions`
8. `level_band_pressure_index = sink_per_user / source_per_user` by level band

Not: Tek bir "health score" gosterilebilir ama arkadaki karar mantigi bu 8 KPI uzerinden kurulmalidir.

## 5) Which Data Should Feed It

Zorunlu veri katmanlari:

- Daily user grain:
  - user_id
  - date
  - level_band
  - payer_status
  - soft_balance_start
  - soft_balance_end
  - total_sources
  - total_sinks
  - total_spend_events
  - fail_count
  - win_count
- Session / level grain:
  - level_id
  - level_band
  - fail_reason
  - booster_inventory_before
  - booster_inventory_after
  - continue_offer_shown
  - continue_offer_accepted
  - spend_amount
- Config grain:
  - config_snapshot_id
  - reward values
  - sink prices
  - event multipliers
- Change log grain:
  - level difficulty change
  - booster price change
  - reward grant change
  - event start/end

Olmasi iyi ama v1 icin zorunlu olmayanlar:

- Acquisition channel
- Country
- Device tier
- Purchase bundle exposure

## 6) How To Decide the "Right" Values

Dogru deger tek bir evrensel sayi degil; cohort ve level-band bazli saglikli aralik olmalidir.

Karar mantigi:

1. Son 8-12 haftalik gercek data ile baseline cikar.
2. Oyunculari level band + payer status + balance state'e gore ayir.
3. Her segment icin P25 / P50 / P75 dagilimlarini hesapla.
4. Asiri dusuk spend ve asiri yuksek resource birikimini ayni anda minimize eden araligi sec.
5. Yeni hedefleri retention ve revenue guardrail'leri ile birlikte test et.

V1 icin baslangic hedef araliklari:

- `source_sink_ratio`: 0.9 - 1.1
- `zero_balance_session_rate`: %8 - %15
- `hoarding_rate`: <%20
- `spend_session_rate`: %18 - %35
- `resource_gated_fail_rate`: <%25
- `spend_rescue_rate`: >%35

Bu hedefler final kural degil, ilk kontrol bandidir. Gercek oyunda level curve ve reward cadence'e gore yeniden kalibre edilmelidir.

## 7) How To Optimize Toward the Best State

Temel prensip:
Oyuncu arada baski hissetmeli ama "oynayamiyorum" noktasina dusmemeli.

Optimizasyon sirasi:

1. Reward source degil once sink ihtiyacini analiz et.
2. Harcama yaratan anlarin faydali olup olmadigini olc.
3. Sorun global mi, belirli segmentte mi, level-band'de mi bak.
4. Once segment bazli tuning yap, en son global tuning yap.
5. Level design kaynakli surtunmeyi economy problemi gibi okumamaya dikkat et.

Ana tuning levelleri:

- Reward cadence
- Booster fiyatlari
- Continue teklif degeri
- Level fail pressure
- Event grant miktari
- Shop bundle placement

Onerilen haftalik operasyon dongusu:

1. Pazartesi: KPI ve outlier level review
2. Sali: Hipotez ve segment secimi
3. Carsamba: Config / level tweak
4. Persembe-Cuma: Impact check
5. Pazartesi sonrasi: Retention ve monetization validation

## 8) Should Level Design Changes Be Included

Evet, kesinlikle dahil edilmeli.

Neden:

- Ekonomi baskisinin buyuk kismi level zorlugu ve fail pattern'lerinden gelir.
- Bir level band fazla fail urettiginde sink artar ama bu "saglikli harcama" olmayabilir.
- Ayni ekonomi ayari farkli level curve'lerde cok farkli sonuc verir.

En sade entegrasyon modeli:

- Dashboard'ta tum level'lari degil level band'leri goster.
- Ayrica en kritik 10 outlier level'i ayrica listele.
- Her economy grafiğinde son config ve level-design degisiklik isaretleri olsun.

## 9) Segmentation Model

V1 icin 4 ana segment yeterli:

1. Progression segmenti
   - early: 1-50
   - mid: 51-200
   - late: 201+
2. Economy state segmenti
   - starved: son 3 session'in 2'sinde balance 0'a inenler
   - healthy: hedef bantta kalanlar
   - hoarder: P80 ustu balance tasiyanlar
3. Monetization segmenti
   - non-payer
   - light payer
   - payer
4. Behavior segmenti
   - spender
   - saver
   - struggler

Sonraki asamada bu segmentlere ayri uygulamalar yapilabilir:

- starved -> rescue pack, softer fail recovery, temporary reward uplift
- hoarder -> higher-value sinks, cosmetic/meta spend hooks, event-specific spend nudges
- struggler -> easier continue value, level difficulty relief, contextual booster suggestion
- saver -> limited-time sink urgency, bundle framing, inventory expiry olmayan ama kullanimi tetikleyen teklifler

Kural:
Segment bazli aksiyonlar reward inflation yaratmamali; once sink / offer / presentation farklilastirilmali, sonra gerekiyorsa source ayari yapilmali.

## 10) Real Data System Proposal

Direkt gercek data ile calisacak sistem su sekilde kurulabilir:

- Source table: daily economy fact table
- Supporting tables:
  - level result fact
  - spend event fact
  - config snapshot dimension
  - change log dimension
- Dashboard refresh:
  - gunluk ana refresh
  - kritik kartlar icin 4 saatlik incremental refresh

Basit karar kurallari:

- `zero_balance_session_rate` artiyor ve `spend_rescue_rate` dusuyorsa:
  - once ilgili level band fail pressure kontrol et
  - sonra continue offer ve booster fiyatina bak
- `hoarding_rate` artiyor ve `spend_session_rate` dusuyorsa:
  - sink degerini veya sink gorunurlugunu artir
- `source_sink_ratio > 1.15` ise:
  - grants ve rewards'i segment bazli kis
- `source_sink_ratio < 0.85` ise:
  - level zorlugu ve forced spend baskisini incele

## 11) Risks and Mitigations

- Risk: Harcamayi arttirmak icin kaynak fazla kisilabilir.
  - Severity: high
  - Mitigation: zero-balance ve churn-risk cohort'u guardrail yap.
- Risk: Level design sorunu economy tuning ile maskelenebilir.
  - Severity: high
  - Mitigation: level-band ve outlier level panelini zorunlu kil.
- Risk: Segment sayisi erken donemde fazla artabilir.
  - Severity: medium
  - Mitigation: v1'de 4 ana segment disina cikma.
- Risk: Dashboard cok metric dolu olur ve aksiyon uretemez.
  - Severity: medium
  - Mitigation: ilk versiyonu 8 KPI ile sinirla.

## 12) Decision Log

- Confirmed:
  - Dashboard sade ve LiveOps dashboard'a entegre olacak.
  - Amac harcamayi arttirmak ama oyuncuyu kaynak dead-end'ine sokmamak.
  - Segment bazli yorum ve sonraki aksiyonlar gerekli.
  - Level design etkisi dashboard'a dahil edilmeli.
- Assumed:
  - Ana ekonomi konusu soft currency / booster economy tarafinda.
  - Event grants, reward grants, ve sink davranislari event takviminden etkileniyor.
  - Mevcut data pipeline config snapshot ve level result datasi tutabilecek durumda veya genisletilebilir.
- Unknown:
  - Gercek currency isimleri ve mevcut source/sink listesi
  - Su anki spend baselines ve balance dagilimlari
  - Mevcut LiveOps dashboard tech stack'i
  - Segmentlerin hangi CRM / remote config sistemiyle aksiyona cevrilecegi

## 13) Recommended Next Steps

1. Mevcut event ve table'lari bu KPI listesine map et.
2. Son 60-90 gun data ile baseline hesapla.
3. V1 dashboard wireframe'ini LiveOps panel yapisina gore cikar.
4. Segment tanimlarini analytics tarafinda freeze et.
5. Ilk 2 haftalik test icin target araliklari ve alert threshold'larini belirle.
