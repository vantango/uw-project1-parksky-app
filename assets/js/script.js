$("document").ready(function() {
	$("#visitDate").val(dayjs().format("YYYY-MM-DD"));

	var prevData = JSON.parse(localStorage.getItem('parksky-data')) || null;
	var parkCode, date;

	if(prevData === null) {
		parkCode = "acad";
		date = dayjs().format("YYYY-MM-DD");
		saveLocalStorage(null);
	} else {
		parkCode = prevData[0];
		date = prevData[3];
	}

	$("#searchParksSelect").val(parkCode);
	$("#visitDate").val(date);

	// display the star chart and parkInfo, but NOT the
	// starChart details or park Details
	displayData(parkCode, true, false, true, false);

	// on park change, update both parkInfo and star chart
	$("#searchParksSelect").change(function() {
		displayData($(this).val(), true, false, true, false);
	});

	// on date change, only update the star chart
	$("#visitDate").change(function() {
		date = $(this).val();
		// relace the prevData date with the new date
		prevData.splice(3,1,$(this).val());
		// save to localStorage
		saveLocalStorage(prevData);
		// get the star chart!
		getStarChart({
			fullName: "n/a",
			latitude: prevData[1],
			longitude: prevData[2],
			date: dayjs(date)
		});
	});
});