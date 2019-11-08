function scheduleShifts() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var registrationSheet = spreadsheet.getSheetByName("Registration")
  var calenderSheet = spreadsheet.getSheetByName("Calendar")
  var calendarId = calenderSheet.getRange("I2").getValue();
  var eventCal = CalendarApp.getCalendarById(calendarId);

  var calendarValues = calenderSheet.getDataRange().getValues()


  calendarValues.forEach(function (element, index) {

    // Get the start and end times
    var startTime = new Date(element[0]);
    var endTime = new Date(element[1]);

    if (index > 0 && element[3] !== "") {
      var name = element[2] + " " + element[3];
      var description = "Staff: " + element[5];

      eventCal.getEvents(startTime, endTime).forEach(function (event) {
        event.deleteEvent();
      });

      eventCal.createEvent(name, startTime, endTime)
        .setLocation(element[4])
        .setDescription(description);
  
    }
  });
}



