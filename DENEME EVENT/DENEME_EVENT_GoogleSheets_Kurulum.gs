function kurDenemeEventDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var eventSheet = upsertSheet_(ss, "Event_Girdi");
  var haftaSheet = upsertSheet_(ss, "Hafta_Ozet");
  var dashboardSheet = upsertSheet_(ss, "Dashboard");

  setupEventGirdi_(eventSheet);
  setupHaftaOzet_(haftaSheet);
  setupDashboard_(dashboardSheet);

  SpreadsheetApp.flush();
}

function upsertSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  } else {
    sheet.clear();
    sheet.clearConditionalFormatRules();
  }
  return sheet;
}

function setupEventGirdi_(sheet) {
  var headers = [
    "Event_Adi",
    "Tip",
    "Baslangic",
    "Bitis",
    "Priority",
    "Deeplink_Etkinlik",
    "Aktif",
    "Queue_Order",
    "Cooldown_Gun",
    "Not"
  ];

  var sampleRows = [
    ["UA Deeplink Decor", "UA", new Date("2026-12-01"), new Date("2027-01-20"), 99, "Evet", "Evet", 0, 3, "Deeplink her zaman once"],
    ["Thanksgiving Decor", "Sezonluk", new Date("2026-12-15"), new Date("2026-12-25"), 1, "Hayir", "Evet", 1, 2, "Kisa sureli sezon"],
    ["Christmas Decor", "Sezonluk", new Date("2026-12-01"), new Date("2026-12-31"), 2, "Hayir", "Evet", 2, 2, "Aralik boyunca aktif"],
    ["UA Ocak Decor", "UA", new Date("2027-01-01"), new Date("2027-01-10"), 5, "Hayir", "Evet", 3, 3, "Yilin ilk UA eventi"]
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleRows.length, headers.length).setValues(sampleRows);

  var yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Evet", "Hayir"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("F2:G200").setDataValidation(yesNoRule);

  sheet.getRange("C2:D200").setNumberFormat("dd.mm.yyyy");
  sheet.getRange("E2:E200").setNumberFormat("0");
  sheet.getRange("H2:I200").setNumberFormat("0");

  sheet.setFrozenRows(1);
  sheet.getRange("A1:J1").setFontWeight("bold").setBackground("#e8f0fe");
  sheet.autoResizeColumns(1, 10);
}

function setupHaftaOzet_(sheet) {
  var headers = [
    "Hafta_No",
    "Hafta_Baslangic",
    "Hafta_Bitis",
    "Tarih_Araligi",
    "Aktif_Eventler",
    "Cakisma_Max",
    "Winner_Organik",
    "Winner_Deeplink",
    "Queue_Gorunum",
    "Durum"
  ];

  var rowStart = 2;
  var rowEnd = 60;

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange("A1:J1").setFontWeight("bold").setBackground("#e8f0fe");

  for (var r = rowStart; r <= rowEnd; r++) {
    var prev = r - 1;

    sheet.getRange(r, 1).setFormula('=IF(B' + r + '="","","W"&ROW()-1)');

    if (r === rowStart) {
      sheet.getRange(r, 2).setFormula('=IFERROR(MIN(FILTER(Event_Girdi!$C$2:$C,Event_Girdi!$G$2:$G="Evet"))-WEEKDAY(MIN(FILTER(Event_Girdi!$C$2:$C,Event_Girdi!$G$2:$G="Evet")),2)+1,"")');
    } else {
      sheet.getRange(r, 2).setFormula('=IF(B' + prev + '="","",IF(B' + prev + '+7<=MAX(FILTER(Event_Girdi!$D$2:$D,Event_Girdi!$G$2:$G="Evet"))+6,B' + prev + '+7,""))');
    }

    sheet.getRange(r, 3).setFormula('=IF(B' + r + '="","",B' + r + '+6)');
    sheet.getRange(r, 4).setFormula('=IF(B' + r + '="","",TEXT(B' + r + ',"dd mmm")&" - "&TEXT(C' + r + ',"dd mmm"))');
    sheet.getRange(r, 5).setFormula('=IF(B' + r + '="","",IFERROR(TEXTJOIN(", ",TRUE,FILTER(Event_Girdi!$A$2:$A,Event_Girdi!$G$2:$G="Evet",Event_Girdi!$C$2:$C<=C' + r + ',Event_Girdi!$D$2:$D>=B' + r + ')),""))');
    sheet.getRange(r, 6).setFormula('=IF(B' + r + '="","",MAX(ARRAYFORMULA(COUNTIFS(Event_Girdi!$C$2:$C,"<="&SEQUENCE(7,1,B' + r + ',1),Event_Girdi!$D$2:$D,">="&SEQUENCE(7,1,B' + r + ',1),Event_Girdi!$G$2:$G,"Evet"))))');
    sheet.getRange(r, 7).setFormula('=IF(B' + r + '="","",IFERROR(INDEX(SORT(FILTER(Event_Girdi!$A$2:$E,Event_Girdi!$G$2:$G="Evet",Event_Girdi!$F$2:$F<>"Evet",Event_Girdi!$C$2:$C<=B' + r + ',Event_Girdi!$D$2:$D>=B' + r + '),5,TRUE,3,TRUE,1,TRUE),1,1),""))');
    sheet.getRange(r, 8).setFormula('=IF(B' + r + '="","",IFERROR(INDEX(SORT(FILTER(Event_Girdi!$A$2:$F,Event_Girdi!$G$2:$G="Evet",Event_Girdi!$F$2:$F="Evet",Event_Girdi!$C$2:$C<=B' + r + ',Event_Girdi!$D$2:$D>=B' + r + '),3,TRUE,1,TRUE),1,1),G' + r + '))');
    sheet.getRange(r, 9).setFormula('=IF(B' + r + '="","",IFERROR(TEXTJOIN(" > ",TRUE,INDEX(SORT(FILTER(Event_Girdi!$A$2:$H,Event_Girdi!$G$2:$G="Evet",Event_Girdi!$C$2:$C<=B' + r + ',Event_Girdi!$D$2:$D>=B' + r + '),8,TRUE,5,TRUE,3,TRUE,1,TRUE),,1)),""))');
    sheet.getRange(r, 10).setFormula('=IF(B' + r + '="","",IF(F' + r + '>1,"Cakisiyor","Normal"))');
  }

  sheet.getRange("B2:C60").setNumberFormat("dd.mm.yyyy");
  sheet.getRange("A1:J1").setHorizontalAlignment("center");
  sheet.getRange("A2:D60").setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 10);
}

