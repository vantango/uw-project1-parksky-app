$("document").ready(function() {
	var prevData, parkCode, date, currentPage;
	// inserting HTML from a file
// https://css-tricks.com/the-simplest-ways-to-handle-html-includes/
// -- HEADER --
fetch("../../templates/header.html")
	.then(response => {
		return response.text()
	})
	.then(data => {
		$("#site-header").html(data);
		prevData = JSON.parse(localStorage.getItem('parksky-data')) || null;

		if(prevData === null || prevData[0] === "abli") {
			parkCode = "acad";
			date = dayjs().format("YYYY-MM-DD");
			saveLocalStorage(null);
			prevData = JSON.parse(localStorage.getItem('parksky-data'));

		} else {
			parkCode = prevData[0];
			date = prevData[3];
			
		}

		currentPage = window.location.pathname;

		$("#searchParksSelect").val(parkCode);
		$("#visitDate").val(date);
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


	if(currentPage.includes("starchart")) {
		displayData(parkCode, true, true, false, false);

	} else if(currentPage.includes("parkinfo")) {
		displayData(parkCode, false, false, true, true);

	} else {
		displayData(parkCode, true, false, true, false);

	}

	// on park change, update both parkInfo and star chart
	$("#searchParksSelect").change(function() {
		if(currentPage.includes("starchart")) {
			displayData($(this).val(), true, true, false, false);

		} else if(currentPage.includes("parkinfo")) {
			displayData($(this).val(), false, false, true, true);

		} else {
			displayData($(this).val(), true, false, true, false);
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
			// get the star chart!
			getStarChart({
				fullName: "n/a",
				latitude: prevData[1],
				longitude: prevData[2],
				date: dayjs(date)
			});
		} else {
			displayData(parkCode, false, false, true, false);
		}
	});
});