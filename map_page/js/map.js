function initMap() {
          var uluru = {
            lat: -25.363,
            lng: 131.044
          };
          var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: uluru
          });
          var infoWindow = new google.maps.InfoWindow({
            map: map
          });
          
          if (navigator.geolocation) {

            var getLocation = function() {
              navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('My location');
                map.setCenter(pos);

                setUserLocationDetails(map, pos);

                var circle = new google.maps.Circle({
                  strokeColor: '#12a45a',
                  strokeOpacity: 0.8,
                  strokeWeight: 0,
                  fillColor: '#ff0000',
                  fillOpacity: 1,
                  map: map,
                  center: pos,
                  radius: 20,
                });
                

              }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
              });
            }
            getLocation();
            // setInterval(getLocation,5000);
          } else {
            handleLocationError(false, infoWindow, map.getCenter());
          }
        }

        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
          infoWindow.setPosition(pos);
          infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        }
                   function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}


function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}