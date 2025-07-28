// Google Apps Script for Fleet Owner Trip Payment Form
// Make sure your sheet tab is named 'Sheet1' and headers match the payload keys

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    if (!sheet) throw new Error("Sheet 'Sheet1' not found.");
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return ContentService.createTextOutput(JSON.stringify({data: []})).setMimeType(ContentService.MimeType.JSON);
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      result.push(rowObj);
    }
    return ContentService.createTextOutput(JSON.stringify({data: result})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("doGet error: " + err.message);
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    if (!sheet) throw new Error("Sheet 'Sheet1' not found.");
    var body = JSON.parse(e.postData.contents);
    if (!body.data || !Array.isArray(body.data) || !body.data[0]) throw new Error("Invalid payload format");
    var headers = sheet.getDataRange().getValues()[0];
    var row = [];
    for (var i = 0; i < headers.length; i++) {
      row.push(body.data[0][headers[i]] || "");
    }
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

// To debug, check the logs in Apps Script Editor (View > Logs)
// Make sure your sheet headers are: date, driver, km, earnings, cash_collected, fuel, uber_commission, yatri_commission, driver_pay, owner_profit, remaining_cash
