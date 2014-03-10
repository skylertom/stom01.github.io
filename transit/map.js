var midpoint;
var xhr;
var initialLocation;
var initialMarker;
var scheduleData;
var markers = [];
var campusCenter = new google.maps.LatLng(42.405816, -71.120443);
var lineData = [];
var map;
var SEC = 60;
google.maps.event.addDomListener(window, 'load', init);
function init() {
	xhr = new XMLHttpRequest();
	xhr.open("get", "http://mbtamap.herokuapp.com/mapper/rodeo.json", true);
	xhr.onreadystatechange = dataReady;
	xhr.send(null);
}

//google.maps.event.addDomListener(window, 'load', init);

function dataReady() {
	if (xhr.readyState == 4 && xhr.status == 200) {
		scheduleData = JSON.parse(xhr.responseText);
		console.log(scheduleData["line"]);
		var mapOptions = {
			zoom: 14
		};
		map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		getLine(scheduleData["line"], function () {
			findGeoLocation(function() {
				MakeLineMarkers(function () {
					drawLine(scheduleData["line"], function () {
						findStation();
					});
				});
			});
		});
	}
	else if (xhr.readyState == 4 && xhr.status == 500) {
		scheduleDom = document.getElementById("map_canvas");
		scheduleDom.innerHTML = '<p>Could not access MBTA schedule</p>';
	}
}

function findGeoLocation(callback) {
	if (navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.setCenter(initialLocation);
			initialMarker = new google.maps.Marker({
				position: initialLocation,
				map: map,
				title: 'You are here'
			});
			if (callback) {
				callback();
			}
		}, function() {
			handleNoGeolocation(browserSupportFlag);
			callback();
		});
	}
	else { //browser doesn't support Geolocation
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
		callback();
	}
}

function handleNoGeolocation(errorFlag) {
	map.setZoom(12);
	if (errorFlag == true) {
		alert("Geolocation service failed.");
		initialLocation = campusCenter;
	}
	else {
		alert("Your browser doesn't support geolocation");
		initialLocation = campusCenter;
	}
	initialMarker = new google.maps.Marker({
		position: initialLocation,
		map: map,
		title: 'default starting position'
	});
	map.setCenter(initialLocation);
}

function getLine(line, callback) {
	line = line.replace(line[0], line[0].toUpperCase());
	var trainsFile = "Blue,Bowdoin,42.361365,-71.062037-- Blue,Government Center,42.359705,-71.05921499999999-- Blue,State Street,42.358978,-71.057598-- Blue,Aquarium,42.359784,-71.051652-- Blue,Maverick,42.36911856,-71.03952958000001-- Blue,Airport,42.374262,-71.030395-- Blue,Wood Island,42.3796403,-71.02286539000001-- Blue,Orient Heights,42.386867,-71.00473599999999-- Blue,Suffolk Downs,42.39050067,-70.99712259-- Blue,Beachmont,42.39754234,-70.99231944-- Blue,Revere Beach,42.40784254,-70.99253321-- Blue,Wonderland,42.41342,-70.991648-- Orange,Oak Grove,42.43668,-71.07109699999999-- Orange,Malden Center,42.426632,-71.07411-- Orange,Wellington,42.40237,-71.077082-- Orange,Sullivan,42.383975,-71.076994-- Orange,Community College,42.373622,-71.06953300000001-- Orange,North Station,42.365577,-71.06129-- Orange,Haymarket,42.363021,-71.05829-- Orange,State Street,42.358978,-71.057598-- Orange,Downtown Crossing,42.355518,-71.060225-- Orange,Chinatown,42.352547,-71.062752-- Orange,Tufts Medical,42.349662,-71.063917-- Orange,Back Bay,42.34735,-71.075727-- Orange,Mass Ave,42.341512,-71.083423-- Orange,Ruggles,42.336377,-71.088961-- Orange,Roxbury Crossing,42.331397,-71.095451-- Orange,Jackson Square,42.323132,-71.099592-- Orange,Stony Brook,42.317062,-71.104248-- Orange,Green Street,42.310525,-71.10741400000001-- Orange,Forest Hills,42.300523,-71.113686";
	var trainsParsed = trainsFile.split('-- ');
	var inputArray;
	var i = 0;
	trainsParsed.map(function(item) {
		inputArray = item.split(',');
		if (inputArray[0] == line) {
			lineData[i] = [];
			lineData[i]["place"] = inputArray[1];
			lineData[i]["lat"] = inputArray[2];
			lineData[i]["lng"] = inputArray[3];
			i++;
		}
	});
	if (callback) {
		callback();
	}
}

