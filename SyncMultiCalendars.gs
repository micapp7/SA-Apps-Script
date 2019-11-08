function syncMultipleCalendars() {
  // Get sheets from current spreadsheet.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const calendarSheet = spreadsheet.getSheetByName('Calendar');

  // Get valid row data to populate calendar.
  const calendarData = calendarSheet.getDataRange().getValues().filter(function (value) {
    return value[0] !== "";
  });

  // Filter out duplicate location items
  const allLocations = calendarData.map(function (item) {
    return item[4];
  })

  const uniqueLocations = allLocations.filter(getUniqueItems);

  // Get all calendars.
  const allCalendars = CalendarApp.getAllCalendars()

  // Get existing calendars based on calendar names.
  const existingCalendars = allCalendars.filter(function (calendar) {
    return uniqueLocations.indexOf(calendar.getName()) >= 0;
  });

  const locCalendarObject = {}; // just a dictionary

  // Use unique locations to add entries
  uniqueLocations.forEach(function (key, i) {
    locCalendarObject[key] = existingCalendars[i];
  });

  const existingCalendarNames = existingCalendars.map(function (item) {
    return item.getName();
  });

  // Get names of locations without calendars
  const noCalendarLocations = uniqueLocations.filter(function (item) {
    return existingCalendarNames.indexOf(item) < 0;
  });

  // If no existing calendars exist
  if (existingCalendars.length == 0) {
    // Create a calendar for each unique location
    uniqueLocations.forEach(function (key, i) {
      locCalendarObject[key] = CalendarApp.createCalendar(key);
    });

    createCalendarEvents()

  } else if (noCalendarLocations.length == 0) {
    // If no new calendars need to be created, simply create calendar events using existing calendars
    createCalendarEvents();

  } else {
    // We have some locations without calendars so let's create calendars for those locations
    // And add events for those calendars.

    noCalendarLocations.forEach(function (key, i) {
      locCalendarObject[key] = CalendarApp.createCalendar(key);
    });

    createCalendarEvents()

  }

  function getUniqueItems(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  function createCalendarEvents() {
    calendarData.forEach(function (item) {
      // Get the start and end times
      var title = item[2] + " " + item[3];
      var startTime = new Date(item[0]);
      var endTime = new Date(item[1]);

      const cal = locCalendarObject[item[4]];

      cal.getEvents(startTime, endTime).forEach(function (event) {
        event.deleteEvent();
      });
      cal.createEvent(title, startTime, endTime)
        .setDescription("Email: " + item[5] + "\n" + "Phone: " + item[6])
    });
  }
}