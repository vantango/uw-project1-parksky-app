$("document").ready(function () {
	var prevParkData, prevChartOptions, parkCode, date, currentPage;
	currentPage = window.location.pathname;

	prevParkData = JSON.parse(localStorage.getItem('parksky-park-data')) || null;
	prevChartOptions = JSON.parse(localStorage.getItem('parksky-chart-options')) || null;

	if (prevParkData === null) {
		parkCode = "acad";
		date = dayjs().format("YYYY-MM-DD");
		// save defaults
		saveToLocalStorage(null, 'park');
		// get defaults for future use
		prevParkData = JSON.parse(localStorage.getItem('parksky-park-data'));
		date = prevParkData.date;

	} else {
		parkCode = prevParkData.parkCode;
		date = prevParkData.date;

	}

	if (prevChartOptions === null && currentPage.includes('starchart')) {
		saveToLocalStorage(null, 'options');
		prevChartOptions = JSON.parse(localStorage.getItem('parksky-chart-options'));
	}

	$("#searchParksSelect").val(parkCode);
	$("#visitDate").val(date);

	getNEOs();

	if (currentPage.includes("parkdetails")) {
		$(".menu li:nth-child(2) a").addClass("is-active");
		displayData(parkCode, date, false, false, true, true);

	} else if (currentPage.includes("starchart")) {
		$(".menu li:nth-child(4) a").addClass("is-active");
		displayData(parkCode, date, true, true, false, false);

	} else {
		$(".menu li:first-child a").addClass("is-active");
		displayData(parkCode, date, true, false, true, false);
	}

	// on park change, update both parkInfo and star chart
	$("#searchParksSelect").change(function () {
		if (currentPage.includes("starchart")) {
			displayData($(this).val(), date, true, true, false, false);

		} else if (currentPage.includes("parkdetails")) {
			displayData($(this).val(), date, false, false, true, true);

		} else {
			displayData($(this).val(), date, true, false, true, false);
		}
	});

	// on date change, only update the star chart
	$("#visitDate").change(function () {
		date = $(this).val();
		prevData = JSON.parse(localStorage.getItem('parksky-park-data'));
		prevData.date = date;

		saveToLocalStorage(prevData, 'park');

		getNEOs();

		if (!currentPage.includes("parkdetails")) {
			var chartData = {
				fullName: prevParkData.fullName,
				latitude: prevParkData.latitude,
				longitude: prevParkData.longitude
			}
			// get the star chart!
			// if we're on the starchart page, we need to check the drawing options
			// AND update the rise/set/other astronomy info
			if(currentPage.includes("starchart")) {
				getStarChart('details');
				updateRiseSetData();

			}
			// otherwise, we're on the index page and just need the 'default' options for the star chart!
			else {
				getStarChart('default');

			}

		} else {
			displayData(parkCode, date, false, false, true, false);

		}
	});

});