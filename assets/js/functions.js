function displayData(parkCode, date, displayStarChart = false, displayStarDetails = false, displayParkInfo = true, displayParkDetails = false) {

  $.ajax({
    url: `https://developer.nps.gov/api/v1/parks?api_key=0tCiHZSCrzRaYEYoMSn3NMBWl6rcnX3Z2HDqaeMg&parkCode=${parkCode}`,
    method: "GET"
  }).then(function (res) {
    var data = res.data[0];

    var saveData = [data.parkCode, data.latitude, data.longitude, $("#visitDate").val()];
    saveLocalStorage(saveData);

    if (displayStarChart) {
      getStarChart(data, dayjs(date));

    }

    if (displayStarDetails) {
      // display additional details about the sky chart/stars visible/etc.
      // for the starchart page.
    }

    if (displayParkInfo) {
      // display park info (box on home page)
      $("#parkName").html(`${data.fullName} Info`);
      $("#entranceFees").empty();

      // generates rows and cells for entrance Fees block (div)
      for (var i in data.entranceFees) {
        var row1 = $("<tr>");
        var row2 = $("<tr>");
        var tdCost = $("<td>", { id: `cost${i}` });
        tdCost.text(`$${data.entranceFees[i].cost}`);

        var tdTitle = $("<td>");
        tdTitle.text(data.entranceFees[i].title);

        var tdDesc = $("<td>", { colspan: "2" });
        tdDesc.text(data.entranceFees[i].description);

        row1.append(tdCost, tdTitle);
        row2.append(tdDesc);

        $("#entranceFees").append(row1, row2);
      }

      // generates rows and cells for entrance pass fees
      $("#entrancePasses").empty();

      for (var i in data.entrancePasses) {
        var row1 = $("<tr>");
        var row2 = $("<tr>");
        var tdCost = $("<td>", { id: `cost${i}` });
        tdCost.text(`$${data.entrancePasses[i].cost}`);

        var tdTitle = $("<td>");
        tdTitle.text(data.entrancePasses[i].title);

        var tdDesc = $("<td>", { colspan: "2" });
        tdDesc.text(data.entrancePasses[i].description);

        row1.append(tdCost, tdTitle);
        row2.append(tdDesc);

        $("#entrancePasses").append(row1, row2);
      }

      // generates rows and cells for daily operating hours
      $("#operatingHours").empty();

      // loops through all operating hours
      // each operating hours includes an exceptions object
      for (var i in data.operatingHours) {
        var row1 = $("<tr>");
        var row2 = $("<tr>");
        var scheduleName = data.operatingHours[i].name;
        var exceptions = data.operatingHours[i].exceptions;
        var date = $("#visitDate").val();
        var schedule = data.operatingHours[i].standardHours;

        var tdHours = $("<td>");
        // tdHours.text(JSON.stringify(data.operatingHours[i].standardHours));

        if(exceptions.length > 0) {
        	for(var ex in exceptions) {
        		var startDate = exceptions[ex].startDate;
        		var endDate = exceptions[ex].endDate;

        		// console.log(date, startDate);
        		if(date >= startDate && date <= endDate) {
        			schedule = exceptions[ex].exceptionHours;
        			scheduleName += `: ${exceptions[ex].name}`;
        		}
        	}
        }

        for (var dayName in schedule) {
          var hourSpan = $("<p>");
          hourSpan.text(`${dayName}: ${schedule[dayName]}`);
          tdHours.append(hourSpan);
        }

        tdHours.prepend(`<strong>${scheduleName}</strong>`);

        var tdDesc = $("<td>", { colspan: "2" });
        tdDesc.text(data.operatingHours[i].description);

        row1.append(tdHours);
        row2.append(tdDesc);

        $("#operatingHours").append(row1, row2);
      }

      // generates row and cell for park email address
      $("#contactInfo").empty();

      for (var i in data.contacts.emailAddresses) {
        var row1 = $("<tr>");
        var email = data.contacts.emailAddresses[i].emailAddress;

        var tdEmail = $("<td>");
        tdEmail.html(`<strong>Email:</strong> <a href='mailto:${email}'>${email}</a>`);

        row1.append(tdEmail);
        $("#contactInfo").append(row1);
      }

      // generates row and cell for park phone number
      for (var i in data.contacts.phoneNumbers) {
        var row2 = $("<tr>");
        var phoneType = data.contacts.phoneNumbers[i].type;
        var phone = formatPhoneNumber(data.contacts.phoneNumbers[i].phoneNumber);

        var tdPhone = $("<td>");
        tdPhone.html(`<strong>${phoneType}:</strong> ${phone}`);

        row2.append(tdPhone);
        $("#contactInfo").append(row2);
      }

      // generates row and cell for park address
      for (var i in data.addresses) {
        var row3 = $("<tr>");

        var tdAddress = $("<td>");
        tdAddress.append(`<strong>${data.addresses[i].type} Address: </strong>`, "<br>");
        tdAddress.append(data.addresses[i].line1, "<br>");
        tdAddress.append(data.addresses[i].city, ", ");
        tdAddress.append(data.addresses[i].stateCode, " ");
        tdAddress.append(data.addresses[i].postalCode);

        console.log(tdAddress);

        row3.append(tdAddress);
        $("#contactInfo").append(row3);
      }

      // adds the weather description to the #weather td
      $("#weather").text(data.weatherInfo);
    }

    if (displayParkDetails) {
      var title = data.fullName;

      if (parkCode === "wrst") {
        title = "Wrangell–St._Elias_National_Park_and_Preserve";
      }
      if (parkCode === "hale") {
        title = "Haleakalā_National_Park";
      }
      if (parkCode === "glac") {
        title = "Glacier_National_Park_(U.S.)";
      }
      if (parkCode === "gaar") {
        title = "Gates_of_the_Arctic_National_Park_and_Preserve";
      }
      if (parkCode === "dena") {
        title = "Denali_National_Park_and_Preserve";
      }
      if (parkCode === "glba") {
        title = "Glacier_Bay_National_Park_and_Preserve";
      }
      // black canyon
      if (parkCode === "blca") {
        title = "Black_Canyon_of_the_Gunnison_National_Park";
      }
      // great sand dunes
      if (parkCode === "grsa") {
        title = "Great_Sand_Dunes_National_Park_and_Preserve";
      }
      // hawai'i volcanoes
      if (parkCode === "havo") {
        title = "Hawaiʻi_Volcanoes_National_Park";
      }
      // lake clark
      if (parkCode === "lacl") {
        title = "Lake_Clark_National_Park_and_Preserve";
      }
      // katmai
      if (parkCode === "katm") {
        title = "Katmai_National_Park_and_Preserve";
      }
      // sequoia and kings canyon
      if (parkCode === "seki") {
        title = "Sequoia_and_Kings_Canyon_National_Parks";
      }

      getWikipediaExtract(title, data.description);
      $(".fotorama").remove()
      $("#galleryContainer #extract").before("<div class='fotorama'></div>")
      // display extra details about parks, incl. Wikipedia "summary"
      // for the parkinfo page.

      var images = [];

      for (var i in data.images) {
        var imgObj = {
          img: data.images[i].url,
          thumb: data.images[i].url,
          caption: `${data.images[i].caption} <span class='credit'>${data.images[i].credit}</span>`,
        }

        images.push(imgObj);

      }

      $(".fotorama").fotorama({
        data: images,
        nav: "thumbs",
        loop: true,
        fit: "scaledown",
        maxwidth: 1000,
        minwidth: 1000,
      });

    }

  }); // end of .then()
}

