var xhr;
function init() {
	xhr = new XMLHttpRequest();
	xhr.open("get", "http://mbtamap.herokuapp.com/mapper/rodeo.json", true);
	xhr.onreadystatechange = dataReady;
	xhr.send(null);
	var mapOptions = {
		center: new google.maps.LatLng(-34.397, 150.644), 
		zoom: 12
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
}

google.maps.event.addDomListener(window, 'load', init);

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