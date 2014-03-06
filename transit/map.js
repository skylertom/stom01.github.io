var xhr;
var initialLocation;
var initialMarker;
var downtown = new google.maps.LatLng(-34.397, 150.644); 
//still need to change downtown to actual downtown lat/lng
function init() {
	xhr = new XMLHttpRequest();
	xhr.open("get", "http://mbtamap.herokuapp.com/mapper/rodeo.json", true);
	xhr.onreadystatechange = dataReady;
	xhr.send(null);
	var mapOptions = {
		zoom: 16
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	if (navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.setCenter(initialLocation);

		}, function() {
			handleNoGeolocation(browserSupportFlag);
		});
		initialMarker = new google.maps.Marker({
			position: initialLocation,
			map: map,
			title: 'You are here'
		});
	}
	else { //browser doesn't support Geolocation
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}
}

google.maps.event.addDomListener(window, 'load', init);

function handleNoGeolocation(errorFlag) {
	if (errorFlag == true) {
		alert("Geolocation service failed.");
		initialLocation = downtown;
	}
	else {
		alert("Your browser doesn't support geolocation");
		initialLocation = downtown;
	}
	map.setCenter(initialLocation);
}
function dataReady() {
	if (xhr.readyState == 4 && xhr.status == 200) {
		scheduleData = JSON.parse(xhr.responseText);
		scheduleDom = document.getElementById("schedule");
		scheduleDom.innerHTML = scheduleData["line"];
	}
	else if (xhr.readyState == 4 && xhr.status == 500) {
		scheduleDom = document.getElementById("schedule");
		scheduleDom.innerHTML = '<p>Could not access MBTA schedule</p>';
	}
}