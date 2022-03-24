const apiKey = "5ee9e8bf24401b639ee5aedbea5aea23"

var userFormEl = document.querySelector("#user-form");
var cityInputEl = document.querySelector("#city");
var searchTermEl = document.querySelector("#search-term");

var todayResultEl = document.querySelector("#today-result");

var temperatureEl = document.querySelector("#temperature");
var humidityEl = document.querySelector("#humidity");
var windspeedEl =  document.querySelector("#wind-speed");
var uvindexEl = document.querySelector("#uv-index");

var searchHistoryEl = document.querySelector("#search-history");

var searches = [];

// This code to produce the date that will later be used was created by someone else.
// I used this code and not another API for the sake of simplicity. The original code was taken from:
// https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

// Use the API to get the coordinates of a location by name 
// The user will enter this location because they most likely
// Will not know the exact geographic coordinates of the place they're searching
var getLocation = function(location) {
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                if(data.length === 0) {
                    alert("Error: Cannot find that location.");
                    return;
                }
                var lat = data[0].lat;
                var lon = data[0].lon;
                var name = data[0].name;
                getWeather(lat, lon, name);
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
var getWeather = function(lat, lon, name) {
    console.log(lat, lon);

    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                // Display the name, date, icon of conditions, temp
                // humidity, wind speed, UV index
                searchTermEl.textContent = name + " (" + today + ")";

                // Update today's information accordingly
                temperatureEl.textContent = "Temperature: " + data.current.temp + "F";
                humidityEl.textContent = "Humidity: " + data.current.humidity;
                windspeedEl.textContent =  "Wind Speed: " + data.current.wind_speed + " MPH";
                uvindexEl.textContent = "UV Index: " + data.current.uvi;
                
                updateHistory(name);

                console.log(searches);
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

//Update the search history array and display it
var updateHistory = function(city) {
    // Add this search to the history
    // Make sure the array doesn't already have this.
    // No need to make multiple buttons of the same location.
    if(!searches.includes(city)) {
        searches.unshift(city);
        var newBtnEl = document.createElement("button");
        newBtnEl.textContent = city;
        newBtnEl.className = "history-btn";

        searchHistoryEl.insertBefore(newBtnEl, searchHistoryEl.firstChild);
        // To prevent from an infinitely long history, we limit it to size of 5
        if(searches.length > 5) {
            searches.pop();
            searchHistoryEl.removeChild(searchHistoryEl.children[5]);
        }
    }
}

// Handle the search of an old search
var historyHandler = function(event) {
    var city = event.target.textContent;
    getLocation(city);
}

// Handle the search
var formSubmitHandler = function(event) {
    event.preventDefault();
    var city = cityInputEl.value.trim();

    if(city) {
        getLocation(city);
        cityInputEl.value = "";
    } else {
        alert("Please enter a location to search.");
    }
}


userFormEl.addEventListener("submit", formSubmitHandler);
searchHistoryEl.addEventListener("click", historyHandler);