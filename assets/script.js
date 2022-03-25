// THE API KEY GIVEN TO US AFTER REGISTERING 
// -- IT IS NECESSARY TO MAKE REQUESTS TO THEIR API --
const apiKey = "5ee9e8bf24401b639ee5aedbea5aea23"
// Store our HTML elements for later
var userFormEl = document.querySelector("#user-form");
var cityInputEl = document.querySelector("#city");
var searchTermEl = document.querySelector("#search-term");
var cityIconEl = document.querySelector("#city-icon");

var todayResultEl = document.querySelector("#today-result");
var fiveForecastEl = document.querySelector("#five-day-forecast");

var temperatureEl = document.querySelector("#temperature");
var humidityEl = document.querySelector("#humidity");
var windspeedEl =  document.querySelector("#wind-speed");
var uvindexEl = document.querySelector("#uv-index");

var searchHistoryEl = document.querySelector("#search-history");

// Store an array of searches and a string of last search
// These will be store into an object which will later be saved to
// local storage to be used later to help keep information persistent
var searches = [];
var lastSearch = "";

var saveObject = {
    history: [],
    last: ""
}

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

    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + apiKey;

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                
                // Display the name, date, icon of conditions, temp
                // humidity, wind speed, UV index
                var iconUrl = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png";
                
                searchTermEl.textContent = name + " (" + today + ")";
                cityIconEl.setAttribute("src", iconUrl);

                // Update today's information accordingly
                temperatureEl.textContent = "Temperature: " + data.current.temp + "F";
                humidityEl.textContent = "Humidity: " + data.current.humidity + "%";
                windspeedEl.textContent =  "Wind Speed: " + data.current.wind_speed + " MPH";
                uvindexEl.textContent = "UV Index: " + data.current.uvi;

                // Determine uv-index severity
                if(data.current.uvi < 2) {
                    uvindexEl.classList = "low uv-index";
                } else if (data.current.uvi <= 5) {
                    uvindexEl.classList = "moderate uv-index";
                } else {
                    uvindexEl.classList = "high uv-index";
                }
                
                updateHistory(name, false);
                getNextFive(data);
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
var updateHistory = function(city, isLoad) {
    // Add this search to the history
    // Make sure the array doesn't already have this.
    // No need to make multiple buttons of the same location.
    // However we update the last search to store this for loading.
    // That way even if the buttons don't update, you'll still
    // come back to the last city you searched for.
    lastSearch = city;

    if(!searches.includes(city)) {
        var newBtnEl = document.createElement("button");
        newBtnEl.textContent = city;
        newBtnEl.classList = "btn btn-secondary history-btn";
        
        searches.push(city);
        searchHistoryEl.insertBefore(newBtnEl, searchHistoryEl.firstChild);
        
        // To prevent from an infinitely long history, we limit it to size of 5
        if(searches.length > 5) {
            searches.pop();
            searchHistoryEl.removeChild(searchHistoryEl.children[5]);
        }
    }
    // prevent an immediate save while looping through the local storage
    if(!isLoad) {
        saveWeather();
    }
}

// Get the next 5 days, then format and display accordingly.
var getNextFive = function(data) {
    // Check if we already have 5 days of forecasting displayed. If we do, remove them.
    var collection = document.querySelectorAll(".forecast");
    for(let i = 0; i < collection.length; i++) {
        collection[i].remove();
    }
    
    for(var i = 1; i < 6; i++) {
        var thisDay = data.daily[i];
        // Get the future date. How many days in the future from now is determined
        // by i, which conveniently is already 1 since we already captured today's weather
        // This code block to create these dates was taken from: https://stackoverflow.com/questions/3572561/set-date-10-days-in-the-future-and-format-to-dd-mm-yyyy-e-g-21-08-2010
        var targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        var dd = targetDate.getDate();
        var mm = targetDate.getMonth() + 1; // 0 is January, so we must add 1
        var yyyy = targetDate.getFullYear();
        
        // Set the 5 variables needed to populate the data of each day
        var dateString = mm + "/" + dd + "/" + yyyy;
        var iconUrl = "http://openweathermap.org/img/wn/" + thisDay.weather[0].icon + "@2x.png";
        var temperature = "Temperature: " + thisDay.temp.max + "F";
        var windSpeed = "Wind Speed: " + thisDay.wind_speed + "MPH";
        var humidity = "Humidity: " + thisDay.humidity + "%";

        // Create 5 elements containing proper dates, as well as
        // Icons, Temperature, Wind Speed, and Humidity
        var newDay = document.createElement("div");
        newDay.classList = "col forecast"

        var dateEl = document.createElement("h6");
        dateEl.textContent = dateString;
        dateEl.className = "text-center";

        var iconEl = document.createElement("img");
        iconEl.setAttribute("src", iconUrl);

        var temperatureEl = document.createElement("p");
        temperatureEl.textContent = temperature;

        var windspeedEl = document.createElement("p");
        windspeedEl.textContent = windSpeed;

        var humidityEl = document.createElement("p");
        humidityEl.textContent = humidity;

        // Add these elements to a div that will hold them, then put that div into our 5 day forecast
        newDay.appendChild(dateEl);
        newDay.appendChild(iconEl);
        newDay.appendChild(temperatureEl);
        newDay.appendChild(windspeedEl);
        newDay.appendChild(humidityEl);

        fiveForecastEl.appendChild(newDay);
    }
}

// Save to local storage
var saveWeather = function() {
    saveObject.history = [...searches];
    saveObject.last = lastSearch;
    localStorage.setItem("searches", JSON.stringify(saveObject));
}

// Load data from the local storage once the page is opened. If no local storage, display a default
// Otherwise, display the current information for the last city the user searched.
var loadWeather = function() {
    saveObject = JSON.parse(localStorage.getItem("searches"));
    
    if(!saveObject) {
        saveObject = {
            history: searches,
            last: lastSearch
        }
        return;
    }

    if(saveObject.history.length > 0) {
        for(let i = 0; i < saveObject.history.length; i++) {
            updateHistory(saveObject.history[i], true);
        }
        getLocation(saveObject.last);
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

loadWeather();

// Listen :)
userFormEl.addEventListener("submit", formSubmitHandler);
searchHistoryEl.addEventListener("click", historyHandler);