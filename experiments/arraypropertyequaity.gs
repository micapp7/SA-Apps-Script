function isAnyPropertyTheSame() {
  const bike1 = { name: 'SuperSport', maker: 'Ducati', engine: '937cc', creationDate: new Date('Jan 1 2019'), toString: ""};
  const bike2 = { name: 'Cruiser', maker: 'Ducati', engine: '937cc', creationDate: new Date('Jan 2 2019'), toString: "" };
  const bike3 = { name: 'Dirtbike', maker: 'Ducati', engine: '937cc', creationDate: new Date('Jan 2 2019'), toString: "" };
  
  const bikes = [bike1, bike2, bike3];
  
  bikes.forEach(function(element) {
    element.toString = element.name + " " + element.creationDate;
  });
  
  Logger.log(bikes);
  


    Logger.log(hasDupeDates(bikes))

}

function hasDupeDates(array) {
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