# Collection Feature Plan v1 (Royal Match Referansli)

## 1. Erisim ve Sezon Kurallari

- Collection, oyuncu unlock level'a geldiginde veya update sonrasi migration ile acilir.
- Unlock level henuz netlesmedi; config parametresi olarak sonradan degistirilebilir.
- Sezon suresi varsayilan 30 gundur; config ile degistirilebilir.
- Collection acilana kadar isaretli odul slotlari legacy odul verir.
- Collection acilinca ayni slotlar otomatik Collection pack odulune doner.
- Normal Collection tamamlaninca Grand Prize verilir ve sezon badge'i kazanilir.
- Kazanilan badge, profil sayfasindaki cerceve koleksiyonuna eklenir.
- Grand Collection altyapisi hazirdir, v1'de kapalidir (`grand_enabled=false`).
- Sezon sonunda kart ilerlemesi ve duplicate stars sifirlanir; kazanilan badge/frame korunur.
- Yeni sezonda kart havuzu otomatik yeni sezon kartlarina gecer.

## 2. Icerik Mimarisi

- Veri modeli: `Season -> Set -> Card`.
- Set sayisi: 15.
- Set basina kart sayisi: 9.
- Toplam normal sezon karti: 135.
- Kart tipleri: `1*`, `2*`, `3*`, `4*`, `5*`, `Gold Card`.
- Paket tipleri: `Bronze (2)`, `Silver (3)`, `Gold (4)`, `Violet (5)`, `Diamond (6)`, `Rainbow (6)`.
- Not: Diamond kart tipi degil, paket tipidir.

## 3. Kart Kazanim Sistemi

- Tum kaynaklar aktiftir:
  - Battle Pass (free/paid isaretli step)
  - Daily Reward (isaretli gunler)
  - Endless Treasure (isaretli alanlar)
  - Level Chest (isaretli alanlar)
  - Daily Event (isaretli alanlar)
  - Sky Race (isaretli alanlar)
  - Space Mission (isaretli alanlar)
  - Decoration odulleri (isaretli alanlar)
  - 2nd Decoration odulleri (isaretli alanlar)
  - Archery Arena (isaretli alanlar)
  - Sampiyonlar Ligi (isaretli alanlar)
  - Kings Cup (isaretli alanlar)
  - Team Treasure (isaretli alanlar)
  - Offerlar ve in-app shop (isaretli alanlar)
- Direct pack satisi yoktur.
- Offer/In-app paketlerinde yapi korunur; sadece isaretli odul slotlari Collection aktifligine gore degisir.
- Collection aktifken packlerden cikan kartlar her zaman aktif sezon havuzundan gelir.
- Sezon degisince ayni slotlar otomatik yeni sezon kart havuzuna baglanir.
- Tek bir pack aciliminda ayni kart iki kez cikmaz; farkli acilimlarda duplicate gelebilir.

### Guided Random Calisma Kurali

- Oyuncunun unique kart sayisi `U` alinir.
- On set hesaplanir: `F = floor(U / 9) + 1` (max 15).
- Iki havuz acilir:
  - Yakin havuz: `max(1, F-2) .. F`
  - Teaser havuz: `F+1 .. F+2`
- Her kart slotunda:
  - `%80` Yakin havuzdan,
  - `%20` Teaser havuzdan secim yapilir.
- Havuz ici secimde eksik karti daha fazla olan sete daha yuksek sans verilir.
- Pack tipi olasiliklari uygulanir.
- Secilen set+turde yeni kart varsa once yeni kart verilir, yoksa duplicate verilir.

### Baslangic Garanti Kurallari

- Ilk 3 pack: duplicate yok.
- Ilk 5 pack icinde en az 1 yeni `4*`.
- Ilk 12 pack icinde en az 1 yeni `Gold`.

## 4. Duplicate Ekonomisi

- Oyuncu sahip oldugu bir karti tekrar acarsa kart `Duplicate` sayilir.
- Duplicate kartlar dogrudan `Duplicate Star` bakiyesine cevrilir.
- Donusum degeri:
  - `1* -> 1 star`
  - `2* -> 2 stars`
  - `3* -> 3 stars`
  - `4* -> 4 stars`
  - `5* -> 5 stars`
  - `Gold -> 5 stars`
- Oyuncu biriken star ile chest acar:
  - `100 stars`
  - `250 stars`
  - `500 stars`
- Chest icerikleri ve denge degerleri referans sheet'e gore yonetilir:
  - https://docs.google.com/spreadsheets/d/1ip_HoL8AE0QjfRM-Mmiu1uzdN0kdB7oL-zajoXfXsGw/edit?usp=sharing
- Star bakiyesi eksiye dusmez; chest aciminda anlik dusulur.
- Sezon sonunda duplicate stars sifirlanir.
- Collection acilmamis oyuncuda duplicate star birikimi baslamaz; Collection acilinca aktif olur.

## 5. Sosyal Takas ve Istek

- Team chat uzerinden kart istegi acilir.
- Oyuncu gunde 1 kez kart istegi olusturabilir.
- Friend list uzerinden kart gonderimi yapilir.
- Oyuncu gunde 3 kez kart gonderebilir.
- Sadece duplicate ve tradeable kartlar gonderilebilir.
- Tradeable olmayan (ozel) kartlar gonderilemez ve istenemez.
- Oyuncuda zaten bulunan kart icin istek acilamaz.
- Gunluk limit dolunca sayac ve reset zamani UI'da gosterilir.

