var regArray = [];
var regObj = {};

function getDates() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName('Registration');
  const regData = regSheet.getDataRange().getValues().filter(function(item, i) {
   return i > 0;
  });
  
  regData.forEach(function(item) {
    regObj = {
      name: item[0] + " " + item[1],
      phone: item[2],
      email: item[3],
      location: item[6],
      date: new Date(item[5]),
      startTime: new Date(item[7]),
      endTime: new Date(item[8]),
      validDateRange: false
    }
    
    regArray.push(regObj);

  });
  
  // Setup start and end times
  regArray.forEach(function(item) {
    item.startTime.setDate(item.date.getDate());
    item.startTime.setYear(item.date.getYear());
    item.startTime.setMonth(item.date.getMonth());
    
    item.endTime.setDate(item.date.getDate());
    item.endTime.setYear(item.date.getYear());
    item.endTime.setMonth(item.date.getMonth());
    
    if(item.startTime.valueOf() < item.endTime.valueOf()) { item.validDateRange = true; }
   
    Logger.log("\nStartTime: %s\nEndtime: %s", item.startTime, item.endTime);
  })
  
  const isValidTimeRange = regArray.forEach(function(item) {
    return item.startTime > item.endRange
  });
              

  
 
}
