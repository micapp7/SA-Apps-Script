function register() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  
  var rawSheet = spreadSheet.getSheetByName('Form Responses 1');
  var responsesSheet = spreadSheet.getSheetByName('Responses');
  var registrationSheet = spreadSheet.getSheetByName('Registration');
  
  var rawRows = rawSheet.getDataRange().getValues();
  var responseRows = responsesSheet.getDataRange().getValues();
  
  // TODO Only add specific cell values from rawSheet to registration
  
  var selectedRowIndex = responsesSheet.getActiveCell().getRowIndex() - 1
  var selectedColIndex = responsesSheet.getActiveCell().getColumn()

  var newRow = [];
  rawRows[selectedRowIndex].forEach(function(item, index) {
    // Only move specific row data to registration sheet
    if (index == 0 || index == 1 || index == 2 || index == 4 || index == 6 || index == 7 || index == 11 ) {
      newRow.push(item);
    }
  });
  
  Logger.log(newRow);
  registrationSheet.appendRow(newRow);
}
                 
