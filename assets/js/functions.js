function displayData(parkCode, displayStarChart=false, displayStarDetails=false, displayParkInfo=true, displayParkDetails=false) {
	// console.log(parkCode);
	$.ajax({
    url: `https://developer.nps.gov/api/v1/parks?api_key=0tCiHZSCrzRaYEYoMSn3NMBWl6rcnX3Z2HDqaeMg&parkCode=${parkCode}`,
    method: "GET"
  }).then(function(res) {
  	var data = res.data[0];
    console.log(data);
    
    if(displayStarChart) {
    	getStarChart(data);

    }

    if(displayStarDetails) {
    	// display additional details about the sky chart/stars visible/etc.
    	// for the starchart page.
    }

    if(displayParkInfo) {
    	// display park info (box on home page)
    	$("#parkName").html(`${data.fullName} Info`);
    	
    	// generates rows and cells for entrance Fees block (div)
    	for(var i in data.entranceFees) {
    		var row1 = $("<tr>");
    		var row2 = $("<tr>");
    		var tdCost = $("<td>", {id: `cost${i}`});
    		tdCost.text(`$${data.entranceFees[i].cost}`);

    		var tdTitle = $("<td>");
    		tdTitle.text(data.entranceFees[i].title);

    		var tdDesc = $("<td>", {colspan: "2"});
    		tdDesc.text(data.entranceFees[i].description);

    		row1.append(tdCost, tdTitle);
    		row2.append(tdDesc);

    		$("#entranceFees").append(row1, row2);
    	}

    	// adds the weather description to the #weather td
    	$("#weather").text(data.weatherInfo);
    }

    if(displayParkDetails) {
    	// display extra details about parks, incl. Wikipedia "summary"
    	// for the parkinfo page.
    }
  });
}

function getStarChart(data) {
	var startHere = {
    place1in: { value: data.fullName },
    lat1in: { value: data.latitude },
    long1in: { value: data.longitude },
    year1in: { value: dayjs().year() },
    month1in: { value: dayjs().month() + 1 }, // expects 1-12
    day1in: { value: dayjs().date() }, // .day() == M/T/W/etc.
    hour1in: { value: 21 }, // dayjs().hour()
    minute1in: { value: 0 }, // dayjs().minute()
    second1in: { value: 0 }, // dayjs().second()
    tz1in: { value: parseInt(dayjs().format("Z")) },
    drawOptions: {
      showPlanets: true,
      showEquator: true,
      showEcliptic: false,
      showMilkyWay: true,
      showConLines: false,
      showConLab: false,
      showDayNight: false
    }
  }

  changeLocationsAndTimes(startHere);
}