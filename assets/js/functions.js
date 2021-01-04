parkAPIKey = "0tCiHZSCrzRaYEYoMSn3NMBWl6rcnX3Z2HDqaeMg";
defaultOptions = { showPlanets: true, showEquator: false, showEcliptic: false, showMilkyWay: false, showConLines: true, showConLab: false, showDayNight: false };

function displayData(parkCode, date, displayStarChart = false, displayStarDetails = false, displayParkInfo = true, displayParkDetails = false) {

  $.ajax({
    url: `https://developer.nps.gov/api/v1/parks?api_key=${parkAPIKey}&parkCode=${parkCode}`,
    method: "GET"
  }).then(function (res) {
    var data = res.data[0];

    var saveData = {
      parkCode: data.parkCode,
      fullName: data.fullName,
      latitude: data.latitude,
      longitude: data.longitude,
      date: $("#visitDate").val()
    };

    $("#parkName").html(`${data.fullName}`);

    // save to local data immediately so other functions
    // can use the (correct) data by pulling from local storage
    saveToLocalStorage(saveData, 'park');

    // park alerts from NPS
    getAlerts(parkCode, data.fullName);

    if (displayStarChart) {
      getStarChart('default');
    }

    if (displayStarDetails) {
      getStarChart('details');
      // display additional details about the sky chart/stars visible/etc.
      // for the starchart page.
      updateRiseSetData();
    }

    if (displayParkInfo) {
      // display park info (box on home page)
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

      if(data.entrancePasses.length > 0) {
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
      } else {
      	$("#entrancePasses").append(`<tr><td>No Entrance Passes available for ${data.fullName}.</td></tr>`);
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

        if (exceptions.length > 0) {
          for (var ex in exceptions) {
            var startDate = exceptions[ex].startDate;
            var endDate = exceptions[ex].endDate;

            // console.log(date, startDate);
            if (date >= startDate && date <= endDate) {
              schedule = exceptions[ex].exceptionHours;
              scheduleName += `: ${exceptions[ex].name}`;
            }
          }
        }

        for (var dayName in schedule) {
          var hourSpan = $("<p>");
          hourSpan.html(`<strong>${dayName}</strong>: ${schedule[dayName]}`);
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
        tdPhone.html(`<strong>${phoneType}:</strong> `);
        if(phoneType === "Voice") {
        	tdPhone.append(`<a href="tel:${data.contacts.phoneNumbers[i].phoneNumber}">${phone}</a>`);
        } else {
        	tdPhone.append(phone);
        }

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

        // console.log(tdAddress);

        row3.append(tdAddress);
        $("#contactInfo").append(row3);
      }

      // adds the weather description to the #weather td
      $("#weather").text(data.weatherInfo);

      // get Things To Do list (requires different endpoint)
      getThingsToDo(parkCode, data.fullName);
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

      getWikipediaExtract(title, `${data.description} <a href='${data.url}' target='_blank'><em>National Parks Service</em></a>`);
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
        // fit: "scaledown",
        fit: "cover",
        maxwidth: 1000,
        minwidth: 1000,
      });

    }

  }); // end of .then()
}

function getAlerts(parkCode, parkName) {
  $.ajax({
    url: `https://developer.nps.gov/api/v1/alerts?api_key=${parkAPIKey}&parkCode=${parkCode}`,
    method: "GET"
  }).then(function (res) {
    // console.log(res);
    $(".alert-modal .modal-content").empty();

    // IF we get at least one (1) alert
    if (res.data.length > 0) {
      $("#parkAlerts span").text(res.data.length).css({ "background-color": "crimson" });
      // sort alerts: Park Closure > Caution > Info
      res.data.sort(compareAlertTypes);

      for (var i in res.data) {
        var alert = res.data[i];
        var message = $("<article>", { class: "message" });
        var messageHeader = $("<div>", { class: "message-header" });
        var messageBody = $("<div>", { class: "message-body" });
        messageHeader.text(alert.title);
        messageBody.text(alert.description);
        message.append(messageHeader, messageBody);

        // applies color to alert depending on type
        if (alert.type === "Park Closure") {
          message.addClass("is-danger");
          messageHeader.prepend("<i class='fas fa-do-not-enter'></i>");
        } else if (alert.type === "Caution") {
          message.addClass("is-warning");
          messageHeader.prepend("<i class='fas fa-hand-paper'></i>");
        } else {
          message.addClass("is-info");
          messageHeader.prepend("<i class='fas fa-info-circle'></i>");
        }
        $(".alert-modal .modal-content").append(message);
      }

      // adds click functionality to modal
      $(".fa-exclamation-triangle").click(function () {
        $(".alert-modal").addClass("is-active");
      });

      $(".modal-close, .modal-background").click(function () {
        $(".modal").removeClass("is-active");
      });
    } else {
      $("#parkAlerts span").text(0).css({ "background-color": "grey" });
      var alert = res.data[i];
      var message = $("<article>", { class: "message" });
      var messageHeader = $("<div>", { class: "message-header" });
      var messageBody = $("<div>", { class: "message-body" });

      messageHeader.text("No Alerts");
      messageBody.text(`No alerts found for ${parkName}.`);

      message.append(messageHeader, messageBody);
      $(".alert-modal .modal-content").append(message);
    }
  });

  // spinner!
  $("#parkAlerts span").html("<i class='fal fa-spinner fa-spin' style='color: white'></i>");
}

