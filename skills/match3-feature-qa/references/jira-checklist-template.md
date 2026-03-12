# Jira Single-Issue QA Checklist Template

## Scope
- [ ] v1 kapsamı net
- [ ] v2 kapsamı ayrı ve pass kriterine dahil değil

## UI and Navigation
- [ ] Yeni giriş noktası doğru konumda ve görünür
- [ ] Eski giriş noktası kaldırılmış
- [ ] Farklı cihaz boyutlarında yerleşim kırılmıyor

## Functional Flow
- [ ] Ana akış beklenen ekrana gidiyor
- [ ] First-time user akışı doğru tetikleniyor
- [ ] Tamamlanan akış sonrası state doğru güncelleniyor

## Data and Rules
- [ ] Kaydetme ve geri açmada veri korunuyor
- [ ] Kurallar/mevcut validasyonlar aynen çalışıyor
- [ ] Yetki sınırları doğru (kendi profilim vs diğer kullanıcı)

## Offline and Sync
- [ ] İnternet yokken kritik akış çalışıyor
- [ ] Offline değişiklik lokal korunuyor
- [ ] Bağlantı gelince backend senkronu tamamlanıyor

## Regression
- [ ] Mevcut ilgili akışlarda regresyon yok
- [ ] Crash/freezing gözlenmiyor
