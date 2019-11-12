var regArray = [];
var regObj = {};
var startTime = new Date();
var endTime = new Date();

// Set date range to delete events a month before and after today
startTime.setMonth(startTime.getMonth() - 1);
endTime.setMonth(endTime.getMonth() + 1);

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Setup custom menu for core actions
  ui.createMenu('Actions')
    .addSubMenu(ui.createMenu('Calendar')
      .addItem('Sync', 'syncCalendars'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Email')
      .addItem('Send To Email Sheet', 'sendToEmailSheet'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Registration')
      .addItem('Register Selected Rows', 'registerRow'))
    .addSeparator()
    .addToUi();
}

function syncCalendars() {
  // Get sheets from current spreadsheet.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName('Registration');
  const regData = regSheet.getDataRange().getValues().filter(function (element, i) {
    return i > 0;
  })

  regData.forEach(function (element) {
    regObj = {
      name: element[0] + " " + element[1],
      phone: element[3],
      email: element[4],
      groupName: element[2],
      location: element[6],
      date: new Date(element[5]),
      startTime: new Date(element[7]),
      endTime: new Date(element[8]),
      validDateRange: false,
      toString: ""
    }

    regArray.push(regObj);

  });

  // Setup start and end times
  regArray.forEach(function (element) {
    element.startTime.setDate(element.date.getDate());
    element.startTime.setYear(element.date.getYear());
    element.startTime.setMonth(element.date.getMonth());

    element.endTime.setDate(element.date.getDate());
    element.endTime.setYear(element.date.getYear());
    element.endTime.setMonth(element.date.getMonth());

    // Use this for location and date comparisons
    element.toString = element.location + element.startTime;

    if (element.startTime.valueOf() < element.endTime.valueOf()) { element.validDateRange = true; }

  })

  // Filter out duplicate location elements
  const allLocations = regArray.map(function (element) {
    return element.location;
  })

  const uniqueLocations = allLocations.filter(getUniqueelements).sort();

  // Get all calendars.
  const allCalendars = CalendarApp.getAllCalendars()

  // Get existing calendars based on calendar names.
  const existingCalendars = allCalendars.filter(function (calendar) {
    return uniqueLocations.indexOf(calendar.getName()) >= 0;

  });

  // Sort existing calendars to match unique locations (this will ensure that dictionary is setup correctly)
  existingCalendars.sort(sortByName);

  function sortByName(a, b) {
    var nameA = a.getName().toLowerCase(), nameB = b.getName().toLowerCase()
    if (nameA < nameB) //sort string ascending
      return -1
    if (nameA > nameB)
      return 1
    return 0 //default return value (no sorting)
  }

  const locCalendarObject = {}; // just a dictionary

  // Use unique locations to add entries (This depends on sorted cal list)
  uniqueLocations.forEach(function (key, i) {
    locCalendarObject[key] = existingCalendars[i];
  });

  const existingCalendarNames = existingCalendars.map(function (element) {
    return element.getName();
  });

  // Get names of locations without calendars
  const noCalendarLocations = uniqueLocations.filter(function (element) {
    return existingCalendarNames.indexOf(element) < 0;
  });

  // If no existing calendars exist
  if (existingCalendars.length == 0) {
    // Create a calendar for each unique location
    uniqueLocations.forEach(function (key, i) {
      locCalendarObject[key] = CalendarApp.createCalendar(key);
    });

  } else if (noCalendarLocations.length == 0) {
    // If no new calendars need to be created, simply create calendar events using existing calendars
    createCalendarEvents();

  } else {
    // We have some locations without calendars so let's create calendars for those locations

    noCalendarLocations.forEach(function (key, i) {
      locCalendarObject[key] = CalendarApp.createCalendar(key);
    });

    createCalendarEvents()
  }

  function getUniqueelements(value, index, self) {
    return self.indexOf(value) === index;
  }

  function createCalendarEvents() {
    // Get the start and end times

    const isDateRangeValid = regArray.every(function (element) {
      return element.validDateRange === true;
    });

    //const isDuplicateLocationDate = isDuplicateDateLocation(regArray);
    const duplicateEventElements = getDuplicateEventElements(regArray);

    // Only create events if start time is valid and location and times are unique.
    if (isDateRangeValid) {
      if (duplicateEventElements.length === 0) {
        
        // Delete all existing calendar events.
        existingCalendars.forEach(function (element) {
          const events = element.getEvents(startTime, endTime);
          events.forEach(function (event) {
            event.deleteEvent();
          });
        });
        
        // Create new calendar events from registration data.
        regArray.forEach(function (element) {
          const cal = locCalendarObject[element.location];
          const title = element.name + ' ( ' + element.groupName + ' )';
          cal.createEvent(title, element.startTime, element.endTime)
            .setDescription("Email: " + element.email + "\n" + "Phone: " + element.phone)
        });
      } else {
  
        // Build string that contains error details
        var nameStr = "";
        
        duplicateEventElements.forEach(function(element, index) {
          nameStr = nameStr + " " + element.name + ' (' + element.groupName + ')' +  "\n" ;
        });
        
        // Display error
        var ui = SpreadsheetApp.getUi();
        ui.alert('Event Duplicate Error', nameStr, ui.ButtonSet.OK);
      }

    } else {
      throw new Error("Please make sure all start times are less than end times.");
    }
  }

  function isDuplicateDateLocation(array) {
    var occurrences = {}
    var hasDupe = false
    array.filter(function (element) {
      if (occurrences[element.toString]) {
        hasDupe = true
      } else {
        occurrences[element.toString] = true
      }
    })
    return hasDupe
  }
}

  function getDuplicateEventElements(array) {
    var occurrences = {};
    const duplicateEventElements = [];
    
    array.forEach(function (element) {
      if (occurrences[element.toString]) {
        duplicateEventElements.push(element);
      } else {
        occurrences[element.toString] = true;
      }
    })
    return duplicateEventElements
  }

function registerRow() {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

  const responsesSheet = spreadSheet.getSheetByName('Responses');
  const responseRows = responsesSheet.getDataRange().getValues();
  
  const regSheet= spreadSheet.getSheetByName('Registration');
                                                                                     
  const selectedRowIndex = responsesSheet.getActiveCell().getRowIndex() - 1            

  var newRow = [];
  responseRows[selectedRowIndex].forEach(function (element, index) {
    // Only move specific row data to registration sheet
    if (index == 1 || index == 2 || index == 3 || index == 4 || index == 6 || index == 7 || index == 11) {
      newRow.push(element);
    }
  });

  Logger.log(newRow);
  regSheet.appendRow(newRow);
}

function sendToEmailSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName('Registration');
  const emailListSheet = spreadsheet.getSheetByName('Email List');
  const selectedDate = regSheet.getRange('J2').getValue();
  const headerRowData = regSheet.getRange('A1:I1').getValues();

  regData= regSheet.getDataRange().getValues().filter(function (_, i) { return i > 0 });

  const matchingRows = regData.filter(function (element) {
    return element[5].valueOf() === selectedDate.valueOf()
  });

  emailListSheet.clearContents();
  emailListSheet.clearNotes();
  emailListSheet.getDataRange().setDataValidation(null);
  emailListSheet.appendRow(headerRowData[0]);

  matchingRows.forEach(function (element) {
    emailListSheet.appendRow(element);
  });
}