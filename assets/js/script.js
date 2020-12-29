$("document").ready(function() {
	$("#visitDate").val(dayjs().format("YYYY-MM-DD"));

	var currentPage = window.location.pathname;

	var prevData = JSON.parse(localStorage.getItem('parksky-data')) || null;
	var parkCode, date;

	if(prevData === null) {
		parkCode = "acad";
		date = dayjs().format("YYYY-MM-DD");
		saveLocalStorage(null);
		prevData = JSON.parse(localStorage.getItem('parksky-data'));

	} else {
		parkCode = prevData[0];
		date = prevData[3];
		
	}

	$("#searchParksSelect").val(parkCode);
	$("#visitDate").val(date);

	if(currentPage.includes("index")) {
		displayData($(this).val(), true, false, true, false);
		
	} else if(currentPage.includes("starchart")) {
		displayData($(this).val(), true, true, false, false);

	} else {
		displayData($(this).val(), false, false, true, true);
	}

	// on park change, update both parkInfo and star chart
	$("#searchParksSelect").change(function() {
		if(currentPage.includes("index")) {
			displayData($(this).val(), true, false, true, false);

		} else if(currentPage.includes("starchart")) {
			displayData($(this).val(), true, true, false, false);

		} else {
			displayData($(this).val(), false, false, true, true);
		}
	});

	// on date change, only update the star chart
	$("#visitDate").change(function() {
		date = $(this).val();
		// relace the prevData date with the new date
		prevData.splice(3,1,$(this).val());
		// save to localStorage
		saveLocalStorage(prevData);
		
		if(currentPage.includes("index") || currentPage.includes("starchart")) {
			// get the star chart!
			getStarChart({
				fullName: "n/a",
				latitude: prevData[1],
				longitude: prevData[2],
				date: dayjs(date)
			});
		}
	});
});