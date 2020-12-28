$("document").ready(function() {
	// get the currently selected parkCode
	var code = $("#searchParksSelect").val();
	// display the star chart and parkInfo, but NOT the
	// starChart details or park Details
	displayData(code, true, false, true, false);

	$("#searchParksSelect").change(function() {
		displayData($(this).val(), true, false, true, false);
	});
});