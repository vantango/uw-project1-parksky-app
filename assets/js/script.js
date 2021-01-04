$("document").ready(function () {
	var prevParkData, prevChartOptions, parkCode, date, currentPage;
	currentPage = window.location.pathname;

	prevParkData = JSON.parse(localStorage.getItem('parksky-park-data')) || null;
	prevChartOptions = JSON.parse(localStorage.getItem('parksky-chart-options')) || null;

<<<<<<< HEAD
	if(prevParkData === null) {
=======
	if (prevParkData === null) {
>>>>>>> development
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
<<<<<<< HEAD

	getNEOs();

	if(currentPage.includes("parkdetails")) {
		$(".level-item:nth-child(2)").addClass("is-active");
		displayData(parkCode, date, false, false, true, true);

	} else if(currentPage.includes("starchart")) {
		displayData(parkCode, date, true, true, false, false);

	} else {
		displayData(parkCode, date, true, false, true, false);
	}

	// on park change, update both parkInfo and star chart
	$("#searchParksSelect").change(function() {
		if(currentPage.includes("starchart")) {
			displayData($(this).val(), date, true, true, false, false);

		} else if(currentPage.includes("parkdetails")) {
=======

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
>>>>>>> development
			displayData($(this).val(), date, false, false, true, true);

		} else {
			displayData($(this).val(), date, true, false, true, false);
		}
	});

	// on date change, only update the star chart
<<<<<<< HEAD
	$("#visitDate").change(function() {
=======
	$("#visitDate").change(function () {
>>>>>>> development
		date = $(this).val();
		// relace the prevData date with the new date
		prevParkData.date = $(this).val();
		// save to localStorage
		saveToLocalStorage(prevParkData, 'park');

		getNEOs();
<<<<<<< HEAD
		
		if(!currentPage.includes("parkdetails")) {
=======

		if (!currentPage.includes("parkdetails")) {
>>>>>>> development
			var chartData = {
				fullName: prevParkData.fullName,
				latitude: prevParkData.latitude,
				longitude: prevParkData.longitude
			}
			// get the star chart!
			getStarChart(chartData, dayjs(date));
		} else {
			displayData(parkCode, date, false, false, true, false);
		}
	});
<<<<<<< HEAD
	
=======

>>>>>>> development
});