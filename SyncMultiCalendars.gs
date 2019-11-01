function syncMultipleCalendars() {
  // get the current spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var calendarValuesSheet = spreadsheet.getSheetByName('Calendar');
  
  // only get rows with data
  var calendarValues = calendarValuesSheet.getDataRange().getValues().filter(
    function(value, index) {
        return index > 0 && value[0] !== "";
    });
  
  var locationSheet = spreadsheet.getSheetByName('Location');
  var locationValues = locationSheet.getDataRange().getValues();
 
  
  calendarValues.forEach(function(row, index) {
    
    // Get the start and end times
    var startTime = new Date(row[0]);
    var endTime = new Date(row[1]);

    if (index > 0 && row[3] !== "") {
      var name = row[2] + " " + row[3];
      var description = "Staff: " + row[6];
      
      var locationIdMap = {};
      
      locationValues.forEach(function(row, index) {
        locationIdMap[row[0]] = row[1]; 
      });
   
      var eventCal = CalendarApp.getCalendarById(locationIdMap[row[4]]);

      eventCal.getEventsForDay(startTime).forEach(function (event) {
        event.deleteEvent();
      });

      eventCal.createEvent(name, startTime, endTime)
        .setLocation(row[4])
        .setDescription(description);
    }
  });
 
}