function MakeLineMarkers(callback) {
	var lineMarkers;
	var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
	var i = 0;
	lineData.map(function(item) {
		lineMarkers = new google.maps.Marker ({
			position: new google.maps.LatLng(item["lat"], item["lng"]),
			map: map,
			icon: iconBase + 'rail.png',
			title:  item["place"],
		});
		markers[i++] = lineMarkers;
		displayInfo(lineMarkers);
	});
	if (callback) {
		callback();
	}
}

function displayInfo(myMarker) {
	var contentString = 
		'<h1>' + myMarker.getTitle() + '</h1><table><tr><th>Line:</th><th>TrainID:</th><th>Destination:</th><th>Arriving in:</th></tr>';
		scheduleData["schedule"].map(function(train) {
			var time = "";
			var trainID = "";
			var destination = "";
			train["Predictions"].map(function(stops) {
				if (myMarker.getTitle() == stops["Stop"]) {
					time = Math.floor(stops["Seconds"]/SEC) + "m"+stops["Seconds"]%SEC + "s";
					trainID = train["TripID"];
					destination = train["Destination"];
				}
			});
			if (trainID != "") {
				var addString = '<tr><td>' + scheduleData["line"] + '</td><td>' + trainID + '</td><td>' + 
						destination + '</td><td>' + time + '</td></tr>';
				contentString = contentString + addString;
			}
		});
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});

	google.maps.event.addListener(myMarker, 'click', function() {
		infowindow.open(myMarker.get('map'), myMarker);
	});
}

function drawLine(line, callback) {
	var lineColor;
	if (line == "blue") {
		lineColor = '#0000FF';
	} else if (line == "red") {
		lineColor = '#FF0000';
	} else if (line == "orange") {
		lineColor = '#FF4500';
	}
	var coords = [];
	for (var i in lineData) {
		coords[i] = new google.maps.LatLng(lineData[i]["lat"], lineData[i]["lng"]);
	}
	var linePath = new google.maps.Polyline({
		path: coords,
		geodesi : true,
		strokeColor: lineColor,
		strokeWeight: 2
	});
	linePath.setMap(map);
	if (callback) {
		callback();
	}
}

function findStation(callback) {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	}

	var distances = [];
	var i = 0;
	markers.map(function (item) {
		var lat2 = initialLocation.lat(); 
		var lon2 = initialLocation.lng(); 
		var R = 6371; // km 
		var lat1 = item.getPosition().lat();
		var lon1 = item.getPosition().lng();
		var x1 = Math.abs(lat2-lat1);
		var dLat = x1.toRad();  
		var x2 = Math.abs(lon2-lon1);
		var dLon = x2.toRad();  
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
		                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
		                Math.sin(dLon/2) * Math.sin(dLon/2);  
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		distances[i] = R * c; 
		i++;
	});
	var index = findIndexOfMin(distances);
	console.log(markers[index].getTitle());
	var infowindow = new google.maps.InfoWindow({
		content: "<p>Nearest " + scheduleData["line"] + " line stop is " + markers[index].getTitle() + "</p>"
	});

	google.maps.event.addListener(initialMarker, 'click', function() {
		infowindow.open(initialMarker.get('map'), initialMarker);
	});
	if (callback) {
		callback();
	}
}

function findIndexOfMin(array) {
	var minIndex = 0;
	var currentMin = array[0];
	for (var i in array) {
		if (array[i] < currentMin) {
			currentMin = array[i];
			minIndex = i;
		}
	}
	return minIndex;
}
