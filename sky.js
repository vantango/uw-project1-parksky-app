(function(window, document) {
  var $ = window.jQuery;
  var HA = {};
  HA.DEGTORAD = Math.PI / 180;
  HA.TWOPI = Math.PI * 2;
  HA.HALFPI = Math.PI / 2;
  HA.pad2 = function(number) { return ((number < 10) ? "0" : "") + number; };
   HA.Vector = function(args) {
    if (typeof args.coords !== "undefined") { this.x = args.coords[0];
      this.y = args.coords[1];
      this.z = args.coords[2]; } else { var cosd = Math.cos(args.decl);
      this.x = cosd * Math.cos(args.ra);
      this.y = cosd * Math.sin(args.ra);
      this.z = Math.sin(args.decl); }
  }
  HA.Vector.prototype.copy = function() { return new HA.Vector({ coords: [this.x, this.y, this.z] }); };
  HA.Vector.prototype.mag = function() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); };
  HA.Vector.prototype.latitude = function() { return Math.asin(this.z / this.mag()); };
  HA.Vector.prototype.longitude = function() { return Math.atan2(this.y, this.x); };
  HA.Vector.prototype.dotProduct = function(vec2) { return this.x * vec2.x + this.y * vec2.y + this.z * vec2.z; };
  HA.Vector.prototype.angleBetween = function(vec2) { return Math.acos(this.dotProduct(vec2) / (this.mag() * vec2.mag())); };
  HA.Vector.prototype.scale = function(factor) { this.x *= factor;
    this.y *= factor;
    this.z *= factor; };
  HA.Vector.prototype.normalize = function() { this.scale(1 / this.mag()); };
  HA.Vector.prototype.add = function(vec2) { this.x += vec2.x;
    this.y += vec2.y;
    this.z += vec2.z; };
  HA.Vector.prototype.subtract = function(vec2) { this.x -= vec2.x;
    this.y -= vec2.y;
    this.z -= vec2.z; };
  HA.Vector.prototype.vectorProduct = function(vec2) { return new HA.Vector({ coords: [this.y * vec2.z - this.z * vec2.y, this.z * vec2.x - this.x * vec2.z, this.x * vec2.y - this.y * vec2.x] }); };
  HA.Vector.prototype.rotateAboutXAxis = function(angle) { var sine = Math.sin(angle); var cosine = Math.cos(angle); var y = this.y;
    this.y = cosine * y - sine * this.z;
    this.z = sine * y + cosine * this.z };
  HA.Vector.prototype.rotateAboutZAxis = function(angle) { var sine = Math.sin(angle); var cosine = Math.cos(angle); var x = this.x;
    this.x = cosine * x - sine * this.y;
    this.y = sine * x + cosine * this.y };
   HA.Matrix = function(args) {
    if (typeof args.axis !== "undefined") {
      var sine = Math.sin(args.angle);
      var cosine = Math.cos(args.angle);
      if (args.axis == 0)
        this.elems = [1, 0, 0, 0, cosine, -sine, 0, sine, cosine];
      else if (args.axis == 2)
        this.elems = [cosine, -sine, 0, sine, cosine, 0, 0, 0, 1];
    } else { this.elems = args.elems; }
  }
  HA.Matrix.fromArbitraryAxisAndRotation = function(axis, angle) { var x2 = axis.x * axis.x; var y2 = axis.y * axis.y; var z2 = axis.z * axis.z; var sine = Math.sin(angle); var cosine = Math.cos(angle); var oneMinusCos = 1 - cosine; var el00 = x2 + (1 - x2) * cosine; var el01 = axis.x * axis.y * oneMinusCos - axis.z * sine; var el02 = axis.x * axis.z * oneMinusCos + axis.y * sine; var el10 = axis.x * axis.y * oneMinusCos + axis.z * sine; var el11 = y2 + (1 - y2) * cosine; var el12 = axis.y * axis.z * oneMinusCos - axis.x * sine; var el20 = axis.x * axis.z * oneMinusCos - axis.y * sine; var el21 = axis.y * axis.z * oneMinusCos + axis.x * sine; var el22 = z2 + (1 - z2) * cosine; return new HA.Matrix({ elems: [el00, el01, el02, el10, el11, el12, el20, el21, el22] }); }
  HA.Matrix.prototype.vecMult = function(vec) { return new HA.Vector({ coords: [this.elems[0] * vec.x + this.elems[1] * vec.y + this.elems[2] * vec.z, this.elems[3] * vec.x + this.elems[4] * vec.y + this.elems[5] * vec.z, this.elems[6] * vec.x + this.elems[7] * vec.y + this.elems[8] * vec.z] }); }
  HA.Matrix.prototype.copy = function(other) {
    var elems = [];
    for (var i = 0; i < 9; i++) { elems.push(other.elems[i]); }
    return new HA.Matrix({ elems: elems });
  }
  HA.Matrix.prototype.transpose = function() { return new HA.Matrix({ elems: [this.elems[0], this.elems[3], this.elems[6], this.elems[1], this.elems[4], this.elems[7], this.elems[2], this.elems[5], this.elems[8]] }); }
  HA.Matrix.prototype.matMult = function(mat2) { return new HA.Matrix({ elems: [this.elems[0] * mat2.elems[0] + this.elems[1] * mat2.elems[3] + this.elems[2] * mat2.elems[6], this.elems[0] * mat2.elems[1] + this.elems[1] * mat2.elems[4] + this.elems[2] * mat2.elems[7], this.elems[0] * mat2.elems[2] + this.elems[1] * mat2.elems[5] + this.elems[2] * mat2.elems[8], this.elems[3] * mat2.elems[0] + this.elems[4] * mat2.elems[3] + this.elems[5] * mat2.elems[6], this.elems[3] * mat2.elems[1] + this.elems[4] * mat2.elems[4] + this.elems[5] * mat2.elems[7], this.elems[3] * mat2.elems[2] + this.elems[4] * mat2.elems[5] + this.elems[5] * mat2.elems[8], this.elems[6] * mat2.elems[0] + this.elems[7] * mat2.elems[3] + this.elems[8] * mat2.elems[6], this.elems[6] * mat2.elems[1] + this.elems[7] * mat2.elems[4] + this.elems[8] * mat2.elems[7], this.elems[6] * mat2.elems[2] + this.elems[7] * mat2.elems[5] + this.elems[8] * mat2.elems[8]] }); };
  
  HA.Astro = {};
  HA.Astro.RATORAD = Math.PI / 12;
  HA.Astro.ARCSECTORAD = HA.DEGTORAD / 3600;
  HA.Astro.OBLIQUITY_2000 = 23.43929111 * HA.DEGTORAD;
  HA.Astro.J2000_TIME = 946728000000;
  HA.Astro.EARTH_RADIUS = 6378;
  HA.Astro.AU = 149597870.66;
  HA.Astro.gha = function(t) { var tu = HA.Astro.getCenturiesSinceJ2000(t); var gmst = 24110.54841 + (8640184.812866 + (0.093104 - 0.0000062 * tu) * tu) * tu;
    gmst += (t % 86400000) * 0.001;
    gmst = (gmst / 13750.987) % HA.TWOPI; if (gmst < 0) gmst += HA.TWOPI; return gmst; }
  HA.Astro.getCenturiesSinceJ2000 = function(t) { var ticks = t - HA.Astro.J2000_TIME; return ticks / (36525.0 * 86400000); }
  HA.Astro.getPrecessionMatrix = function(t) { var T = HA.Astro.getCenturiesSinceJ2000(t); var T2 = T * T; var T3 = T2 * T; var eta = (0.6406161 * T + 0.0000839 * T2 + 0.000005 * T3) * HA.DEGTORAD; var zeta = (0.6406161 * T + 0.0003041 * T2 + 0.0000051 * T3) * HA.DEGTORAD; var theta = (0.556753 * T - 0.0001185 * T2 - 0.0000116 * T3) * HA.DEGTORAD; var ce = Math.cos(eta); var se = Math.sin(eta); var cz = Math.cos(zeta); var sz = Math.sin(zeta); var ct = Math.cos(theta); var st = Math.sin(theta); return new HA.Matrix({ elems: [ce * ct * cz - se * sz, -se * ct * cz - ce * sz, -st * cz, ce * ct * sz + se * cz, -se * ct * sz + ce * cz, -st * sz, ce * st, -se * st, ct] }); }
  HA.Astro.to1875 = HA.Astro.getPrecessionMatrix(new Date(1875, 0, 1).getTime());
  HA.Astro.from1875 = HA.Astro.to1875.transpose();
  HA.Astro.formatLatLong = function(latitude, longitude) { var totalMinutes = Math.round(60 * latitude); var sign = (totalMinutes < 0 ? 'S' : 'N');
    totalMinutes = Math.abs(totalMinutes); var degrees = Math.floor(totalMinutes / 60); var mins = Math.floor(totalMinutes % 60); var coords = "Latitude: " + degrees + "Â° " + mins + "' " + sign + "  Longitude: ";
    totalMinutes = Math.round(60 * longitude);
    sign = (totalMinutes < 0 ? 'W' : 'E');
    totalMinutes = Math.abs(totalMinutes);
    degrees = Math.floor(totalMinutes / 60);
    mins = Math.floor(totalMinutes % 60); return coords + degrees + "Â° " + mins + "' " + sign; }
  HA.Astro.formatDecl = function(radians) { var totalMinutes = Math.round(60 * radians / HA.DEGTORAD); var sign = (totalMinutes < 0 ? '-' : '');
    totalMinutes = Math.abs(totalMinutes); var degrees = Math.floor(totalMinutes / 60); var mins = Math.floor(totalMinutes % 60); return sign + degrees + "Â° " + mins + "'"; }
  HA.Astro.formatRA = function(radians) {
    var ra = radians / this.RATORAD;
    if (ra < 0)
      ra += 24;
    var totalMinutes = Math.round(ra * 60);
    var hours = Math.floor(totalMinutes / 60);
    var mins = Math.floor(totalMinutes % 60);
    return hours + "h " + mins + "m";
  }
  HA.Astro.constellationFromCelestialPoint = function(celestialPoint, regions) {
    var pos1875 = HA.Astro.to1875.vecMult(celestialPoint);
    var secRA = Math.round(Math.floor(pos1875.longitude() / HA.Astro.ARCSECTORAD / 15));
    if (secRA < 0) { secRA += 24 * 3600; }
    var secDec = Math.round(Math.ceil(pos1875.latitude() / HA.Astro.ARCSECTORAD));
    for (regIX = 0; regIX < regions.length; regIX += 4) { if (secDec >= regions[regIX + 2]) { if ((secRA >= regions[regIX]) && (secRA < regions[regIX + 1])) { return regions[regIX + 3]; } } }
    return null;
  }
  HA.Astro.reduceAngleDegrees = function(angle) {
    while (angle < 0) { angle += 360; }
    while (angle > 360) { angle -= 360; }
    return angle;
  }
  
  HA.PositionPoly = function(startTime, endTime, coeffs) { this.order = coeffs.length / 3 - 1;
    this.comps = 3;
    this.coeffs = coeffs;
    this.midRange = (startTime + endTime) / 2;
    this.halfInterval = (endTime - startTime) / 2; }
  HA.PositionPoly.prototype.evaluate = function(x) {
    var retVals = new Array();
    var xx = (x - this.midRange) / this.halfInterval;
    var xx2 = 2 * xx;
    var t = new Array();
    t[0] = 1;
    t[1] = xx;
    for (j = 2; j <= this.order; j++)
      t[j] = xx2 * t[j - 1] - t[j - 2];
    for (c = 0; c < this.comps; c++) {
      retVals[c] = 0.5 * this.coeffs[c];
      for (j = 1; j <= this.order; j++)
        retVals[c] += this.coeffs[j * this.comps + c] * t[j];
    }
    return new HA.Vector({ coords: retVals });
  }
  
  HA.StSkyChart = function(config) {
    this.version = '0.9.1';
    this.canvas = document.getElementById(config.canvasID);
    this.zoomcanvas = document.getElementById(config.zoomCanvasID);
    this.staticDataUrl = config.staticDataUrl;
    this.dynamicDataUrl = config.dynamicDataUrl;
    this.zipLookupUrl = config.zipLookupUrl;
    this.pdfGeneratorUrl = config.pdfGeneratorUrl;
    this.starRadiusFunc = config.starRadiusFunc;
    this.imageSrc = config.imageSrc;
    var self = this;
    this.overlayCanvas = document.getElementById("overlay");
    this.context = this.canvas.getContext("2d");
    this.overlayContext = this.overlayCanvas.getContext("2d");
    this.zoomcontext = this.zoomcanvas.getContext("2d");
    this.cul = config.culture;
    if (this.cul === undefined)
      this.cul = 'en';
    this.constellationLineColor = config.constellationLineColor;
    this.constellationBoundaryColor = config.constellationBoundaryColor;
    this.config = config;
    this.dynamicBlocks = {};
    this.imgCircular = new Image();
    this.circularHorizonLoaded = false;
    this.imgCircular.onload = function() { self.circularHorizonLoaded = true;
      self.render(); }
    this.imgCircular.src = this.imageSrc + 'horizon.png';
    this.imgLinear = new Image();
    this.horizonLoaded = false;
    this.imgLinear.onload = function() { self.horizonLoaded = true;
      self.renderZoomedChart(); }
    this.imgLinear.src = this.imageSrc + 'flathorizon.png';
    this.settingsKey = 'skyChart_ST_settings';
    var settingsJSON = localStorage[this.settingsKey];
    if (settingsJSON == null) {
      this.settings = {};
      this.settings.version = 1;
      this.settings.latitude = 0;
      this.settings.longitude = 0;
      this.settings.location = 'unspecified';
      if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(function(position) { self.settings.latitude = position.coords.latitude;
          self.settings.longitude = position.coords.longitude;
          self.settings.location = 'Set from geolocation service';
          self.saveSettings();
          self.updateUIElements();
          self.render(); }); }
      var time = new Date();
      time.setHours(21);
      time.setMinutes(0);
      time.setSeconds(0);
      time.setMilliseconds(0);
      this.settings.time = time.getTime();
      this.settings.showConsNames = true;
      this.settings.showStarNames = true;
      this.settings.showEcliptic = true;
      this.settings.showSpecials = false;
      this.settings.showEquator = false;
      this.settings.showConstellationLines = true;
      this.settings.showConstellationBoundaries = false;
      this.settings.showPlanetLabels = true;
      this.settings.showBuildings = true;
      this.settings.showDaylight = true;
      this.settings.showTransientObjects = true;
      this.settings.use24hClock = true;
      this.settings.autoTime = true;
      this.settings.zoomAzimuth = 270;
      this.settings.autoTime = true;
      this.settings.utcOffset = 0;
      localStorage[this.settingsKey] = JSON.stringify(this.settings);
    } else { this.settings = JSON.parse(settingsJSON); if (this.settings.autoTime === undefined) { this.settings.autoTime = true;
        this.settings.utcOffset = 0; } }
    if (sessionStorage.initDialogShown != "true") { time = new Date();
      time.setHours(21);
      time.setMinutes(0);
      time.setSeconds(0);
      time.setMilliseconds(0);
      this.settings.time = time.getTime(); }
    this.mousePos = null;
    this.selectedObject = null;
    this.mousePosVisible = false;
    this.zoomAltRange = config.horizonChart.altitudeRange;
    this.zoomAltMin = 0;
    this.zoomAltMax = config.horizonChart.altitudeMax;
    this.zoomAlt = this.zoomAltMin + this.zoomAltRange / 2;
    this.azimuthScaleHeight = 20;
    this.zoomHeight = this.zoomcanvas.height - this.azimuthScaleHeight;
    this.treesAndBuildingsHeight = config.horizonChart.treesAndBuildingsHeight;
    this.dragging = false;
    var needReload = false;
    if (localStorage['staticData'] == null) { needReload = true; } else {
      this.staticData = JSON.parse(localStorage['staticData']);
      if (typeof this.staticData.version == 'undefined' || this.staticData.version < 4)
        needReload = true;
    }
    $('#selMonth').append('<option value="0">January</option>');
    $('#selMonth').append('<option value="1">February</option>');
    $('#selMonth').append('<option value="2">March</option>');
    $('#selMonth').append('<option value="3">April</option>');
    $('#selMonth').append('<option value="4">May</option>');
    $('#selMonth').append('<option value="5">June</option>');
    $('#selMonth').append('<option value="6">July</option>');
    $('#selMonth').append('<option value="7">August</option>');
    $('#selMonth').append('<option value="8">September</option>');
    $('#selMonth').append('<option value="9">October</option>');
    $('#selMonth').append('<option value="10">November</option>');
    $('#selMonth').append('<option value="11">December</option>');
    for (var d = 1; d < 32; d++) { $('#selDay').append('<option value="' + d + '">' + HA.pad2(d) + '</option>'); }
    for (var m = 0; m < 60; m++) { $('#selMinute').append('<option value="' + m + '">' + HA.pad2(m) + '</option>'); }
    $("input:checkbox").each(function() { $(this).attr('checked', self.settings[$(this).attr('name')]); });
    if (needReload)
      $.getJSON(this.staticDataUrl, function(data) { self.onStaticDataReceived(data); });
    this.overlayCanvas.addEventListener('mousedown', function(evt) { self.onMouseDown(evt); }, false);
    this.overlayCanvas.addEventListener('mousemove', function(evt) { self.onMouseMove(evt); }, false);
    this.overlayCanvas.addEventListener('mouseup', function(evt) { self.onMouseUp(evt); }, false);
    $("input:checkbox").on('click', function(evt) { self.onDisplayOptionClick(evt) });
    $("#btnSubmit").on('click', function(evt) { self.onTimeControlButtonClick(evt) });
    $("#btnResetTime").on('click', function(evt) { self.onResetTimeButtonClick(evt) });
    $("#btnPlusDay").on('click', function(evt) { self.addTimeDelta(86400000) });
    $("#btnMinusDay").on('click', function(evt) { self.addTimeDelta(-86400000) });
    $("#btnPlusHour").on('click', function(evt) { self.addTimeDelta(3600000) });
    $("#btnMinusHour").on('click', function(evt) { self.addTimeDelta(-3600000) });
    $("#btnPlusMin").on('click', function(evt) { self.addTimeDelta(60000) });
    $("#btnMinusMin").on('click', function(evt) { self.addTimeDelta(-60000) });
    $("#btnEnterZip").on('click', function(evt) { self.initZipDialog() });
    $("#btnSelectCity").on('click', function(evt) { self.initSearchDialog(evt) });
    $("#btnEnterManually").on('click', function(evt) { self.initManualDialog(evt) });
    $("#btnPrint").on('click', function() { self.print() });
    $("#btnChangeUtcOffset").on('click', function(evt) { self.initUtcOffsetDialog(evt) });
    this.updateUIElements();
    if (sessionStorage.initDialogShown === undefined) { this.initInfoDialog();
      sessionStorage.initDialogShown = "true"; }
  }
  HA.StSkyChart.prototype.computeZoomChartTransformations = function() { var azCenter = this.settings.zoomAzimuth * HA.DEGTORAD; var altCenter = this.zoomAlt * HA.DEGTORAD;
    this.rotMatrixZoom = new HA.Matrix({ 'axis': 2, 'angle': Math.PI - azCenter });
    this.rotMatrixZoom = new HA.Matrix({ 'axis': 0, 'angle': HA.HALFPI - altCenter }).matMult(this.rotMatrixZoom);
    this.rotMatrixZoomCanvasToTopo = this.rotMatrixZoom.transpose();
    this.rotMatrixZoom = this.rotMatrixZoom.matMult(this.rotMatrix);
    this.rZoom = this.zoomHeight / (2 * Math.tan(this.zoomAltRange * HA.DEGTORAD / 4)); }
  HA.StSkyChart.prototype.formatUtcOffset = function(offsetms) {
    var sign = '+';
    if (offsetms < 0) { sign = '-';
      offsetms = -offsetms; }
    var hours = Math.floor(offsetms / 3600000);
    var mins = Math.floor((offsetms - hours * 3600000) / 60000);
    return sign + HA.pad2(hours) + ":" + HA.pad2(mins);
  }
  HA.StSkyChart.prototype.initUtcOffsetDialog = function() {
    $('body').append('<div id="dialogUtcOffset"></div>');
    $('#dialogUtcOffset').append('<table><tr><td align="right" valign="top"><label for="auto"><b>Automatic</b></label><input type="radio" name="automan" id="auto" value="auto" /></td><td>(uses computer time zone and automatically adjusts for DST)</td></tr>' + '<tr><td></td>&nbsp;</tr><tr><td align="right"><label for="man"><b>Manual</b></label><input type="radio" id="man" name="automan" value="man" /></td>' + '<td><label for="selHours">Hours</label> <select id="selHours" name="offsetHours" class="text ui-widget-content ui-corner-all"></select> ' + '<label for="selMins">Minutes</label> <select id="selMins" name="offsetMins" class="text ui-widget-content ui-corner-all"></select>' + '</td></tr></table><br />');
    var self = this;
    for (var h = -13; h < 14; h++) { $('#selHours').append('<option value="' + h + '">' + (h < 0 ? '-' : '+') + HA.pad2(Math.abs(h)) + '</option>'); }
    for (var m = 0; m < 60; m += 15) { $('#selMins').append('<option value="' + m + '">' + HA.pad2(m) + '</option>'); }
    if (this.settings.autoTime) { $("input[name=automan][value=auto]").attr('checked', 'checked');
      $('#selHours').val(0);
      $('#selMins').val(0);
      $('#selHours').prop('disabled', true);
      $('#selMins').prop('disabled', true); } else {
      $("input[name=automan][value=man]").attr('checked', 'checked');
      var offset = Math.abs(this.settings.utcOffset);
      var hours = Math.floor(offset / 3600000);
      var mins = Math.abs((offset - hours * 3600000) / 60000);
      if (this.settings.utcOffset < 0)
        hours = -hours;
      $('#selHours').val(hours);
      $('#selMins').val(mins);
      $('#selHours').prop('disabled', false);
      $('#selMins').prop('disabled', false);
    }
    $('input[type=radio][name=automan]').change(function() {
      if (this.value == 'auto') { $('#selHours').prop('disabled', true);
        $('#selMins').prop('disabled', true); } else { $('#selHours').prop('disabled', false);
        $('#selMins').prop('disabled', false); }
    })
    this.dialog = $('#dialogUtcOffset').dialog({
      title: 'Set UTC offset',
      autoOpen: false,
      modal: true,
      width: 500,
      closeOnEscape: false,
      resizable: true,
      buttons: {
        "OK": function() {
          if ($('input[name=automan]:checked').val() == 'auto') { self.settings.autoTime = true; } else {
            self.settings.autoTime = false;
            hours = $("#selHours").val();
            mins = $("#selMins").val();
            if (hours < 0)
              mins = -mins;
            self.settings.utcOffset = hours * 3600000 + mins * 60000;
          }
          self.saveSettings();
          self.updateUIElements();
          self.dialog.dialog("close");
          $('#dialogUtcOffset').remove();
        },
        Cancel: function() { self.dialog.dialog("close");
          $('#dialogUtcOffset').remove(); }
      }
    });
    this.dialog.dialog("open");
  }
  HA.StSkyChart.prototype.initZipDialog = function() {
    $('body').append('<div id="dialogZip"><label for="zip">Zip or post code</label> <input type="text" name="zip" id="zip" value="" size="8" class="text ui-widget-content ui-corner-all"></div>');
    $('#dialogZip').append('<p id="errormsg" class="errormsg"><p />');
    var self = this;
    this.dialog = $('#dialogZip').dialog({
      title: 'Enter US zip code or Canadian post code',
      autoOpen: false,
      modal: true,
      width: 400,
      closeOnEscape: false,
      resizable: false,
      buttons: {
        "OK": function() {
          var zip = $('#zip').val();
          $.getJSON(self.zipLookupUrl + '?zip=' + zip, function(data) {
            if (data.status == "OK") { self.settings.latitude = data.latitude;
              self.settings.longitude = data.longitude;
              self.settings.location = data.city + ", " + data.state + ' ' + zip;
              self.saveSettings();
              self.updateUIElements();
              self.render();
              self.dialog.dialog("close");
              $('#dialogZip').remove(); } else { $('#errormsg').text("zip code not found"); }
          });
        },
        Cancel: function() { self.dialog.dialog("close");
          $('#dialogZip').remove(); }
      }
    });
    this.dialog.dialog("open");
  }
  HA.StSkyChart.prototype.initSearchDialog = function() {
    $('body').append('<div id="dialogSearch"><label for="duration">Place name</label> <input type="text" name="place" id="place" value="" class="text ui-widget-content ui-corner-all" style="width:300px" /></div>');
    $('#dialogSearch').append(' <input type="button" id="btnSearch" value="Search" ><p />');
    $('#dialogSearch').append('<p id="errormsg" class="errormsg"><p />');
    $('#dialogSearch').append('Search results<br /><select id="results"></select>');
    var self = this;
    var searchResults = null;
    $('#btnSearch').click(function() {
      var place = $('#place').val();
      var geocoder = new google.maps.Geocoder();
      $("#results").empty();
      geocoder.geocode({ 'address': place }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) { searchResults = results; var x = $("#results");
          $.each(results, function(ix, result) { x.append($('<option></option>').val(ix).html(result.formatted_address)); }); } else { $('#errormsg').text("Geocode was not successful for the following reason: " + status); }
      });
    });
    this.dialog = $('#dialogSearch').dialog({ title: 'Search for a place name', autoOpen: false, modal: true, width: 500, closeOnEscape: false, resizable: true, buttons: { "OK": function() { var i = $("#results").val(); if (i != null) { var result = searchResults[i];
            self.settings.latitude = result.geometry.location.lat();
            self.settings.longitude = result.geometry.location.lng();
            self.settings.location = result.formatted_address;
            self.saveSettings();
            self.updateUIElements();
            self.render();
            self.dialog.dialog("close");
            $('#dialogSearch').remove(); } }, Cancel: function() { self.dialog.dialog("close");
          $('#dialogSearch').remove(); } } });
    this.dialog.dialog("open");
  }
  HA.StSkyChart.prototype.initManualDialog = function() {
    $('body').append('<div id="dialogManual"></div>');
    $('#dialogManual').append('<table><tr><td>Latitude</td><td><input type="text" name="latDeg" id="latDeg"value="" class="text ui-widget-content ui-corner-all" size="3" /> Â° ' + '<input type="text" name="latMin" id="latMin" value=""class="text ui-widget-content ui-corner-all" size="2" /> \'&nbsp;&nbsp;&nbsp;</td>' + '<td>N<input type="radio" name="NS" value="N" checked="checked" /> ' + 'S<input type="radio" name="NS" value="S" /></td></tr>' + '<tr><td>Longitude</td><td><input type="text" name="longDeg" id="longDeg" value="" class="text ui-widget-content ui-corner-all" size="3" /> Â° ' + '<input type="text" name="longMin" id="longMin" value="" class="text ui-widget-content ui-corner-all" size="2" /> \'&nbsp;&nbsp;&nbsp;</td>' + '<td>W<input type="radio" name="EW" value="W" checked="checked" /> ' + 'E<input type="radio" name="EW" value="E" /></td></tr></table><br />' + 'Name (optional) <input type="text" id="location" class="text ui-widget-content ui-corner-all" />' + '<p id="errormsg" class="errormsg"><p />');
    var minLatitude = Math.abs(Math.round(this.settings.latitude * 60));
    $('#latDeg').val(Math.floor(minLatitude / 60));
    $('#latMin').val(minLatitude % 60);
    $("input[name=NS][value=" + (this.settings.latitude < 0 ? "S" : "N") + "]").attr('checked', 'checked');
    var minLongitude = Math.abs(Math.round(this.settings.longitude * 60));
    $('#longDeg').val(Math.floor(minLongitude / 60));
    $('#longMin').val(minLongitude % 60);
    $("input[name=EW][value=" + (this.settings.longitude < 0 ? "W" : "E") + "]").attr('checked', 'checked');
    $('#location').val(this.settings.location);
    var self = this;
    this.dialog = $('#dialogManual').dialog({
      title: 'Manually enter latitude and longitude',
      autoOpen: false,
      modal: true,
      resizable: false,
      closeOnEscape: false,
      buttons: {
        "OK": function() {
          self.settings.latitude = parseInt($('#latDeg').val()) + parseInt($('#latMin').val()) / 60;
          self.settings.longitude = parseInt($('#longDeg').val()) + parseInt($('#longMin').val()) / 60;
          var ns = $("input[name=NS]:checked").val();
          if (ns == "S")
            self.settings.latitude = -self.settings.latitude;
          var ew = $("input[name=EW]:checked").val();
          if (ew == "W")
            self.settings.longitude = -self.settings.longitude;
          self.settings.location = $('#location').val();
          self.saveSettings();
          self.updateUIElements();
          self.render();
          self.dialog.dialog("close");
          $('#dialogManual').remove();
        },
        Cancel: function() { self.dialog.dialog("close");
          $('#dialogManual').remove(); }
      }
    });
    this.dialog.dialog("open");
  }
  HA.StSkyChart.prototype.initInfoDialog = function() {
    var timeString;
    var formatString = 'YYYY MMMM Do, HH:mm Z';
    if (this.settings.autoTime) { var mom = moment(this.settings.time);
      timeString = mom.format(formatString); } else { var timezone = 'UCT';
      mom = moment.tz(this.settings.time + this.settings.utcOffset, timezone);
      timeString = mom.format(formatString, timezone); }
    var locString = this.settings.location + '<br />' + HA.Astro.formatLatLong(this.settings.latitude, this.settings.longitude);
    $('#container').append('<div id="dialogInfo" style="z-index:3000;"><p>The chart is initialized to the following time and place settings;</p><table><tr><td style="vertical-align:top">Location:</td><td><b>' + locString + '</b></td></tr>' + '<tr><td>Time:</td><td><b>' + timeString + '</b></td></tr></table></div>');
    $('#dialogInfo').append('<p>Use the location and time controls to modify these settings.</p>');
    this.dialog = $('#dialogInfo').dialog({ title: 'Initial time and place settings', autoOpen: false, modal: true, width: 500, closeOnEscape: true, resizable: false, buttons: { "OK": function() { $('#dialogInfo').remove(); } } });
    this.dialog.dialog("moveToTop");
    this.dialog.dialog("open");
  }
  HA.StSkyChart.prototype.onTimeControlButtonClick = function(ev) {
    var y, m, d, h, mi;
    var isValid = this.validateField($('#txtYear'), 1600, 2400);
    if (isValid) {
      y = parseInt($('#txtYear').val());
      m = parseInt($('#selMonth').val());
      d = parseInt($('#selDay').val());
      h = parseInt($('#selHour').val());
      mi = parseInt($('#selMinute').val());
      if (!this.settings.use24hClock) {
        var isAM = $("input[name=ampm][value=am]").prop('checked');
        if (h == 12)
          h = 0;
        if (!isAM)
          h += 12;
      }
      if (this.settings.autoTime)
        this.settings.time = moment([y, m, d, h, mi, 0]).valueOf();
      else
        this.settings.time = moment.tz([y, m, d, h, mi, 0], "UCT").valueOf() - this.settings.utcOffset;
      this.saveSettings();
    } else
      return;
    this.render();
    this.setTimeControls();
  }
  HA.StSkyChart.prototype.validateField = function(field, min, max) {
    v = parseInt(field.val());
    if (v < min || v > max) { field.css({ "border": "1px solid red", "background": "#FFCECE" }); return false; } else { field.css({ "border": "1px solid black", "background": "#FFFFFF" }); return true; }
  }
  HA.StSkyChart.prototype.onResetTimeButtonClick = function(ev) { this.settings.time = new Date().getTime();
    this.saveSettings();
    this.render();
    this.setTimeControls(); }
  HA.StSkyChart.prototype.addTimeDelta = function(dt) { this.settings.time += dt;
    this.saveSettings();
    this.render();
    this.setTimeControls(); }
  HA.StSkyChart.prototype.setTimeControls = function() {
    $("#selHour option").remove();
    var h;
    if (this.settings.use24hClock) { $('.ampm').hide(); for (h = 0; h < 24; h++) { $('#selHour').append('<option value="' + h + '">' + HA.pad2(h) + '</option>'); } } else { $('.ampm').show(); for (h = 1; h < 13; h++) { $('#selHour').append('<option value="' + h + '">' + HA.pad2(h) + '</option>'); } }
    var isAM = false;
    if (this.settings.autoTime) {
      var mom = moment(this.settings.time);
      $('#txtYear').val(mom.format('YYYY'));
      $('#selMonth').val(mom.format('M') - 1);
      $('#selDay').val(mom.format('D'));
      $('#selHour').val(mom.format((this.settings.use24hClock ? 'H' : 'h')));
      $('#selMinute').val(mom.format('m'));
      $('#utcOffset').text(mom.format('Z') + '  (automatic)');
      $('#chartDate').text(mom.format('MMM D, YYYY'));
      isAM = (mom.hour() < 12);
      if (this.settings.use24hClock)
        $('#chartTime').text(mom.format('HH:mm') + ' (UTC' + mom.format('Z') + ')');
      else
        $('#chartTime').text(mom.format('h:mm a') + ' (UTC' + mom.format('Z') + ')');
    } else {
      var timezone = 'UCT';
      var mom = moment.tz(this.settings.time + this.settings.utcOffset, timezone);
      $('#txtYear').val(mom.format('YYYY', timezone));
      $('#selMonth').val(mom.format('M', timezone) - 1);
      $('#selDay').val(mom.format('D', timezone));
      $('#selHour').val(mom.format((this.settings.use24hClock ? 'H' : 'h'), timezone));
      $('#selMinute').val(mom.format('m', timezone));
      $('#utcOffset').text(this.formatUtcOffset(this.settings.utcOffset) + '  (manual)');
      $('#chartDate').text(mom.format('MMM D, YYYY', timezone));
      isAM = (mom.format('a', timezone) == 'am');
      if (this.settings.use24hClock)
        $('#chartTime').text(mom.format('HH:mm', timezone) + ' (UTC' + this.formatUtcOffset(this.settings.utcOffset) + ')');
      else
        $('#chartTime').text(mom.format('h:mm a', timezone) + ' (UTC' + this.formatUtcOffset(this.settings.utcOffset) + ')');
    }
    if (!this.settings.use24hClock) {
      if (isAM)
        $("input[name=ampm][value=am]").prop('checked', true);
      else
        $("input[name=ampm][value=pm]").prop('checked', true);
    }
  }
  HA.StSkyChart.prototype.onDisplayOptionClick = function(ev) { var jqe = $(ev.target);
    this.settings[ev.target.name] = (jqe.is(':checked'));
    this.setTimeControls();
    this.render();
    this.saveSettings();
    this.updateUIElements(); }
  HA.StSkyChart.prototype.getDynamicDataBlockForTime = function(t) {
    var blockNum = (Math.floor(t / 86400000)).toFixed();
    if (isNaN(blockNum))
      return null;
    var blockID = 'b' + blockNum;
    if (this.dynamicBlocks[blockID] !== undefined)
      return this.dynamicBlocks[blockID];
    this.dynamicBlocks[blockID] = { loaded: false };
    var self = this;
    $.getJSON(this.dynamicDataUrl + '?blockID=' + blockID, function(block) { self.onDynamicBlockReceived(blockID, block); });
    return this.dynamicBlocks[blockID];
  }
  HA.StSkyChart.prototype.onDynamicBlockReceived = function(blockID, block) { this.dynamicBlocks[blockID].data = block;
    this.dynamicBlocks[blockID].loaded = true;
    this.render(); }
  HA.StSkyChart.prototype.saveSettings = function() { localStorage[this.settingsKey] = JSON.stringify(this.settings); }
  HA.StSkyChart.prototype.onMouseDown = function(evt) {
    var mousePos = this.getMousePos(evt);
    var mouseTopo = this.canvasToTopo(mousePos);
    var alt = mouseTopo.latitude() / HA.DEGTORAD;
    if (alt > this.zoomAltMax)
      return;
    var az = 90 - mouseTopo.longitude() / HA.DEGTORAD;
    if (az < 0)
      az += 360;
    this.azDragStart = az;
    this.altDragStart = alt;
    this.chartAzDragStart = this.settings.zoomAzimuth;
    this.chartAltDragStart = this.zoomAlt;
    var deltaAz = az - this.settings.zoomAzimuth;
    if (deltaAz < -360)
      deltaAz += 360;
    if (deltaAz > 360)
      deltaAz -= 360;
    if (deltaAz > 180)
      deltaAz = 360 - deltaAz;
    if (deltaAz < -180)
      deltaAz = 360 + deltaAz;
    this.dragging = true;
  }
  HA.StSkyChart.prototype.onMouseMove = function(evt) {
    if (!this.dragging)
      return;
    var mousePos = this.getMousePos(evt);
    var mouseTopo = this.canvasToTopo(mousePos);
    if (mouseTopo == null)
      return;
    var alt = mouseTopo.latitude() / HA.DEGTORAD;
    if (alt > this.zoomAltMax)
      return;
    var azimuth = 90 - mouseTopo.longitude() / HA.DEGTORAD;
    if (azimuth < 0)
      azimuth += 360;
    var deltaAz = azimuth - this.azDragStart;
    var deltaAlt = alt - this.altDragStart;
    this.settings.zoomAzimuth = this.fixAngle(deltaAz + this.chartAzDragStart);
    this.zoomAlt = deltaAlt + this.chartAltDragStart;
    this.zoomAlt = Math.max(this.zoomAlt, this.zoomAltMin + this.zoomAltRange / 2);
    this.zoomAlt = Math.min(this.zoomAlt, this.zoomAltMax - this.zoomAltRange / 2);
    this.saveSettings();
    this.renderOverlay();
    this.renderZoomedChart();
  }
  HA.StSkyChart.prototype.fixAngle = function(angle) {
    var temp = angle;
    while (temp >= 360)
      temp -= 360;
    while (temp < 0)
      temp += 360;
    return temp;
  }
  HA.StSkyChart.prototype.onMouseUp = function(evt) {
    if (this.dragging = false)
      return;
    this.dragging = false;
    this.renderZoomedChart();
  }
  HA.StSkyChart.prototype.getMousePos = function(evt) { var rect = this.canvas.getBoundingClientRect(); return { x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width, y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height } }
  HA.StSkyChart.prototype.drawStar = function(ctx, x, y, innerRadius, outerRadius, numPoints) {
    ctx.beginPath();
    var da = HA.TWOPI / numPoints;
    ctx.moveTo(x, y - outerRadius);
    for (i = 0; i < numPoints; i++) { var angle = (i + 0.5) * da;
      ctx.lineTo(x + innerRadius * Math.sin(angle), y - innerRadius * Math.cos(angle));
      angle = (i + 1) * da;
      ctx.lineTo(x + outerRadius * Math.sin(angle), y - outerRadius * Math.cos(angle)); }
    ctx.lineTo(x, y - outerRadius);
  }
  HA.StSkyChart.prototype.renderOverlay = function() {
    var ctx = this.overlayContext;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x0, this.y0, this.radius, 0, HA.TWOPI, true);
    ctx.clip();
    ctx.strokeStyle = (this.daylightMode ? 'black' : this.config.colors.horizonViewOutline);
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.computeZoomChartTransformations();
    var x = 0;
    var y = 0;
    var p = this.zoomCanvasToMainCanvas(x, y);
    ctx.moveTo(p.x, p.y);
    y = 0;
    var pointsPerEdge = 10;
    for (var i = 1; i <= pointsPerEdge; i++) { x = this.zoomcanvas.width * (i / pointsPerEdge);
      p = this.zoomCanvasToMainCanvas(x, y);
      ctx.lineTo(p.x, p.y); }
    x = this.zoomcanvas.width;
    for (i = 1; i <= pointsPerEdge; i++) { y = this.zoomHeight * (i / pointsPerEdge);
      p = this.zoomCanvasToMainCanvas(x, y);
      ctx.lineTo(p.x, p.y); }
    y = this.zoomHeight;
    for (var i = pointsPerEdge - 1; i >= 0; i--) { x = this.zoomcanvas.width * (i / pointsPerEdge);
      p = this.zoomCanvasToMainCanvas(x, y);
      ctx.lineTo(p.x, p.y); }
    x = 0;
    for (i = pointsPerEdge - 1; i >= 0; i--) { y = this.zoomHeight * (i / pointsPerEdge);
      p = this.zoomCanvasToMainCanvas(x, y);
      ctx.lineTo(p.x, p.y); }
    ctx.stroke();
    ctx.restore();
  }
  HA.StSkyChart.prototype.render = function() {
    this.x0 = this.canvas.width / 2;
    this.y0 = this.canvas.height / 2;
    this.radius = this.x0 - this.azimuthScaleHeight;
    this.radsPerPixel = Math.PI / (this.radius * 2);
    var x0 = this.x0;
    var y0 = this.y0;
    var radius = this.radius;
    var ctx = this.context;
    var tt = this.settings.time;
    var gha = HA.Astro.gha(this.settings.time);
    var zenithRA = this.settings.longitude * HA.DEGTORAD + gha;
    var zenithDec = this.settings.latitude * HA.DEGTORAD;
    this.observerPos = new HA.Vector({ ra: zenithRA, decl: zenithDec });
    var precMatrix = HA.Astro.getPrecessionMatrix(tt).transpose();
    this.observerPos = precMatrix.vecMult(this.observerPos);
    this.zenith = this.observerPos.copy();
    this.observerPos.scale(HA.Astro.EARTH_RADIUS);
    zenithRA = this.observerPos.longitude();
    zenithDec = this.observerPos.latitude();
    this.rotMatrix = new HA.Matrix({ 'axis': 2, 'angle': HA.HALFPI - zenithRA });
    this.rotMatrix = new HA.Matrix({ 'axis': 0, 'angle': -zenithDec - HA.HALFPI }).matMult(this.rotMatrix);
    this.rotMatrixInv = this.rotMatrix.transpose();
    var block = this.getDynamicDataBlockForTime(tt);
    if (block && block.loaded) { var cheby = new HA.PositionPoly(block.data.t1, block.data.t2, block.data.sun);
      this.sunPos = cheby.evaluate(tt);
      this.sunElev = 90 - this.sunPos.angleBetween(this.zenith) / HA.DEGTORAD;
      this.isDay = (this.sunElev >= -0.833);
      this.isTwilight = (!this.isDay && this.sunElev >= -12);
      this.isNight = !(this.isDay || this.isTwilight); }
    ctx.beginPath();
    ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = this.config.colors.azimuthRingBackground;
    ctx.beginPath();
    ctx.arc(x0, y0, this.canvas.width / 2, 0, HA.TWOPI);
    ctx.fill();
    this.daylightMode = (this.isDay && this.settings.showDaylight);
    var hazeRad = radius * (90 - this.config.hazeMaxAlt) / 90;
    var grd = ctx.createRadialGradient(x0, y0, hazeRad, radius, y0, x0);
    if (this.daylightMode) { grd.addColorStop(0, this.config.colors.daySky);
      grd.addColorStop(1, this.config.colors.daySkyHorizon); } else if (this.isTwilight && this.settings.showDaylight) { grd.addColorStop(0, this.config.colors.twilightSky);
      grd.addColorStop(1, this.config.colors.twilightSkyHorizon); } else { grd.addColorStop(0, this.config.colors.nightSky);
      grd.addColorStop(1, this.config.colors.nightSkyHorizon); }
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x0, y0, radius, 0, HA.TWOPI);
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x0, y0, this.canvas.width / 2, 0, HA.TWOPI);
    ctx.stroke();
    ctx.font = "15px Arial";
    ctx.fillStyle = this.config.colors.azimuthRingText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    this.drawAzimuthText(ctx, 'Facing South', 0);
    this.drawAzimuthText(ctx, 'Facing North', Math.PI);
    this.drawAzimuthText(ctx, 'Facing West', Math.PI / 2);
    this.drawAzimuthText(ctx, 'Facing East', -Math.PI / 2);
    this.drawAzimuthText(ctx, 'Facing SW', Math.PI / 4);
    this.drawAzimuthText(ctx, 'Facing NW', Math.PI * 0.75);
    this.drawAzimuthText(ctx, 'Facing NE', Math.PI * 1.25);
    this.drawAzimuthText(ctx, 'Facing SE', -Math.PI * 0.25);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x0, y0, radius, 0, HA.TWOPI, true);
    ctx.clip();
    if (this.staticData === undefined)
      return;
    ctx.font = this.config.font;
    if (this.settings.showConstellationBoundaries && !this.daylightMode) {
      ctx.strokeStyle = this.config.colors.constellationBoundaries;
      var cons = this.staticData.cons;
      var visTest = -0.3;
      var self = this;
      var skyToCanvasFunc = function(skyPnt) { return self.skyToCanvas(skyPnt); };
      for (var abbr in cons) {
        if (cons.hasOwnProperty(abbr)) {
          var bounds = cons[abbr].bounds;
          ctx.beginPath();
          for (b = 0; b < bounds.length; b++) { var bound = bounds[b]; for (bp = 0; bp < bound.length - 3; bp += 2) { this.drawBoundarySeg({ ra1: bound[bp], dec1: bound[bp + 1], ra2: bound[bp + 2], dec2: bound[bp + 3], skyToCanvasFunc: skyToCanvasFunc, context: this.context }); } }
          this.drawBoundarySeg({ ra1: bound[bound.length - 2], dec1: bound[bound.length - 1], ra2: bound[0], dec2: bound[1], skyToCanvasFunc: skyToCanvasFunc, context: this.context });
          ctx.stroke();
        }
      }
    }
    if (this.settings.showEcliptic) {
      ctx.strokeStyle = (this.daylightMode ? 'black' : this.config.colors.ecliptic);
      ctx.beginPath();
      for (iDeg = 0; iDeg < 361; ++iDeg) {
        var eclipticPnt = new HA.Vector({ ra: iDeg * HA.DEGTORAD, decl: 0 });
        eclipticPnt.rotateAboutXAxis(HA.Astro.OBLIQUITY_2000);
        var pnt = this.skyToCanvas(eclipticPnt);
        if (eclipticPnt.dotProduct(this.zenith) > -0.2 && iDeg > 0)
          ctx.lineTo(pnt.x, pnt.y);
        else
          ctx.moveTo(pnt.x, pnt.y);
      }
      ctx.stroke();
    }
    if (this.settings.showEquator) {
      ctx.strokeStyle = (this.daylightMode ? 'black' : this.config.colors.equator);
      ctx.beginPath();
      for (iDeg = 0; iDeg < 361; ++iDeg) {
        var equatorPnt = new HA.Vector({ ra: iDeg * HA.DEGTORAD, decl: 0 });
        var pnt = this.skyToCanvas(equatorPnt);
        if (equatorPnt.dotProduct(this.zenith) > -0.2 && iDeg > 0)
          ctx.lineTo(pnt.x, pnt.y);
        else
          ctx.moveTo(pnt.x, pnt.y);
      }
      ctx.stroke();
    }
    var stars = this.staticData.stars;
    var lines = this.staticData.lines;
    if (this.settings.showConstellationLines && !this.daylightMode) {
      ctx.strokeStyle = this.config.colors.constellationLines;
      for (i = 0; i < lines.length; i++) {
        ctx.beginPath();
        var line = lines[i];
        for (var p = 0; p < line.pnts.length; p += 2) {
          var ra = line.pnts[p];
          var decl = line.pnts[p + 1];
          var skyPos = new HA.Vector({ 'ra': ra, 'decl': decl });
          var pnt = this.skyToCanvas(skyPos);
          if (p == 0 || skyPos.dotProduct(this.zenith) < -0.5)
            ctx.moveTo(pnt.x, pnt.y);
          else
            ctx.lineTo(pnt.x, pnt.y);
        }
        if (line.level == 1)
          ctx.lineWidth = 2;
        else if (line.level == 2)
          ctx.lineWidth = 1;
        else
          ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
    if (this.settings.showSpecials && !this.daylightMode) { ctx.strokeStyle = this.config.colors.specialObjects;
      ctx.fillStyle = this.config.colors.specialObjectLabels;
      ctx.lineWidth = 1;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      radius = 5; var specialObjects = this.staticData.specialObjects; for (var k = 0; k < specialObjects.length - 1; k++) { var specialObj = specialObjects[k]; var skyPos = new HA.Vector({ 'ra': specialObj.ra, 'decl': specialObj.dec }); if (skyPos.dotProduct(this.zenith) > 0) { var pnt = this.skyToCanvas(skyPos);
          ctx.beginPath();
          ctx.arc(pnt.x, pnt.y, radius, 0, HA.TWOPI);
          ctx.stroke();
          ctx.fillText(specialObj.name, pnt.x + 7, pnt.y); } } }
    if (!this.daylightMode) { ctx.strokeStyle = 'white';
      ctx.fillStyle = 'white'; for (var starid in stars) { var ra = stars[starid][0]; var decl = stars[starid][1]; var skyPos = new HA.Vector({ 'ra': ra, 'decl': decl }); if (skyPos.dotProduct(this.zenith) > 0) { var pnt = this.skyToCanvas(skyPos);
          this.drawSphericalStar(ctx, pnt, stars[starid][2]); } } }
    if (this.settings.showConsNames && !this.daylightMode) {
      ctx.fillStyle = this.config.colors.constellationLabels;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var cons = this.staticData.cons;
      for (var abbr in cons) {
        if (cons.hasOwnProperty(abbr)) {
          var con = cons[abbr];
          var ra = con.ra;
          var decl = con.dec;
          var skyPos = new HA.Vector({ 'ra': ra, 'decl': decl });
          var pnt = this.skyToCanvas(skyPos);
          if (skyPos.dotProduct(this.zenith) > 0)
            ctx.fillText(con.name, pnt.x, pnt.y);
          if (abbr == 'Ser') {
            skyPos = new HA.Vector({ 'ra': con.ra2, 'decl': con.dec2 });
            pnt = this.skyToCanvas(skyPos);
            if (skyPos.dotProduct(this.zenith) > 0)
              ctx.fillText(con.name, pnt.x, pnt.y);
          }
        }
      }
    }
    if (this.settings.showStarNames && !this.daylightMode) {
      ctx.fillStyle = this.config.colors.starLabels;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (ix = 0; ix < this.staticData.starNames.length; ix++) {
        starid = this.staticData.starNames[ix];
        var star = stars[starid];
        var starName = star[7];
        ra = stars[starid][0];
        decl = stars[starid][1];
        skyPos = new HA.Vector({ 'ra': ra, 'decl': decl });
        pnt = this.skyToCanvas(skyPos);
        if (skyPos.dotProduct(this.zenith) > 0)
          ctx.fillText(starName, pnt.x + 7, pnt.y);
      }
    }
    if (block && block.loaded) {
      if (this.sunElev > 0) { pnt = this.skyToCanvas(this.sunPos); var innerRadius = 6;
        this.drawStar(ctx, pnt.x, pnt.y, innerRadius, 12, 8);
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'orange';
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pnt.x, pnt.y, innerRadius, 0, HA.TWOPI);
        ctx.fillStyle = 'yellow';
        ctx.stroke();
        ctx.fill(); }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      cheby = new HA.PositionPoly(block.data.t1, block.data.t2, block.data.moon);
      this.moonPos = cheby.evaluate(this.settings.time);
      this.moonPos.subtract(this.observerPos);
      if (this.moonPos.dotProduct(this.zenith) > 0) { pnt = this.skyToCanvas(this.moonPos); var innerRadius = this.config.moonRadius;
        this.drawMoon(ctx, pnt, innerRadius, this.sunPos, this.moonPos, false);
        ctx.fillStyle = (this.daylightMode ? 'black' : this.config.colors.moonLabel);
        ctx.fillText('Moon', pnt.x + innerRadius + 2, pnt.y); }
      for (p = 0; p < block.data.planets.length; p++) {
        cheby = new HA.PositionPoly(block.data.t1, block.data.t2, block.data.planets[p].cp);
        var skyPos = cheby.evaluate(this.settings.time);
        pnt = this.skyToCanvas(skyPos);
        if (skyPos.dotProduct(this.zenith) > 0) {
          ctx.beginPath();
          var innerRadius = 4;
          ctx.fillStyle = (this.daylightMode ? 'black' : this.config.colors[block.data.planets[p].name.toLowerCase()]);
          ctx.arc(pnt.x, pnt.y, innerRadius, 0, HA.TWOPI);
          ctx.fill();
          if (this.settings.showPlanetLabels) { ctx.fillStyle = (this.daylightMode ? 'black' : this.config.colors[block.data.planets[p].name.toLowerCase()]);
            ctx.fillText(block.data.planets[p].name, pnt.x + innerRadius + 2, pnt.y); }
          ctx.beginPath();
        }
      }
      if (this.settings.showTransientObjects && !this.daylightMode && block.data.transientObjects) { ctx.strokeStyle = this.config.colors.transientObjects;
        ctx.fillStyle = this.config.colors.transientObjectLabels;
        ctx.lineWidth = 1;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        radius = 5; var transientObjects = block.data.transientObjects; if (transientObjects) { for (var k = 0; k < transientObjects.length - 1; k++) { var transientObj = transientObjects[k]; var skyPos = new HA.Vector({ 'ra': transientObj.ra, 'decl': transientObj.dec }); if (skyPos.dotProduct(this.zenith) > 0) { var pnt = this.skyToCanvas(skyPos);
              ctx.beginPath();
              ctx.arc(pnt.x, pnt.y, radius, 0, HA.TWOPI);
              ctx.stroke();
              ctx.fillText(transientObj.name, pnt.x + 7, pnt.y); } } } }
    }
    if (this.settings.showBuildings && this.circularHorizonLoaded) { ctx.drawImage(this.imgCircular, 0, 0, 2000, 2000, 0, 0, this.canvas.width, this.canvas.width);
      ctx.fillStyle = 'blue'; }
    this.renderOverlay();
    this.renderZoomedChart();
  }
  HA.StSkyChart.prototype.drawAzimuthText = function(ctx, text, angle) { var r = this.radius; var x = this.x0 + r * Math.sin(angle); var y = this.y0 + r * Math.cos(angle);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angle);
    ctx.translate(-x, -y);
    ctx.fillText(text, x, y);
    ctx.restore(); }
  HA.StSkyChart.prototype.drawSphericalStar = function(ctx, pnt, mag) { var radius = this.starRadiusFunc(mag);
    ctx.beginPath();
    ctx.arc(pnt.x, pnt.y, radius, 0, HA.TWOPI);
    ctx.fill(); }
  HA.StSkyChart.prototype.drawAzimuthRing = function(ctx, text, diameter, startAngle, align, textInside, inwardFacing, fName, fSize, kerning) {
    var clockwise = align == "right" ? 1 : -1;
    startAngle = startAngle * (Math.PI / 180);
    var div = document.createElement("div");
    div.innerHTML = text;
    div.style.position = 'absolute';
    div.style.top = '-10000px';
    div.style.left = '-10000px';
    div.style.fontFamily = fName;
    div.style.fontSize = fSize;
    document.body.appendChild(div);
    var textHeight = div.offsetHeight;
    document.body.removeChild(div);
    if (!textInside) diameter += textHeight * 2;
    ctx.fillStyle = 'black';
    ctx.font = fSize + ' ' + fName;
    if (((["left", "center"].indexOf(align) > -1) && inwardFacing) || (align == "right" && !inwardFacing)) text = text.split("").reverse().join("");
    ctx.translate(diameter / 2, diameter / 2);
    startAngle += (Math.PI * !inwardFacing);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    if (align == "center") { for (var j = 0; j < text.length; j++) { var charWid = ctx.measureText(text[j]).width;
        startAngle += ((charWid + (j == text.length - 1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2 * -clockwise; } }
    ctx.rotate(startAngle);
    for (var j = 0; j < text.length; j++) { var charWid = ctx.measureText(text[j]).width;
      ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * clockwise);
      ctx.fillText(text[j], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
      ctx.rotate((charWid / 2 + kerning) / (diameter / 2 - textHeight) * clockwise); }
  }
  HA.StSkyChart.prototype.drawMoon = function(ctx, point, radius, sunPos, moonPos, zoomed) {
    var moonSun = sunPos.copy();
    moonSun.subtract(moonPos);
    moonSun.normalize();
    var moonUnit = moonPos.copy();
    moonUnit.normalize();
    var sunDirection = this.directionVectorAtPointToScreen(moonUnit, moonSun, zoomed);
    var pnts = this.getCrescentPlanetOutline(sunDirection, point, radius);
    ctx.fillStyle = (this.daylightMode ? 'black' : this.config.colors.moonSunlit);
    ctx.beginPath();
    var first = true;
    for (var i = 0; i < pnts.length; i++) {
      var pnt = pnts[i];
      if (first) { ctx.moveTo(pnt.x, pnt.y); } else { ctx.lineTo(pnt.x, pnt.y); }
      first = false;
    }
    ctx.fill();
  }
  HA.StSkyChart.prototype.getCrescentPlanetOutline = function(sun, centre, radius) {
    var path = [];
    var observer = new HA.Vector({ coords: [0, 0, 1] });
    var pntStart = sun.vectorProduct(observer);
    pntStart.normalize();
    var angleStart = pntStart.longitude();
    for (var i = 0; i <= 180; i += 2) { var angle = angleStart + i * HA.DEGTORAD;
      path.push({ x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle) }); }
    var rotMatrix = HA.Matrix.fromArbitraryAxisAndRotation(pntStart, Math.PI - sun.angleBetween(observer));
    for (i = 178; i >= 0; i -= 2) { angle = angleStart + i * HA.DEGTORAD; var v = rotMatrix.vecMult(new HA.Vector({ coords: [Math.cos(angle), Math.sin(angle), 0] }));
      path.push({ x: centre.x + v.x * radius, y: centre.y + v.y * radius }); }
    return path;
  }
  HA.StSkyChart.prototype.directionVectorAtPointToScreen = function(point, direction, zoomed) {
    var pntNegative = point.copy();
    pntNegative.scale(-1);
    var z = direction.dotProduct(pntNegative);
    var xy = Math.sqrt(1 - z * z);
    var delta = point.copy();
    var temp2 = direction.copy();
    temp2.scale(0.01);
    delta.add(temp2);
    delta.normalize();
    var p1, p2;
    if (zoomed) { p1 = this.skyToCanvasZoom(point);
      p2 = this.skyToCanvasZoom(delta); } else { p1 = this.skyToCanvas(point);
      p2 = this.skyToCanvas(delta); }
    var angleFromX = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    var x = xy * Math.cos(angleFromX);
    var y = xy * Math.sin(angleFromX);
    return new HA.Vector({ coords: [x, y, z] });
  }
  HA.StSkyChart.prototype.skyFrom1875 = function(ra, dec) { return HA.Astro.from1875.vecMult(new HA.Vector({ ra: ra / 3600 * HA.Astro.RATORAD, decl: dec / 3600 * HA.DEGTORAD })); }
  HA.StSkyChart.prototype.drawBoundarySeg = function(args) {
    var visTest = -0.2;
    var skyS = this.skyFrom1875(args.ra1, args.dec1);
    var skyE = this.skyFrom1875(args.ra2, args.dec2);
    if ((skyS.dotProduct(this.zenith) < visTest) && (skyE.dotProduct(this.zenith) < visTest))
      return;
    var pnt = args.skyToCanvasFunc(skyS);
    if (args.context == this.zoomcontext) {
      var w = this.zoomcanvas.width;
      if (Math.abs(pnt.x - w / 2) > w * 1.5)
        return;
    }
    args.context.moveTo(pnt.x, pnt.y);
    if (args.ra1 == args.ra2) { var dDecl = (args.dec2 > args.dec1 ? 7200 : -7200); var declas = args.dec1 + dDecl; while ((declas < args.dec1) != (declas < args.dec2)) { pnt = args.skyToCanvasFunc(this.skyFrom1875(args.ra1, declas));
        args.context.lineTo(pnt.x, pnt.y);
        declas += dDecl; } } else {
      if (Math.abs(args.ra1 - args.ra2) > 12 * 3600) {
        if (args.ra1 < 12 * 3600)
          args.ra1 += 24 * 3600;
        else
          args.ra2 += 24 * 3600;
      }
      var dRA = (args.ra2 > args.ra1 ? 480 : -480);
      var ra = args.ra1 + dRA;
      while ((ra < args.ra1) != (ra < args.ra2)) { pnt = args.skyToCanvasFunc(this.skyFrom1875(ra, args.dec1));
        args.context.lineTo(pnt.x, pnt.y);
        ra += dRA; }
    }
    var pnt = args.skyToCanvasFunc(skyE);
    args.context.lineTo(pnt.x, pnt.y);
  }
  HA.StSkyChart.prototype.skyToCanvas = function(vecSky) { var cameraVec = this.rotMatrix.vecMult(vecSky);
    cameraVec.normalize(); var zFactor = this.radius / (1 - cameraVec.z); var x = this.x0 + cameraVec.x * zFactor; var y = this.y0 - cameraVec.y * zFactor; return { x: x, y: y }; }
  HA.StSkyChart.prototype.canvasToTopo = function(pnt) {
    var dx = (pnt.x - this.x0) / this.radius;
    var dy = (this.y0 - pnt.y) / this.radius;
    var dx2 = dx * dx;
    var dy2 = dy * dy;
    var r2 = dx2 + dy2;
    if (r2 > 1)
      return null;
    var z = -(r2 - 1) / (r2 + 1);
    var el = Math.asin(z);
    var az = Math.atan2(dy, -dx);
    return new HA.Vector({ 'ra': az, 'decl': el });
  }
  HA.StSkyChart.prototype.topoToCanvas = function(alt, az) { var cameraVec = new HA.Vector({ 'ra': (az - 270) * HA.DEGTORAD, 'decl': alt * HA.DEGTORAD }); var zFactor = this.radius / (1 + cameraVec.z); var x = this.x0 + cameraVec.x * zFactor; var y = this.y0 - cameraVec.y * zFactor; return { "x": x, "y": y }; }
  HA.StSkyChart.prototype.onStaticDataReceived = function(data) { this.staticData = data;
    localStorage['staticData'] = JSON.stringify(data);
    this.render(); }
  HA.StSkyChart.prototype.updateUIElements = function() { $('#spanLocation').text(this.settings.location); var coords = HA.Astro.formatLatLong(this.settings.latitude, this.settings.longitude);
    $('#spanCoords').text(coords);
    this.setTimeControls(); }
  HA.StSkyChart.prototype.print = function() {
    var options = '';
    options = options + '&latitude=' + this.settings.latitude;
    options = options + '&longitude=' + this.settings.longitude;
    options = options + '&location=' + this.settings.location;
    if (this.settings.autoTime)
      options = options + '&utcOffset=' + new Date(this.settings.time).getTimezoneOffset() * -60000;
    else
      options = options + '&utcOffset=' + this.settings.utcOffset;
    options = options + '&showEquator=' + this.settings['showEquator'];
    options = options + '&showEcliptic=' + this.settings['showEcliptic'];
    options = options + '&showStarNames=' + this.settings['showStarNames'];
    options = options + '&showPlanetNames=' + this.settings['showPlanetLabels'];
    options = options + '&showConsNames=' + this.settings['showConsNames'];
    options = options + '&showConsLines=' + this.settings['showConstellationLines'];
    options = options + '&showConsBoundaries=' + this.settings['showConstellationBoundaries'];
    options = options + '&showSpecials=' + this.settings['showSpecials'];
    options = options + '&use24hClock=' + this.settings['use24hClock'];
    window.location = this.pdfGeneratorUrl + '?time=' + this.settings.time + options;
    return false;
  }
  HA.StSkyChart.prototype.renderZoomedChart = function() {
    if (this.rotMatrix === undefined)
      return;
    var w = this.zoomcanvas.width;
    var w2 = w / 2;
    var h = this.zoomHeight;
    var ctx = this.zoomcontext;
    this.computeZoomChartTransformations();
    var altBottom = this.zoomAlt - this.zoomAltRange / 2;
    var hazeMinY = h * (1 + altBottom / this.zoomAltRange);
    var hazeMaxY = h * (1 + (altBottom - this.config.hazeMaxAlt) / this.zoomAltRange);
    var grd = ctx.createLinearGradient(0, hazeMinY, 0, hazeMaxY);
    if (this.daylightMode) { grd.addColorStop(0, this.config.colors.daySkyHorizon);
      grd.addColorStop(1, this.config.colors.daySky); } else if (this.isTwilight && this.settings.showDaylight) { grd.addColorStop(0, this.config.colors.twilightSkyHorizon);
      grd.addColorStop(1, this.config.colors.twilightSky); } else { grd.addColorStop(0, this.config.colors.nightSkyHorizon);
      grd.addColorStop(1, this.config.colors.nightSky); }
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.stroke();
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();
    if (this.settings.showConstellationBoundaries && !this.daylightMode) {
      ctx.strokeStyle = this.config.colors.constellationBoundaries;
      var cons = this.staticData.cons;
      var visTest = -0.3;
      var self = this;
      var skyToCanvasFunc = function(skyPnt) { return self.skyToCanvasZoom(skyPnt); };
      for (var abbr in cons) {
        if (cons.hasOwnProperty(abbr)) {
          var bounds = cons[abbr].bounds;
          ctx.beginPath();
          for (b = 0; b < bounds.length; b++) { var bound = bounds[b]; for (bp = 0; bp < bound.length - 3; bp += 2) { this.drawBoundarySeg({ ra1: bound[bp], dec1: bound[bp + 1], ra2: bound[bp + 2], dec2: bound[bp + 3], skyToCanvasFunc: skyToCanvasFunc, context: this.zoomcontext }); } }
          this.drawBoundarySeg({ ra1: bound[bound.length - 2], dec1: bound[bound.length - 1], ra2: bound[0], dec2: bound[1], skyToCanvasFunc: skyToCanvasFunc, context: this.zoomcontext });
          ctx.stroke();
        }
      }
    }
    if (this.settings.showEcliptic) {
      ctx.strokeStyle = (this.daylightMode ? 'black' : this.config.colors.ecliptic);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (iDeg = 0; iDeg < 361; ++iDeg) {
        var eclipticPnt = new HA.Vector({ ra: iDeg * HA.DEGTORAD, decl: 0 });
        eclipticPnt.rotateAboutXAxis(HA.Astro.OBLIQUITY_2000);
        var pnt = this.skyToCanvasZoom(eclipticPnt);
        if (Math.abs(pnt.x - w2) < w2 * 1.5 && iDeg > 0)
          ctx.lineTo(pnt.x, pnt.y);
        else
          ctx.moveTo(pnt.x, pnt.y);
      }
      ctx.stroke();
    }
    if (this.settings.showEquator) {
      ctx.strokeStyle = (this.daylightMode ? 'black' : this.config.colors.equator);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (iDeg = 0; iDeg < 361; ++iDeg) {
        var equatorPnt = new HA.Vector({ ra: iDeg * HA.DEGTORAD, decl: 0 });
        var pnt = this.skyToCanvasZoom(equatorPnt);
        if (Math.abs(pnt.x - w2) < w2 * 1.5 && iDeg > 0)
          ctx.lineTo(pnt.x, pnt.y);
        else
          ctx.moveTo(pnt.x, pnt.y);
      }
      ctx.stroke();
    }
    var stars = this.staticData.stars;
    var lines = this.staticData.lines;
    if (this.settings.showConstellationLines && !this.daylightMode) {
      ctx.strokeStyle = this.config.colors.constellationLines;
      for (i = 0; i < lines.length; i++) {
        ctx.beginPath();
        var line = lines[i];
        for (var p = 0; p < line.pnts.length; p += 2) {
          var ra = line.pnts[p];
          var decl = line.pnts[p + 1];
          var skyPos = new HA.Vector({ 'ra': ra, 'decl': decl });
          var pnt = this.skyToCanvasZoom(skyPos);
          if (p == 0 || Math.abs(pnt.x - w2) > w)
            ctx.moveTo(pnt.x, pnt.y);
          else
            ctx.lineTo(pnt.x, pnt.y);
        }
        if (line.level == 1)
          ctx.lineWidth = 2;
        else if (line.level == 2)
          ctx.lineWidth = 1;
        else
          ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
    if (this.settings.showSpecials && !this.daylightMode) { ctx.strokeStyle = this.config.colors.specialObjects;
      ctx.fillStyle = this.config.colors.specialObjectLabels;
      ctx.lineWidth = 1;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = this.config.font;
      radius = 5; var specialObjects = this.staticData.specialObjects; for (var k = 0; k < specialObjects.length - 1; k++) { var specialObj = specialObjects[k]; var skyPos = new HA.Vector({ 'ra': specialObj.ra, 'decl': specialObj.dec }); if (skyPos.dotProduct(this.zenith) > 0) { var pnt = this.skyToCanvasZoom(skyPos);
          ctx.beginPath();
          ctx.arc(pnt.x, pnt.y, radius, 0, HA.TWOPI);
          ctx.stroke();
          ctx.fillText(specialObj.name, pnt.x + 7, pnt.y); } } }
    if (!this.daylightMode) { ctx.strokeStyle = 'white';
      ctx.fillStyle = 'white'; for (var starid in stars) { var ra = stars[starid][0]; var decl = stars[starid][1]; var skyPos = new HA.Vector({ 'ra': ra, 'decl': decl }); var pnt = this.skyToCanvasZoom(skyPos);
        this.drawSphericalStar(ctx, pnt, stars[starid][2]); } }
    if (this.settings.showConsNames && !this.daylightMode) {
      ctx.fillStyle = this.config.colors.constellationLabels;
      ctx.font = this.config.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var cons = this.staticData.cons;
      for (var abbr in cons) {
        if (cons.hasOwnProperty(abbr)) {
          var con = cons[abbr];
          var ra = con.ra;
          var decl = con.dec;
          var skyPos = new HA.Vector({ 'ra': ra, 'decl': decl });
          var pnt = this.skyToCanvasZoom(skyPos);
          if (skyPos.dotProduct(this.zenith) > 0)
            ctx.fillText(con.name, pnt.x, pnt.y);
          if (abbr == 'Ser') {
            skyPos = new HA.Vector({ 'ra': con.ra2, 'decl': con.dec2 });
            pnt = this.skyToCanvasZoom(skyPos);
            if (skyPos.dotProduct(this.zenith) > 0)
              ctx.fillText(con.name, pnt.x, pnt.y);
          }
        }
      }
    }
    if (this.settings.showStarNames && !this.daylightMode) {
      ctx.fillStyle = this.config.colors.starLabels;
      ctx.font = this.config.font;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (ix = 0; ix < this.staticData.starNames.length; ix++) {
        starid = this.staticData.starNames[ix];
        var star = stars[starid];
        var starName = star[7];
        ra = stars[starid][0];
        decl = stars[starid][1];
        skyPos = new HA.Vector({ 'ra': ra, 'decl': decl });
        pnt = this.skyToCanvasZoom(skyPos);
        if (skyPos.dotProduct(this.zenith) > 0)
          ctx.fillText(starName, pnt.x + 7, pnt.y);
      }
    }
    var block = this.getDynamicDataBlockForTime(this.settings.time);
    if (block && block.loaded) {
      var cheby = new HA.PositionPoly(block.data.t1, block.data.t2, block.data.sun);
      this.sunPos = cheby.evaluate(this.settings.time);
      if (this.sunPos.dotProduct(this.zenith) > 0) { pnt = this.skyToCanvasZoom(this.sunPos); var innerRadius = 6;
        this.drawStar(ctx, pnt.x, pnt.y, innerRadius, 12, 8);
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'orange';
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pnt.x, pnt.y, innerRadius, 0, HA.TWOPI);
        ctx.fillStyle = 'yellow';
        ctx.stroke();
        ctx.fill(); }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      cheby = new HA.PositionPoly(block.data.t1, block.data.t2, block.data.moon);
      this.moonPos = cheby.evaluate(this.settings.time);
      this.moonPos.subtract(this.observerPos);
      if (this.moonPos.dotProduct(this.zenith) > 0) { pnt = this.skyToCanvasZoom(this.moonPos); var innerRadius = this.config.moonRadius;
        this.drawMoon(ctx, pnt, innerRadius, this.sunPos, this.moonPos, true);
        ctx.fillStyle = (this.daylightMode ? 'black' : this.config.colors.moonLabel);
        ctx.fillText('Moon', pnt.x + innerRadius + 2, pnt.y); }
      ctx.textAlign = 'left';
      ctx.font = this.config.font;
      ctx.textBaseline = 'middle';
      for (p = 0; p < block.data.planets.length; p++) {
        cheby = new HA.PositionPoly(block.data.t1, block.data.t2, block.data.planets[p].cp);
        var skyPos = cheby.evaluate(this.settings.time);
        pnt = this.skyToCanvasZoom(skyPos);
        if (skyPos.dotProduct(this.zenith) > 0) {
          ctx.beginPath();
          var innerRadius = 4;
          ctx.fillStyle = (this.daylightMode ? 'black' : this.config.colors[block.data.planets[p].name.toLowerCase()]);
          ctx.arc(pnt.x, pnt.y, innerRadius, 0, HA.TWOPI);
          ctx.fill();
          if (this.settings.showPlanetLabels) { ctx.fillStyle = (this.daylightMode ? 'black' : this.config.colors.planetLabels);
            ctx.fillText(block.data.planets[p].name, pnt.x + innerRadius + 2, pnt.y); }
          ctx.beginPath();
        }
      }
    }
    var altaz = this.zoomCanvasToTopo(0, h / 2);
    var leftAz = HA.Astro.reduceAngleDegrees(altaz.az);
    altaz = this.zoomCanvasToTopo(w, h / 2);
    var rightAz = HA.Astro.reduceAngleDegrees(altaz.az);
    var altMin = this.zoomAlt - this.zoomAltRange / 2;
    var imageWidth = 3628;
    var azRange = rightAz - leftAz;
    if (azRange < 0)
      azRange += 360;
    if (this.horizonLoaded && this.settings.showBuildings) {
      var swidth = imageWidth * azRange / 360;
      var az0 = 69;
      var sx = imageWidth * (leftAz - az0) / 360;
      if (sx < 0)
        sx += imageWidth;
      var sy = 0;
      var sheight = 85;
      var cheight = this.treesAndBuildingsHeight;
      var top = h - cheight + h * altMin / this.zoomAltRange;
      if (sx + swidth > imageWidth) { var swidth1 = imageWidth - sx; var swidth2 = swidth - swidth1; var dwidth = w * swidth1 / swidth;
        ctx.drawImage(this.imgLinear, sx, sy, swidth1, sheight, 0, top, dwidth, cheight);
        ctx.drawImage(this.imgLinear, 0, sy, swidth2, sheight, dwidth, top, w - dwidth, cheight); } else
        ctx.drawImage(this.imgLinear, sx, sy, swidth, sheight, 0, top, w, cheight);
    }

    //Use the bottom to hard code the azimuth ring text and background on 'selected view'
    //ctx.restore();ctx.fillStyle='#c0c0c0';ctx.rect(0,h,w,this.azimuthScaleHeight);ctx.fill();var yText=h+2;ctx.fillStyle='black'  

    ctx.restore();
    ctx.fillStyle = this.config.colors.azimuthRingBackground;
    ctx.rect(0, h, w, this.azimuthScaleHeight);
    ctx.fill();
    var yText = h + 2;
    ctx.fillStyle = this.config.colors.azimuthRingText;

    ctx.font = "16px Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText("Facing North", this.xFromAzimuth(0, azRange), yText);
    ctx.fillText('Facing South', this.xFromAzimuth(180, azRange), yText);
    ctx.fillText('Facing East', this.xFromAzimuth(90, azRange), yText);
    ctx.fillText('Facing West', this.xFromAzimuth(270, azRange), yText);
    ctx.fillText("Facing NE", this.xFromAzimuth(45, azRange), yText);
    ctx.fillText('Facing SE', this.xFromAzimuth(135, azRange), yText);
    ctx.fillText('Facing SW', this.xFromAzimuth(225, azRange), yText);
    ctx.fillText('Facing NW', this.xFromAzimuth(315, azRange), yText);
  }
  HA.StSkyChart.prototype.skyToCanvasZoom = function(vecSky) { var cameraVec = this.rotMatrixZoom.vecMult(vecSky);
    cameraVec.normalize(); var zFactor = this.rZoom / (1 - cameraVec.z); var x = this.zoomcanvas.width * 0.5 + cameraVec.x * zFactor; var y = this.zoomHeight * 0.5 - cameraVec.y * zFactor; return { x: x, y: y }; }
  HA.StSkyChart.prototype.zoomCanvasToTopo = function(x, y) {
    var x0 = this.zoomcanvas.width * 0.5;
    var y0 = this.zoomHeight * 0.5;
    var dx = (x - x0) / this.rZoom;
    var dy = (y0 - y) / this.rZoom;
    var dx2 = dx * dx;
    var dy2 = dy * dy;
    var r2 = dx2 + dy2;
    if (r2 > 1)
      return null;
    var z = -(r2 - 1) / (r2 + 1);
    var el = Math.asin(z);
    var az = Math.atan2(dy, -dx);
    var cameraVec = new HA.Vector({ 'ra': az, 'decl': el });
    var topoVec = this.rotMatrixZoomCanvasToTopo.vecMult(cameraVec);
    el = topoVec.latitude() / HA.DEGTORAD;
    az = topoVec.longitude() / HA.DEGTORAD + 90;
    return { alt: el, az: az };
  }
  HA.StSkyChart.prototype.zoomCanvasToMainCanvas = function(x, y) { var altaz = this.zoomCanvasToTopo(x, y); return this.topoToCanvas(altaz.alt, altaz.az); }
  HA.StSkyChart.prototype.xFromAzimuth = function(az, azRange) {
    var daz = az - this.settings.zoomAzimuth;
    while (daz < -180) { daz += 360; }
    while (daz > 180) { daz -= 360; }
    return this.zoomcanvas.width * (0.5 + daz / azRange);
  }

  if (!window.HA) {
    window.HA = HA;
  }
})(window, document);