function getThingsToDo(parkCode, fullName) {
  $.ajax({
    url: `https://developer.nps.gov/api/v1/thingstodo?api_key=${parkAPIKey}&q=stargazing&parkCode=${parkCode}`,
    method: "GET"
  }).then(function (res) {
    // console.log(res);

    if (res.data.length > 0) {
      $("#thingsToDo").empty();
      var data = res.data;

      for (var i in data) {
        var activity = data[i];
        var activityBlock = $("<a>", { class: "box activity-box", "href": activity.url });
        activityBlock.attr("target", "_blank");
        if (activity.images.length > 0) {
          activityBlock.css({ "background-image": `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${activity.images[0].url})`, "background-color": "#333", "background-position": "center", "background-size": "cover", "color": "white" });
        }

        activityBlock.append(`<h1>${activity.title}</h1>`);
        activityBlock.append(`<p class='has-text-left'>${activity.shortDescription}</p>`);

        $("#thingsToDo").append(activityBlock);
      }

    } else {
      var row = $("<tr>");
      var td = $("<td colspan='2'>");
      td.text("The National Parks Service hasn't provided a list of stargazing activities for " + fullName);
      row.html(td);

      $("#thingsToDo").html(row);
    }
  });
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
          $("#extract").append(`${pages[i].extract} [ <a href='https://en.wikipedia.org/wiki/${title}' target='_blank'>Wikipedia</a> ]`);
        }
      }
    } else if (!res.query.pages.hasOwnProperty("-1")) {
      // $("#extract").html(desc);
      $("#extract").html(`Nothing found on Wikipedia for ${title}`);
    }

    $("#description").html(desc);
  });
}

function getNEOs() {
  // NEO API limits results to 7 days
  var startDate = dayjs($("#visitDate").val()).subtract(3, 'days').format("YYYY-MM-DD");
  var endDate = dayjs($("#visitDate").val()).add(3, 'days').format("YYYY-MM-DD");

  $.ajax({
    url: `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=N01Hr2ayL4UxV02RoD6VdGP5LdG57n6nRc9hZwfk`,
    method: "GET"
  }).then(function (res) {
    // console.log(res);

    if (res.element_count > 0) {
      var neos = res.near_earth_objects;

      $(".neo-modal .modal-content").empty();

      for (var date in neos) {
        var message = $("<article>", { class: "message" });
        message.addClass("is-success mx-5");
        var messageHeader = $("<div>", { class: "message-header" });
        var messageBody = $("<div>", { class: "message-body" });

        messageHeader.text(`${date}`);

        for (var i in neos[date]) {
          var alert = neos[date][i];
          var link = `<a href="${alert.nasa_jpl_url};orb=1;cov=0;log=0;cad=0#orb" target="_blank">${alert.name}</a>`;
          // console.log(link);

          var time = dayjs(alert.close_approach_data[0].close_approach_date.close_approach_date_full).format("HH:mm");
          var estDiameter = (alert.estimated_diameter.meters.estimated_diameter_min + alert.estimated_diameter.meters.estimated_diameter_max) / 2;
          var messageText = $("<p>", { class: 'neo-message' });
          messageText.html(`<strong>${link}</strong> @ ${time}<br><strong style='padding-left: 1.5rem'>Magnitude:</strong> ${alert.absolute_magnitude_h} | <strong>Est. Diameter (meters):</strong> ${estDiameter}`);

          if (alert.is_potentially_hazardous_asteroid) {
            messageText.prepend("<i class='fas fa-siren-on has-text-danger'></i>");
          } else {
            messageText.prepend("<i class='fas fa-siren has-text-info'></i>");
          }

          messageBody.append(messageText);
        }

        message.append(messageHeader, messageBody);

        $(".neo-modal .modal-content").append(message);
      }

      // adds click functionality to modal
      $(".fa-meteor").click(function () {
        $(".neo-modal").addClass("is-active");
      });

      $(".modal-close, .modal-background").click(function () {
        $(".modal").removeClass("is-active");
      });
    }

    $("#neoAlerts span").text(res.element_count).css({ "background-color": "grey" });

    if (res.element_count > 0) {
      $("#neoAlerts span").css({ "background-color": "crimson" });
    } else {
    	$(".neo-modal .modal-content").text(`No Near-Earth Object Alerts found for ${startDate} - ${endDate}.`);
    }
  });

  // spinner!
  $("#neoAlerts span").html("<i class='fal fa-spinner fa-spin' style='color: white'></i>");
}

