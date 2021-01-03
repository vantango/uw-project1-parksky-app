$("document").ready(function() {
	var prevParkData, prevChartOptions, parkCode, date, currentPage;
	currentPage = window.location.pathname;

	prevParkData = JSON.parse(localStorage.getItem('parksky-park-data')) || null;
	prevChartOptions = JSON.parse(localStorage.getItem('parksky-chart-options')) || null;

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

			// Near Earth Object alerts from NASA
    	getNEOs();

			// on park change, update both parkInfo and star chart
			$("#searchParksSelect").change(function() {
				if(currentPage.includes("starchart")) {
					displayData($(this).val(), date, true, true, false, false);

				} else if(currentPage.includes("parkdetails")) {
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
				
				if(!currentPage.includes("parkdetails")) {
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
	// if we're NOT on the starchart page, we need the park infobox
	if(!currentPage.includes("starchart")) {
		fetch("../../templates/infobox-park.html")
		.then(response => {
			return response.text()
		})
		.then(data => {
			$("#infobox").html(data);
			// display park details if on the park details page
			if(currentPage.includes("parkdetails")) {
				$(".level-item:nth-child(2)").addClass("is-active");
				displayData(parkCode, date, false, false, true, true);

			} else if(!currentPage.includes("starchart")) {
				$(".level-item:first-child").addClass("is-active");
			}
		});
	}
	// otherwise, we want the stars/astronomy infobox
	else {
		fetch("../../templates/infobox-stars.html")
		.then(response => {
			return response.text()
		})
		.then(data => {
			$("#infobox").html(data);
		});
	}

	// -- STARCHART CANVAS --
	fetch("../../templates/starchartcanvas.html")
		.then(response => {
			return response.text()
		})
		.then(data => {
			if(!currentPage.includes("starchart") && !currentPage.includes("parkdetails")) {
				$("#starChartContainer").append(data);
				$(".level-item:first-child").addClass("is-active");
				displayData(parkCode, date, true, false, true, false);
			}

			if(currentPage.includes("starchart")) {
				$("#starChartContainer").prepend(data);
				$(".level-item:nth-child(4)").addClass("is-active");
				displayData(parkCode, date, true, true, false, false);

			}


		});

	// -- FOOTER --
	fetch("../../templates/footer.html")
		.then(response => {
			return response.text()
		})
		.then(data => {
			$("#site-footer").html(data);
		});

	// on resizing the window, resize the star chart canvas appropriately
	// resize functionality from https://stackoverflow.com/a/15881976
	// $(window).resize( resizeCanvas );

	// function resizeCanvas() {
	// 	var canvas = document.getElementById("loc1");
	// 	var ctx = canvas.getContext("2d");
	// 	var newsize =  $(window).width() - (8/12);

	// 	var canvasData = canvas.toDataURL();

	// 	$("#loc1").attr('width', newsize);
	// 	$("#loc1").attr('height', newsize);

	// 	var img = new Image();
	// 	img.onload = function() {
	// 		ctx.drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);
	// 	}
	// 	img.src = canvasData;

	// 	// if(!currentPage.includes("starchart") && !currentPage.includes("parkdetails")) {
	// 	// 	getStarChart('default');
	// 	// } else if(currentPage.includes("starchart")) {
	// 	// 	getStarChart('details');

	// 	// }
	// }
});