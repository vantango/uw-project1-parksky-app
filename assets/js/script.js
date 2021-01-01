$("document").ready(function() {
	var prevParkData, prevChartOptions, parkCode, date, currentPage;

	prevParkData = JSON.parse(localStorage.getItem('parksky-park-data')) || null;
	prevChartOptions = JSON.parse(localStorage.getItem('parksky-chart-options')) || null;

	currentPage = window.location.pathname;

	if(prevParkData === null) {
		parkCode = "acad";
		date = dayjs().format("YYYY-MM-DD");
		// save defaults
		saveToLocalStorage(null, 'park');
		// get defaults for future use
		prevParkData = JSON.parse(localStorage.getItem('parksky-park-data'));

	} else {
		parkCode = prevParkData.parkCode;
		date = prevParkData.date;
		
	}

	if(prevChartOptions === null && currentPage.includes('starchart')) {
		saveToLocalStorage(null, 'options');
		prevChartOptions = JSON.parse(localStorage.getItem('parksky-chart-options'));
	}

	if(!currentPage.includes("starchart") && !currentPage.includes("parkinfo")) {
		getStarChart('default');
	}

	// inserting HTML from a file
// https://css-tricks.com/the-simplest-ways-to-handle-html-includes/
// -- HEADER --
	fetch("../../templates/header.html")
		.then(response => {
			return response.text()
		})
		.then(data => {
			if(date === "" || date === undefined) {
				date = dayjs().format("YYYY-MM-DD");
			}
			$("#site-header").html(data);
			$("#searchParksSelect").val(parkCode);
			$("#visitDate").val(date);

			$(".level-item").removeClass("is-active");

			if(currentPage.includes("starchart")) {
				$(".level-item:nth-child(4)").addClass("is-active");
				displayData(parkCode, date, true, true, false, false);

			} else if(currentPage.includes("parkinfo")) {
				$(".level-item:nth-child(2)").addClass("is-active");
				displayData(parkCode, date, false, false, true, true);

			} else {
				$(".level-item:first-child").addClass("is-active");
				displayData(parkCode, date, true, false, true, false);

			}

			// Near Earth Object alerts from NASA
    	getNEOs();

			// on park change, update both parkInfo and star chart
			$("#searchParksSelect").change(function() {
				if(currentPage.includes("starchart")) {
					displayData($(this).val(), date, true, true, false, false);

				} else if(currentPage.includes("parkinfo")) {
					displayData($(this).val(), date, false, false, true, true);

				} else {
					displayData($(this).val(), date, true, false, true, false);
				}
			});

			// on date change, only update the star chart
			$("#visitDate").change(function() {
				date = $(this).val();
				// relace the prevData date with the new date
				prevParkData.date = $(this).val();
				// save to localStorage
				saveToLocalStorage(prevParkData, 'park');

				getNEOs();
				
				if(!currentPage.includes("parkinfo")) {
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
		});

	// -- INFOBOXES --
	fetch("../../templates/infobox-park.html")
		.then(response => {
			return response.text()
		})
		.then(data => {
			$("#parkInfoContainer").html(data);
		});

	// -- FOOTER --
	fetch("../../templates/footer.html")
		.then(response => {
			return response.text()
		})
		.then(data => {
			$("#site-footer").html(data);
		});
});