$("document").ready(function() {
	var prevData, parkCode, date, currentPage;
	prevData = JSON.parse(localStorage.getItem('parksky-data')) || null;
	currentPage = window.location.pathname;

	if(prevData === null) {
		parkCode = "acad";
		date = dayjs().format("YYYY-MM-DD");
		saveLocalStorage(null);
		prevData = JSON.parse(localStorage.getItem('parksky-data'));

	} else {
		parkCode = prevData[0];
		date = prevData[3];
		
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

		if(currentPage.includes("starchart")) {
			displayData(parkCode, date, true, true, false, false);

		} else if(currentPage.includes("parkinfo")) {
			displayData(parkCode, date, false, false, true, true);

		} else {
			displayData(parkCode, date, true, false, true, false);

		}

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
			prevData.splice(3,1,$(this).val());
			// save to localStorage
			saveLocalStorage(prevData);
			
			if(currentPage.includes("index") || currentPage.includes("starchart") || !currentPage.includes("parkinfo")) {
				var chartData = {
					fullName: "n/a",
					latitude: prevData[1],
					longitude: prevData[2]
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