## 6. Odul ve Prestij Kurgusu

- Her set tamamlandiginda sete ozel odul verilir.
- Tum setler tamamlandiginda `Grand Prize` verilir.
- Collection tamamlayan oyuncu sezon badge'i kazanir.
- Kazanilan badge, profil sayfasindaki cerceve koleksiyonuna eklenir.
- Badge/cerceve kalici prestij ogesidir; sezon sonunda silinmez.
- Grand Collection altyapisi hazir olsa da v1'de kapalidir (`grand_enabled=false`).
- v1'de sadece normal Collection tamamlama odul akisi calisir.
- Odul gosterim hiyerarsisi:
  - Set tamamlamada kucuk/orta odul geri bildirimi
  - Collection tamamlamada buyuk odul + prestij geri bildirimi

## 7. Lifecycle ve Reset Matrisi

- Sistem durumlari:
  - `Locked`
  - `Active-Normal`
  - `Completed-Normal`
  - `Season-Ended`
- Gecisler:
  - `Locked -> Active-Normal`: unlock level veya migration.
  - `Active-Normal -> Completed-Normal`: tum setler tamamlaninca.
  - `Completed-Normal -> Season-Ended`: sezon bitisinde.
  - `Season-Ended -> Active-Normal`: yeni sezon baslangicinda.
- Durum davranislari:
  - `Locked`: legacy odul + kilitli UI.
  - `Active-Normal`: Collection odulleri + aktif ilerleme.
  - `Completed-Normal`: Grand Prize + badge verilir, tamamlandi state'i gosterilir.
  - `Season-Ended`: kart ilerlemesi + duplicate stars resetlenir, badge/frame korunur.
- Sezon gecisinde ayni reward slotlari korunur, aktif kart havuzu yeni sezona doner.

## 8. UX Flow ve Ekranlar

- Entry point (v1): Collection'a giris sadece Home'daki Collection butonu uzerinden yapilir.
- Reward popup deep-link ve Event/Activities menu girisi v1'de yoktur.
- Collection unlock oldugunda info popup yalnizca 1 kez gosterilir.
- Sezon yenilenmelerinde info popup tekrar gosterilmez.
- Yeni sezonda bloklayici popup yerine hafif dikkat cekme (or. red dot) kullanilabilir.
- Locked state: unlock kosulu + kisa aciklama.
- Collection Hub: sezon adi, kalan sure, ilerleme, badge/frame alani.
- Set Grid: 15 set ve her sette `x/9` ilerleme.
- Set Detail: 9 kart slotu + set odulu + uygun ise istek aksiyonu.
- Pack Opening: yeni kart etiketi + duplicate star donusum geri bildirimi.
- Duplicate Stars ekrani: bakiye + `100/250/500` chest + icerik onizleme.
- Sosyal akis: team request + friend send + limit timerlari.
- Completion deneyimi: Grand Prize + badge popup + profile frame geri bildirimi.
- Season end deneyimi: korunanlar (badge/frame), sifirlananlar (kart ilerleme, duplicate stars), yeni sezon mesaji.

## 9. LiveOps ve Icerik Operasyonu

- Her sezon tek icerik paketi yayinlanir (`15x9`, odds, mapping, set odulleri, flags).
- Config-first yonetim kullanilir (unlock, sezon suresi, source mapping, pity, chest icerikleri).
- Isaretli tum odul slotlari merkezi `reward_mapping_table` uzerinden yonetilir.
- Activation gate oyuncu bazli calisir (unlock/migration).
- Sezon gecisinde active season pointer degisir ve reset kurallari uygulanir.
- Completion sonrasi fallback odul tasarimi su an icin `TBD` olarak park edilir.
- Canli denge duzeltmeleri update cikmadan config ile yapilabilir.

## 10. Content Bundle Delivery

- Her sezon icin sunucuda bir `season_manifest` tutulur:
  - `season_id`
  - `config_version`
  - `asset_bundle_version`
  - `asset_list` (dosya yolu, boyut, hash)
  - `min_client_version` (opsiyonel)
- Uygulama acilisinda ve sezon yenileme kontrolunde manifest cekilir.
- Mevcut bundle versiyonu eskiyse assetler CDN'den arka planda indirilir.
- Indirme bitmeden kritik ekranlar aktif edilmez; once hash dogrulamasi yapilir.
- Aktivasyon kurali:
  - Config + zorunlu assetler hazirsa yeni sezon aktif olur.
  - Hazir degilse oyuncu eski stabil bundle ile devam eder.
- Failover kurali:
  - Indirme/dogrulama hatasinda son calisan bundle'a geri donulur.
  - Telemetry event'i atilir ve retry backoff uygulanir.
- Bundle temizlik kurali:
  - Son aktif sezon + bir onceki sezon cihazda tutulur.
  - Daha eski bundle'lar depolama baskisina gore temizlenir.

## 11. Rollout ve Deney Plani

- Kademeli rollout: ic test -> kucuk cohort -> orta cohort -> full rollout.
- Faz gecisi health check sonrasinda yapilir.
- Deney alanlari:
  - Guided random agirliklari
  - Baslangic garanti esikleri
  - Pity davranisi
  - Source yogunluklari
- Sorunda deney durdurulur ve guvenli config'e geri donulur.
- Her deneme icin kisa karar kaydi tutulur: ne denendi, neden denendi, sonuc, sonraki adim.
