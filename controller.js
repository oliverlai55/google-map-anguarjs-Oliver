//Angular App Module and controller
var mapctl = angular.module('myApp',[]).controller('mapCtrl', function($scope){

	var mapOptions = {
		zoom: 4,
		//Center of the US
		center: new google.maps.LatLng(40.0000, -98.0000)
	}

	$scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	$scope.markers = [];

	var infoWindow = new google.maps.InfoWindow();

	//createMarker Function
	var createMarker = function(city, index){
		// console.log(city);
		// console.log(index);

		var latLon = city.latLon.split(',');
		// console.log(latLon);
		// console.log(typeof(latLon));
		var lat = latLon[0];
		var lon = latLon[1];

		if(index == 0){
			var icon = 'assets/images/1.png';
		}else if(index==38){
			var icon = 'assets/images/atl.png';
		}else{
			var icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569';
		}

		var marker = new google.maps.Marker({
			map: $scope.map,
			position: new google.maps.LatLng(lat, lon),
			title: city.city,
			icon: icon
		});

		var weatherURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city.city+ ",us,ga&units=imperial&APPID=0b66f0f8e1b5e15a5b59581c421348aa";
		$.getJSON(weatherURL, function(weatherData){
			var weatherIconURL = 'http://openweathermap.org/img/w/'
			var weatherIcon = weatherIconURL + weatherData.weather[0].icon + '.png';


			markerContentHTML = '<div class="infoWindowContent">';
			markerContentHTML += '<div class="total-pop">Total Population: ' + city.yearEstimate + '</div>';
			markerContentHTML += '<div class="pop-dens-last-year">2010 Census: ' + city.lastCensus + '</div>';
			markerContentHTML += '<div class="pop-change">Population Change %: ' + city.change + '</div>';
			markerContentHTML += '<div class="pop-dens">Population Density: ' + city.lastPopDensity + '</div>';
			markerContentHTML += '<div class="state">State: ' + city.state + '</div>';
			markerContentHTML += '<div class="land-area">Land Area: ' + city.landArea + '</div>';
			markerContentHTML += '<div class ="weather"><img src="'+weatherIcon+'">Current Temperature: '+weatherData.main.temp+'&degF</div>';
			markerContentHTML += '<div><a href="#" onclick="getDirections('+lat+','+lon+')">Get directions</a></div>';
			markerContentHTML += '<div><a href="#" onclick="zoomOnCity('+lat+','+lon+')">Show me the courses!</a></div>';
			markerContentHTML += '</div>';

			marker.content = markerContentHTML;
			console.log(marker.content);

			google.maps.event.addListener(marker, 'click', function(){
				infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
				infoWindow.open($scope.map, marker);
			});
		});
$scope.markers.push(marker);

}

var createCityMarkers = function(){
	$scope.cities = cities
    for( i=0; i < cities.length; i++){
    	createMarker(cities[i], i)
    }
}

$scope.resetMap = function(){
		var mapOptions = {
			zoom: 4,
		//Center of the US
		center: new google.maps.LatLng(40.0000, -98.0000)
	}

	$scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	$scope.markers = [];

	createCityMarkers();
}

$scope.resetMap();

var infoWindow = new google.maps.InfoWindow()


    //Without scope... the view can't see it
    $scope.triggerClick = function(i){
    		$scope.resetMap();
        google.maps.event.trigger($scope.markers[i-1],"click");
        console.log(triggerClick(i));
    }


    $scope.updateMarkers = function(){
    	for(i=0; i < $scope.markers.length; i++){
    		$scope.markers[i].setMap(null);
    	}
    	for(i = 0; i < $scope.filteredCities.length; i++){
    		createMarker($scope.filteredCities[i],i);
    	}
    }

    getDirections = function(lat, lon){
	    var directionsService = new google.maps.DirectionsService();
	    var directionsDisplay = new google.maps.DirectionsRenderer();
    	var map = new google.maps.Map(document.getElementById('map'),{
    		zoom: 7,
    		mapTypeId: google.maps.MapTypeId.ROADMAP
    	});
    	directionsDisplay.setMap(map);
    	directionsDisplay.setPanel(document.getElementById('map-panel'));

         var request = {
            //Origin hardcoded to Atlanta. Require geocode current loc,
            //or give user input
           origin: 'Atlanta, GA', 
           destination:new google.maps.LatLng(lat,lon), 
           travelMode: google.maps.DirectionsTravelMode.DRIVING
         };

         directionsService.route(request, function(response, status) {
           if (status == google.maps.DirectionsStatus.OK) {
             directionsDisplay.setDirections(response);
           }
         }); 
    }

    zoomOnCity = function(lat, lon){
		position = new google.maps.LatLng(lat, lon);
		// console.log(position);
		map = new google.maps.Map(document.getElementById('map'), {
			center: position,
			zoom: 10
		});
		infowindow = new google.maps.InfoWindow();
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
		  location: position,
		  radius: 30000,
		  types: ['park']
		}, placesResults);         	

 		service.nearbySearch({
		  location: position,
		  radius: 30000,
		  types: ['lodging']
		}, placesResults);         	

    }

	function placesResults(results, status) {
		// console.log(results);
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				// console.log(results);
	 			createPointOfInterestMarker(results[i]);
			}
		}
	}

	function createPointOfInterestMarker(place){
		console.log(place);

		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
	 		map: map,
	 		position: place.geometry.location,
	 		icon: place.icon
		});

		google.maps.event.addListener(marker, 'click', function() {
			var photo = "";
			if(place.photos){
				photo = '<img src="' + place.photos[0].getUrl({'maxWidth': 150, 'maxHeight': 100})+'">';
			}
			var placeHTML = '<div class="location-image">' + photo + '</div>';
			placeHTML += '<h5>' + place.vicinity + '</h5>';
			place.content = placeHTML;
	 		infowindow.setContent('<h2>'+place.name + '</h2>' + place.content);
	 		infowindow.open(map, this);
	 		console.log(place.vicinity);
  		});
	}

	$scope.cities = cities;
	for(i = 0; i < cities.length; i++){
		createMarker(cities[i],i)
	}
});