function setupDashboard_(sheet) {
  sheet.getRange("A1").setValue("DENEME EVENT - Haftalik Dashboard");
  sheet.getRange("A1").setFontSize(16).setFontWeight("bold");

  sheet.getRange("A3").setValue("Aktif Event Sayisi");
  sheet.getRange("B3").setFormula('=COUNTIF(Event_Girdi!G2:G,"Evet")');
  sheet.getRange("C3").setValue("Deeplink Event Sayisi");
  sheet.getRange("D3").setFormula('=COUNTIFS(Event_Girdi!G2:G,"Evet",Event_Girdi!F2:F,"Evet")');

  sheet.getRange("A4").setValue("Haftalik Max Cakisma");
  sheet.getRange("B4").setFormula("=IFERROR(MAX(Hafta_Ozet!F2:F),0)");
  sheet.getRange("C4").setValue("Ilk Cakisan Hafta");
  sheet.getRange("D4").setFormula('=IFERROR(INDEX(Hafta_Ozet!A2:A,MATCH(B4,Hafta_Ozet!F2:F,0)),"")');

  sheet.getRange("A6").setValue("Haftalik Ozet");
  sheet.getRange("A7:J7").setValues([[
    "Hafta_No",
    "Baslangic",
    "Bitis",
    "Tarih",
    "Aktif Eventler",
    "Cakisma_Max",
    "Winner_Organik",
    "Winner_Deeplink",
    "Queue",
    "Durum"
  ]]);
  sheet.getRange("A8").setFormula('=FILTER(Hafta_Ozet!A2:J,Hafta_Ozet!B2:B<>"")');

  sheet.getRange("A10").setValue("Cakisma Trendi");
  sheet.getRange("B10").setFormula('=SPARKLINE(FILTER(Hafta_Ozet!F2:F,Hafta_Ozet!B2:B<>""))');

  sheet.getRange("A3:D4").setBackground("#f8f9fa");
  sheet.getRange("A7:J7").setFontWeight("bold").setBackground("#e8f0fe");
  sheet.getRange("A1:D4").setHorizontalAlignment("center");

  var rules = [];
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Cakisiyor")
      .setBackground("#ffe5e5")
      .setRanges([sheet.getRange("J8:J200")])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(1)
      .setBackground("#fff3cd")
      .setRanges([sheet.getRange("F8:F200")])
      .build()
  );
  sheet.setConditionalFormatRules(rules);

  sheet.setFrozenRows(7);
  sheet.autoResizeColumns(1, 10);
}
