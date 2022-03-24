const apiKey = "5ee9e8bf24401b639ee5aedbea5aea23"

// Use the API to get the coordinates of a location by name 
// The user will enter this location because they most likely
// Will not know the exact geographic coordinates of the place they're searching
var getLocation = function(location) {
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                var lat = data[0].lat;
                var lon = data[0].lon;
                getWeather(lat, lon);
            })
        } else {
            alert("Error: Cannot find that location.")
        }
    })
    .catch(function(error) {
        alert("Unable to connect to Open Weather Map.");
    });
}

// After the location is found, we will enter the coordinates to 
// fetch the weather conditions at that place
var getWeather = function(lat, lon) {
    console.log(lat, lon);

    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
            })
        } else {
            alert("Error: Cannot find the weather for that location.")
        }
    })
    .catch(function(error) {
        alert("Unable to connect to Open Weather Map.");
    });
}

getLocation("Seattle");