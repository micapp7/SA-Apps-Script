var regArray = [];
var regObj = {};

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Or DocumentApp or FormApp.
    ui.createMenu('Custom-Menu')
    .addItem('Sync Calendars', 'syncCalendars')
    .addItem('Register Row', 'registerRow')
    .addToUi();
  }
  
  function syncCalendars() {
  // Get sheets from current spreadsheet.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = spreadsheet.getSheetByName('Registration');
  const regData = regSheet.getDataRange().getValues().filter(function(item, i) {
   return i > 0;
  })
  
    regData.forEach(function(item) {
    regObj = {
      name: item[0] + " " + item[1],
      phone: item[3],
      email: item[4],
      groupName: item[2],
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

  // Filter out duplicate location items
  const allLocations = regArray.map(function (item) {
    return item.location;
  })

  const uniqueLocations = allLocations.filter(getUniqueItems).filter(function(item) {
    return item !== "-";
  });

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
    
    Logger.log("Else");

    noCalendarLocations.forEach(function (key, i) {
      locCalendarObject[key] = CalendarApp.createCalendar(key);
    });

    createCalendarEvents()

  }

  function getUniqueItems(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  function createCalendarEvents() {

    
    const isDateRangeValid = regArray.every(function(item) {
      return item.validDateRange === true;
    });
    
    Logger.log("test");
    
    // Only create events if all dates are proper.
    if(isDateRangeValid) {
    regArray.forEach(function (item) {
      // Get the start and end times

      const cal = locCalendarObject[item.location];
      
      const title = item.name + ' ( ' + item.groupName + ' )';
      
      cal.getEvents(item.startTime, item.endTime).forEach(function (event) {
        event.deleteEvent();
      });
      cal.createEvent(title, item.startTime, item.endTime)
        .setDescription("Email: " + item.email + "\n" + "Phone: " + item.phone)
    });
    } else {
      // TODO: Print helpful details.
      throw new Error( "Please make sure all start times are less than end times." );
    }
  }
}

function registerRow() {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  
  var rawSheet = spreadSheet.getSheetByName('Form Responses 1');
  var responsesSheet = spreadSheet.getSheetByName('Responses');
  var registrationSheet = spreadSheet.getSheetByName('Registration');
  
  var rawRows = rawSheet.getDataRange().getValues();
  var responseRows = responsesSheet.getDataRange().getValues();
  
  // TODO Only add specific cell values from rawSheet to registration
  
  var selectedRowIndex = responsesSheet.getActiveCell().getRowIndex() - 1
  var selectedColIndex = responsesSheet.getActiveCell().getColumn()
 
  // var email = rawRows[selectedRowIndex][6];
  // MailApp.sendEmail(email, 'Hey ' + rawRows[selectedRowIndex][1] + '!','This is the body of the message');

  var newRow = [];
  rawRows[selectedRowIndex].forEach(function(item, index) {
    // Only move specific row data to registration sheet
    if (index == 1 || index == 2 || index == 3 || index == 4 || index == 6 || index == 7 || index == 11 ) {
      newRow.push(item);
    }
  });
  
  Logger.log(newRow);
  registrationSheet.appendRow(newRow);
}
                 

  