$(document).ready(function() {
	// get the saved PARK data AND star chart *options*
	var savedData = JSON.parse(localStorage.getItem('parksky-park-data'));
	var savedOptions = JSON.parse(localStorage.getItem('parksky-chart-options'));

	var date = dayjs(savedData.date);

	for(var option in savedOptions) {
		if(savedOptions[option] == true) {
			$(`#${option}`).removeClass('is-light');
		}
	}

	updateRiseSetData();

	// handle clicking on starChart option buttons
	$("#starchartOptions .button").click(function() {
		// toggle the 'is-light' class (is-light === inactive!)
		$(this).toggleClass("is-light");

		// get options, if any, and save to 
		savedData.drawOptions = getStarChartOptions();

		// finally, get the star chart
		getStarChart(savedData, savedData.date);
	});
});