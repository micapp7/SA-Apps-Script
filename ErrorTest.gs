function testErrors() {
    // Get sheets from current spreadsheet.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const calendarSheet = spreadsheet.getSheetByName('Calendar');

  // Get valid row data to populate calendar.
  const calendarData = calendarSheet.getDataRange().getValues().filter(function (item) {
    return (item[0] !== "" && item[0] !== '#REF!') && (item[1] !== "" && item[1] !== '#REF!');
  });
  
  calendarData.forEach(function(item, index) {
    Logger.log(item[0]);
  });
}

function isError_(cell) {
  // Cell is a value, e.g. came from `range.getValue()` or is an element of an array from `range.getValues()`
  // Note: indexOf uses strict equality when comparing cell to elements of errorValues, so make sure everything's a primitive...
  const errorValues = ["#N/A", "#REF!"];
  return (errorValues.indexOf(cell) !== -1);
}
