function displayData(parkCode, displayStarChart = false, displayStarDetails = false, displayParkInfo = true, displayParkDetails = false) {
  // console.log(parkCode);
  $.ajax({
    url: `https://developer.nps.gov/api/v1/parks?api_key=0tCiHZSCrzRaYEYoMSn3NMBWl6rcnX3Z2HDqaeMg&parkCode=${parkCode}`,
    method: "GET"
  }).then(function (res) {
    var data = res.data[0];

    var saveData = [data.parkCode, data.latitude, data.longitude, $("#visitDate").val()];
    // console.log(saveData);
    saveLocalStorage(saveData);

    if (displayStarChart) {
      getStarChart(data, null);

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

      for (var i in data.operatingHours) {
        var row1 = $("<tr>");
        var row2 = $("<tr>");

        var tdHours = $("<td>");
        // tdHours.text(JSON.stringify(data.operatingHours[i].standardHours));

        for (var dayName in data.operatingHours[i].standardHours) {
          var hourSpan = $("<p>");
          hourSpan.text(`${dayName}: ${data.operatingHours[i].standardHours[dayName]}`);
          tdHours.append(hourSpan);
        }

        var tdDesc = $("<td>", { colspan: "2" });
        tdDesc.text(data.operatingHours[i].description);

        row1.append(tdHours);
        row2.append(tdDesc);

        $("#operatingHours").append(row1, row2);
      }

      // generates row and cell for email address
      $("#contactInfo").empty();

      for (var i in data.contacts.emailAddresses) {
        var row1 = $("<tr>");

        var tdEmail = $("<td>");
        tdEmail.text(data.contacts.emailAddresses[i].emailAddress);

        row1.append(tdEmail);
        $("#contactInfo").append(row1);
      }

      // generates row and cell for phone number
      for (var i in data.contacts.phoneNumbers) {
        var row2 = $("<tr>");

        var tdPhone = $("<td>");
        tdPhone.text(data.contacts.phoneNumbers[i].phoneNumber);

        row2.append(tdPhone);
        $("#contactInfo").append(row2);
      }

      // adds the weather description to the #weather td
      $("#weather").text(data.weatherInfo);
    }

    if (displayParkDetails) {
      $(".fotorama").remove()
      $("#galleryContainer").append("<div class='fotorama'></div>")
      // display extra details about parks, incl. Wikipedia "summary"
      // for the parkinfo page.

      var images = [
        // { img: 'https://picsum.photos/seed/rabbit/600/400', thumb: 'https://picsum.photos/seed/rabbit/600/400', caption: 'Rabbit' },
        // { img: 'https://picsum.photos/seed/bear/600/400', thumb: 'https://picsum.photos/seed/bear/600/400', caption: "Bear" },
        // { img: 'https://picsum.photos/seed/cougar/600/400', thumb: 'https://picsum.photos/seed/cougar/600/400', caption: "Cougar" },
        // { img: 'https://picsum.photos/seed/rattlesnake/600/400', thumb: 'https://picsum.photos/seed/rattlesnake/600/400', caption: "Rattlesnake" },
      ]

      for (var i in data.images) {
        var imgObj = {
          img: data.images[i].url,
          thumb: data.images[i].url,
          caption: data.images[i].caption,
        }

        images.push(imgObj);

      }
      console.log(data)
      $(".fotorama").fotorama({
        data: images,
        nav: "thumbs",
        loop: true,
        fit: "scaledown",
        maxwidth: 1000,
        minwidth: 1000,
      });

    }
  });
}

function getStarChart(data, date = null) {
  if (date === null) {
    date = dayjs($("#visitDate").val());
  }

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
      showConLines: false,
      showConLab: false,
      showDayNight: false
    }
  }

  changeLocationsAndTimes(startHere);
}

function getWikipediaExtract(title) {
  var queryURL = `https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=extracts&exintro=&titles=${title}`;
  // generator=search&gsrlimit=5&gsrsearch

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (res) {
    // console.log(res);
    var pages = res.query.pages;
    // console.log(res.query.pages);

    for (var i in res.query.pages) {
      $("#extract").append(pages[i].extract);
    }
  });
}

function saveLocalStorage(data = []) {
  var localData = JSON.parse(localStorage.getItem('parksky-data'));

  if ((data === null || data.length === 0) && localData === null) {
    data = ["acad", "44.409286", "-68.247501", dayjs().format("YYYY-MM-DD")];

  } else if (localData !== null && (data === null || data.length === 0)) {
    data = localData;
  }

  localStorage.setItem('parksky-data', JSON.stringify(data));
}