function getStarChart(data, date) {
	

  var startHere = {
    place1in: { value: data.fullName },
    lat1in: { value: data.latitude },
    long1in: { value: data.longitude },
    year1in: { value: date.year() },
    month1in: { value: date.month() + 1 }, // expects 1-12
    day1in: { value: date.date() }, // .day() == M/T/W/etc.
    hour1in: { value: 21 }, // dayjs().hour()
    minute1in: { value: 0 }, // dayjs().minute()
    second1in: { value: 0 }, // dayjs().second()
    tz1in: { value: parseInt(date.format("Z")) },
    drawOptions: {
      showPlanets: true,
      showEquator: true,
      showEcliptic: false,
      showMilkyWay: true,
      showConLines: true,
      showConLab: true,
      showDayNight: false
    }
  }

  changeLocationsAndTimes(startHere);
}

function getWikipediaExtract(title, desc) {
  var queryURL = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts&exintro=&titles=${title}`;

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (res) {
    // console.log(res);
    $("#extract").empty();

    if (!res.query.pages.hasOwnProperty("-1")) {
      var pages = res.query.pages;
      // console.log(res.query.pages);

      for (var i in res.query.pages) {
        if (res.query.pages[i].extract !== "") {
          $("#extract").append(pages[i].extract);
        }
      }
    } else if (!res.query.pages.hasOwnProperty("-1")) {
      $("#extract").html(desc);
    }

    $("#description").text(desc);
    // if($("#extract").is(":empty")) {
    // 	$("#extract").html(desc);
    // } else {
    // 	$("#description").
    // }
  });
}

function saveLocalStorage(data = []) {
  var localData = JSON.parse(localStorage.getItem('parksky-data'));

  if ((data === null || data.length === 0) || localData === null || localData[0] === "abli") {
    data = ["acad", "44.409286", "-68.247501", dayjs().format("YYYY-MM-DD")];

  } else if ((localData !== null && localData[0] !== "abli") && (data === null || data.length === 0)) {
    data = localData;
  }

  localStorage.setItem('parksky-data', JSON.stringify(data));
}

// formatPhoneNumber function copy-pasted from:
// https://stackoverflow.com/a/8358141
function formatPhoneNumber(phoneNumberString) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    var intlCode = (match[1] ? '+1 ' : '')
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return null
}