/**
 * ==============================================================================
 * iCON ESPORTS - Google E-Tablolar (Google Sheets) Otomasyon Kodu
 * ==============================================================================
 * 
 * NASIL KULLANILIR?
 * 1. Yeni bir Google E-Tablosu açın: https://sheets.new
 * 2. Üst menüden: Uzantılar (Extensions) > Apps Script bölümüne tıklayın.
 * 3. Açılan sayfadaki tüm kodları silip BU KODUN TAMAMINI yapıştırın ve kaydedin (Ctrl+S).
 * 4. Sağ üstteki mavi "Dağıt (Deploy)" > "Yeni dağıtım (New deployment)" butonuna tıklayın:
 *    - Tür: Web uygulaması (Web app)
 *    - Açıklama: iCON Esports Başvuru Sistemi
 *    - Şunun olarak yürüt (Execute as): Kendim (Me)
 *    - Erişimi olanlar (Who has access): Herkes (Anyone)  <-- (ÖNEMLİ!)
 * 5. "Dağıt" butonuna basın ve izinleri onaylayın.
 * 6. Size verilen "Web Uygulaması URL" adresini kopyalayıp app.js içerisindeki GOOGLE_SHEETS_WEBHOOK satırına yapıştırın.
 */

function doGet(e) {
  return ContentService
    .createTextOutput("iCON Esports Başvuru Sistemi Aktif! (Webhook sorunsuz çalışıyor)")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // iCON ESPORTS E-Tablosuna doğrudan kimlik (ID) ile bağlan
    var SPREADSHEET_ID = "1Vc27CqK67jhUhf5he7c0EJHlBgmZ-mEaxRoSxh5dpZQ";
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0];
    
    // Tablo başlıkları (İlk çalışmada otomatik oluşturulur)
    var headers = [
      "Başvuru ID",
      "Tarih & Saat",
      "Ad Soyad",
      "E-Posta",
      "Telefon",
      "Bölüm & Sınıf",
      "Discord & Gamer Tag",
      "Hedeflenen Branş",
      "Rank / Seviye",
      "Rol / Koridor / Ajanlar",
      "Profil Linki (Tracker / OP.GG / Faceit)",
      "Medya & Yönetim Yetkinlikleri",
      "Turnuva / Espor Tecrübesi"
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#7E22CE"); // iCON Esports Mor Vurgusu
      headerRange.setFontColor("#FFFFFF");  // Beyaz Yazı
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);

    var row = [
      data.id || ("ICON-" + Math.floor(1000 + Math.random() * 9000)),
      data.date || new Date().toLocaleString("tr-TR"),
      data.fullname || "",
      data.email || "",
      data.phone || "",
      data.university || "",
      data.discord_tag || "",
      data.department || "",
      data.rank_level || "-",
      data.roles || "-",
      data.profile_link || "-",
      data.media_skills || "-",
      data.experience || ""
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
