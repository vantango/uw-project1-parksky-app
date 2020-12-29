$("document").ready(function() {
	$("#visitDate").val(dayjs().format("YYYY-MM-DD"));

	// get the currently selected parkCode
	var code = $("#searchParksSelect").val();
	var date = dayjs($("#visitDate").val());
	// display the star chart and parkInfo, but NOT the
	// starChart details or park Details
	displayData(code, true, false, true, false);

	// on park change, update both parkInfo and star chart
	$("#searchParksSelect").change(function() {
		displayData($(this).val(), true, false, true, false);
	});

	// on date change, only update the star chart
	$("#visitDate").change(function() {
		displayData($("#searchParksSelect").val(), true, false, false, false);
	});
});