function getStarChart(options = 'default') {
  var data = JSON.parse(localStorage.getItem('parksky-park-data'));
  // if we need DEFAULT options, then nothing is shown
  var options = options === 'default' ? defaultOptions : JSON.parse(localStorage.getItem('parksky-chart-options'));
  var date = dayjs(data.date);

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
    drawOptions: options
  }

  changeLocationsAndTimes(startHere);
}

function getStarChartOptions() {
  // get the saved data
  var parkData = JSON.parse(localStorage.getItem('parksky-park-data'));
  var savedOptions = JSON.parse(localStorage.getItem('parksky-chart-options'));

  // parse the date into the correct format
  var date = dayjs(parkData.date);

  // loop through all the buttons
  $("#starchartOptions .button").each(function (i, b) {
    // if the button does NOT have the class 'is-light'
    // then it's ACTIVE and the corresponding drawOption should be TRUE
    if (!$(this).hasClass('is-light')) {
      savedOptions[$(this).attr("id")] = true;
    }
    // otherwise (if the button 'is-light' / is INactive)
    // then the drawOption should be FALSE
    else {
      savedOptions[$(this).attr("id")] = false;
    }
  });
  saveToLocalStorage(savedOptions, 'options');

  return savedOptions;
}

function updateRiseSetData() {
  var savedData = JSON.parse(localStorage.getItem('parksky-park-data'));
  var date = dayjs(savedData.date);

  var tableData = {
    fullName: savedData.fullName,
    latitude: savedData.latitude,
    longitude: savedData.longitude,
    date: date,
    yyyy: date.year(),
    mm: date.month() + 1,
    dd: date.date(),
    dateString: dayjs(savedData.date).format("YYYY-MM-DD"),
    tzString: date.format("Z"),
    tz: parseInt(date.format("Z")),
  };
  // show Rise/Set info
  riseSetChartPage(tableData);
}

function saveToLocalStorage(data = null, target = 'park') {
  var localData;

  if (target.includes("park")) {
    localData = JSON.parse(localStorage.getItem('parksky-park-data'));

    if ((data === null || data.length === 0) || localData === null || localData[0] === "abli") {
      data = {
        parkCode: "acad",
        fullName: "Acadia National Park",
        latitude: "44.409286",
        longitude: "-68.247501",
        date: dayjs().format("YYYY-MM-DD")
      };

    } else if (localData !== null && (data === null || data.length === 0)) {
      data = localData;
    }

    localStorage.setItem('parksky-park-data', JSON.stringify(data));

  } else {
    localData = JSON.parse(localStorage.getItem('parksky-chart-options'));
    // console.log(localData);

    if ((data === null || data.length === 0) && localData === null) {
      data = defaultOptions;

    } else if (localData !== null && (data === null || data.length === 0)) {
      data = localData;
    }

    localStorage.setItem('parksky-chart-options', JSON.stringify(data));
  }
}

// formatPhoneNumber function copy-pasted from:
// https://stackoverflow.com/a/8358141
function formatPhoneNumber(phoneNumberString) {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    var intlCode = (match[1] ? '+1 ' : '');
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }

  return null;
}

function compareAlertTypes(a, b) {
  if (
    (a.type === "Park Closure" && b.type !== "Park Closure") ||
    (a.type === "Caution" && b.type !== "Park Closure" && b.type !== "Caution")
  ) {
    return -1;

  } else if (a.type === b.type) {
    // checks a.title for a number - if there is one,
    // create a variable to hold the number *as an integer*
    // then create  a variable that holds either the number in b.title
    // (if there is one) or just 0
    // then return the results of a - b for sorting
    if (/\d+/.test(a.title) || /\d+/.test(b.title)) {
      var aNum = /\d+/.test(a.title) ? parseInt(a.title.match(/\d+/)) : 0;
      var bNum = /\d+/.test(b.title) ? parseInt(b.title.match(/\d+/)) : 0;

      return aNum - bNum;

    } else {
      return 0;
    }

  } else {
    return 1;

  }
}

function openTab(evt, tabName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("content-tab");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tab");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" is-active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " is-active";
}