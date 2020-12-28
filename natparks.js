var apiKey = "xPkKTrKpbGvpcurV2SJBVh1pC5nv5z4CboFrtrFO"

var natPark = "https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=" + apiKey;

$.ajax({
    url: natPark,
    method: "GET"
}).then(function (response) {
    console.log(response);
})