DENEME EVENT - Haftalik Dashboard

Locale Notu:
- Google Sheets locale TR oldugunda XLSX importu bazen tum formulleri #ERROR yapabilir.
- En stabil yontem: asagidaki Apps Script kurulumunu kullanmak.

Hazir Script Dosyasi:
- DENEME_EVENT_GoogleSheets_Kurulum.gs

Kurulum (Google Sheets):
1) Bos bir Google Sheet ac.
2) Extensions > Apps Script menuune gir.
3) Acilan editorun icine DENEME_EVENT_GoogleSheets_Kurulum.gs dosyasinin tamamini yapistir.
4) kurDenemeEventDashboard fonksiyonunu Run et.
5) Ilk calistirmada izin ver.

Olusan Sekmeler:
- Event_Girdi: Event datasi girilen sayfa
- Hafta_Ozet: Haftalik hesaplar (otomatik formullu)
- Dashboard: KPI + haftalik ozet + trend

Not:
- Event eklerken Baslangic/Bitis sutunlari tarih formatinda kalmali.
- Aktif eventler icin G sutununda "Evet" olmasi gerekir.
