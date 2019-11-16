var regArray = [];
var regObj = {};
var startTime = new Date();
var endTime = new Date();
var SEND_TO_EMAIL_PROMPT_MESSAGE = "Please select volunteers by date (mm/dd/yyyy)";
var SEND_TO_EMAIL_TITLE = "SEND TO EMAIL SHEET";

// Set date range to delete events a month before and after today
startTime.setMonth(startTime.getMonth() - 2);
endTime.setMonth(endTime.getMonth() + 2);

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Setup custom menu for core actions
  ui.createMenu('Actions')
    .addSubMenu(ui.createMenu('Calendar')
      .addItem('Sync', 'syncCalendars'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Email')
      .addItem('Send To Email Sheet', 'sendToEmailSheet'))
    .addToUi();
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.openByUrl('https://docs.google.com/forms/d/1OtJysl51gywNrAXyEfTj12TCNInjfLu1OeN8HLmsb5k/edit');

    ScriptApp.newTrigger('onSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
  
    formatSheet();
}

// This will run when the form is submitted.
function onSubmit() {
  formatSheet();
}

function formatSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  var range = sheet.getDataRange();
   range.setHorizontalAlignment("Center");
  
  var columnHeaders = sheet.getRange(1, range.getLastColumn());
  
  var bold = SpreadsheetApp.newTextStyle()
  .setBold(true)
  .build()
  
  columnHeaders.setTextStyle(bold);

  var startTimeColumn = sheet.getRange("I2:I");
  startTimeColumn.setNumberFormat('hh:mm A/P".M."');
  
  var endTimeColumn = sheet.getRange("J2:J");
  endTimeColumn.setNumberFormat('hh:mm A/P".M."');
}


function syncCalendars() {
  // Get sheets from current spreadsheet.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName('Responses');
  const regData = regSheet.getDataRange().getValues().filter(function (element, i) {
    return i > 0;
  })
  
  const locationValues = spreadsheet.getSheetByName('Location').getDataRange().getValues();

  regData.forEach(function (element) {
    regObj = {
      name: element[1] + " " + element[2],
      groupName: element[3],
      phone: element[4],
      email: element[5],
      date: new Date(element[6]),
      location: element[7],
      startTime: new Date(element[8]),
      endTime: new Date(element[9]),
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
  

  // Get all calendars.
  const allCalendars = CalendarApp.getAllCalendars()
  Logger.log("All Calendars:");
  allCalendars.forEach(function(element) {Logger.log(element.getName())});
  
  const locations = locationValues.map(function(element) {
    return element[0];
  }).sort();
  
  Logger.log("Locations: " + locations);
  

  // Get existing calendars based on calendar names.
  const existingCalendars = allCalendars.filter(function(calendar) {
   
    return locations.indexOf(calendar.getName()) >= 0;
  });
  


  
  Logger.log("Existing Calendars:");
  // Sort existing calendars to match locations (this will ensure that dictionary is setup correctly)
  existingCalendars.sort(sortByName);
  existingCalendars.forEach(function(element) {Logger.log(element.getName())});

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
  locations.forEach(function (key, i) {
    locCalendarObject[key] = existingCalendars[i];
  });

  const existingCalendarNames = existingCalendars.map(function (element) {
    return element.getName();
  });

  // Get names of locations without calendars
  const noCalendarLocations = locations.filter(function (element) {
    return existingCalendarNames.indexOf(element) < 0;
  });

  // If no existing calendars exist
  if (existingCalendars.length == 0) {
    
    Logger.log('No existing calendars found');
    // Create a calendar for each location
    locations.forEach(function (key, i) {
      locCalendarObject[key] = CalendarApp.createCalendar(key);
    });
    
    createCalendarEvents();

  } else if (noCalendarLocations.length == 0) {
    // If no new calendars need to be created, simply create calendar events using existing calendars
    Logger.log('Existing calendars found!');
    Logger.log('No calendars need to be created');
    createCalendarEvents();



  } else {
    // We have some locations without calendars so let's create calendars for those locations

    noCalendarLocations.forEach(function (key, i) {
      locCalendarObject[key] = CalendarApp.createCalendar(key);
    });

    createCalendarEvents()
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
            Logger.log(event.getTitle());
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

function sendToEmailSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName('Responses');
  const emailListSheet = spreadsheet.getSheetByName('Email');
  var selectedDate;
 
  const headerRowData = regSheet.getRange('A1:N1').getValues();
  const ui = SpreadsheetApp.getUi();

  regData= regSheet.getDataRange().getValues().filter(function (_, i) { return i > 0 });
  
  const response = ui.prompt(SEND_TO_EMAIL_TITLE, SEND_TO_EMAIL_PROMPT_MESSAGE, ui.ButtonSet.OK_CANCEL);
  
  if(response.getSelectedButton() == ui.Button.OK) {

    if(emailListSheet != null) {
      spreadsheet.deleteSheet(emailListSheet);
    }
    
     selectedDate = new Date(response.getResponseText())
     const matchingRows = regData.filter(function (element) {
        return element[6].valueOf() === selectedDate.valueOf()
    });
    
    if(matchingRows.length > 0 ) {

     var newSheet = spreadsheet.insertSheet('Email');
     newSheet.appendRow(headerRowData[0]);
    
     matchingRows.forEach(function (element, index) {

        newSheet.appendRow(element);
      });
    
      spreadsheet.setActiveSheet(newSheet);
    } else {
        ui.alert('No volunteers exist with selected date. please try again.')
        sendToEmailSheet();
    }
  }
}
    