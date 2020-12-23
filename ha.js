// we want to size our canvases here
(function($) {

  var zoomChart = $('#zoomchart');
  var skyChart = $('#skychart');
  var overlay = $('#overlay');
  sizeToParent(zoomChart);
  sizeToParent(skyChart, true)
  sizeToParent(overlay, true);

  function sizeToParent(obj, square) {
    var p = obj.parent();
    var w = p.width();
    var h = p.height();
    obj.height(square ? w : h);
    obj.width(w);

    // resize the canvas drawing area too -- DEVOPS-1888
    obj[0].width = w;
    obj[0].height = (square ? w : h);

    console.log('%s width %d', obj.attr('id'), w);
  }

  // keep a reference to the sky chart as long as the page is open
  var skychart = null;

  // jQuery startup function called when the page is completely loaded
  $(function() {
    console.log('invoking skychart', HA);
    // create chart instance and provide it with config settings
    skychart = new HA.StSkyChart({
      imageSrc: 'https://skyandtelescope.org/wp-content/plugins/wordpress-skychart//assets/',
      canvasID: 'skychart', // the ID of the canvas where the main chart is to be shown, should be square
      zoomCanvasID: 'zoomchart', // the ID of the canvas where the selected chart is to be shown
      controlsID: 'skychartControls', // the ID of the div which holds all the chart feature check boxes
      staticDataUrl: ajaxurl + '?action=fw_skychart_static_json', // URL of the static data file which contains stars, constellations etc.
      dynamicDataUrl: 'https://www.heavens-above.com/GetSkyChartDynamicData.ashx', // URL of the server script which generates the dynamic data (planets, Sun, Moon)
      zipLookupUrl: 'https://www.heavens-above.com/SkyAndTelescope/LookupZipCode.ashx', // URL of the server script which looks up ZIP codes
      pdfGeneratorUrl: 'https://www.heavens-above.com/SkyAndTelescope/StSkyChartPDF.ashx', // URL of the server script which generates PDF versions of the main chart
      //font: '12px Arial',  // font used in the charts
      hazeMaxAlt: 20, // maximum altitude of the horizon haze in both charts
      moonRadius: 10, // radius of the Moon in pixels
      starRadiusFunc: function(mag) { // function used to compute the radius in pixels of a star, given its magnitude
        var deltaMag = Math.max(5 - mag, 0);
        return 0.5 + Math.pow(deltaMag, 1.3) * 0.6;
      },
      horizonChart: {
        altitudeRange: 20, // altitude range of the selected chart in degrees
        altitudeMax: 80, // maximum altitude of the top of the selected chart
        treesAndBuildingsHeight: 150 // the height of the trees and buidlings graphics above the horizon
      },
      font: '12px Arial',
      colors: { "constellationLines": "#963ee8", "constellationBoundaries": "#008080", "constellationLabels": "#b57fe8", "ecliptic": "#1fa59b", "equator": "#2761a3", "mercury": "#fcfdb7", "venus": "#00ffff", "mars": "#ffc10a", "jupiter": "#fffde1", "saturn": "#fffbbd", "planetLabels": "#ffffff", "starLabels": "#9eb7ff", "specialObjects": "#00d8d8", "specialObjectLabels": "#7fd8d8", "transientObjects": "#fc0000", "transientObjectLabels": "#ff706d", "horizonViewOutline": "#0cc100", "moonSunlit": "#fff6b9", "moonLabel": "#fff5c1", "nightSky": "#000000", "nightSkyHorizon": "#1f5cad", "daySky": "#92aace", "daySkyHorizon": "#ffffff", "twilightSky": "#000040", "twilightSkyHorizon": "#808ea9", "azimuthRingBackground": "#141414", "azimuthRingText": "#eeee22" }
    });
    if (queryStringParamValue('lat') != 0 && queryStringParamValue('long') != 0) {
      var self = skychart;
      var latParts = queryStringParamValue('lat').split(".");
      var longParts = queryStringParamValue('long').split(".");
      self.settings.latitude = parseInt(latParts[0]) + parseInt(latParts[1]) / 60;
      self.settings.longitude = parseInt(longParts[0]) + parseInt(longParts[1]) / 60;

      if (queryStringParamValue('date') != 0) {
        var dateParts = queryStringParamValue('date').split("-");
        var timeParts = String(queryStringParamValue('time') != 0 ? queryStringParamValue('time') : '00:00').split(":");
        var dateString = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
        self.settings.time = dateString.getTime();
      }
      self.saveSettings();
      self.updateUIElements();
      self.render();
    }


  });
})(window.jQuery);

function queryStringParamValue(key) {
  key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
  var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
  if (match != null) {
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
  } else {
    return 0;
  }
}

// initTouchHandlers();