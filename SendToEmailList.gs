function sendToEmailList() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const registSheet = spreadsheet.getSheetByName('Registration');
  const emailListSheet = spreadsheet.getSheetByName('Email List');
  const selectedDate = registSheet.getRange('O2').getValue();
  const headerRowData = registSheet.getRange('A1:I1').getValues();
  
  
  registData = registSheet.getDataRange().getValues().filter(function(_, i){ return i > 0 });
  
  
  const matchingRows = registData.filter(function(item) {
    return item[5].valueOf() === selectedDate.valueOf()
  });
  
  Logger.log(headerRowData);
  
  
  emailListSheet.clear();
  emailListSheet.getDataRange().setDataValidation(null);
  emailListSheet.appendRow(headerRowData[0]);
  
  matchingRows.forEach(function(item) {
    emailListSheet.appendRow(item);
  });
  
  
}
