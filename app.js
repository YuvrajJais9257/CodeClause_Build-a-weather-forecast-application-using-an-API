document.addEventListener('DOMContentLoaded', function () {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const humidityElement = document.getElementById('humidity');
    const pressureElement = document.getElementById('pressure');
    const windElement = document.getElementById('wind');
    const currentWeatherItemsElement=document.getElementById('current-weather-items');
    const timeZone=document.getElementById('country');
    const weatherForecastElement=document.getElementById('weather-forecast');
    const currentTempElement=document.getElementById('current-temp');
    const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const API_KEY='6f0037e927f9e3fdf334f72acec80346';
    setInterval(()=>{
        const time=new Date();
        const month=time.getMonth();
        const hour=time.getHours();
        const day=time.getDay();
        const date=time.getDate();
        const minute=time.getMinutes();
        const hoursIn12HrFormat=hour>=13?hour%12:hour;
        const ampm=hour>=12?'PM':'AM';
        timeElement.innerHTML=hoursIn12HrFormat+" : "+minute+" "+`<span id="am-pm">
        ${ampm}
    </span>`
    dateElement.innerHTML=days[day]+", "+date+" "+months[month];
    },1000);
    getWeatherData();
    function getWeatherData() {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
    
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&exclude=hourly,minutely`)
                .then((res) => res.json())
                .then((currentWeatherData) => {

                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=en&exclude=hourly,minutely`)
                        .then((res) => res.json())
                        .then((forecastData) => {
                            console.log(currentWeatherData, forecastData);
                            showWeatherData(currentWeatherData, forecastData);
                        });
                });
        });
    }
    
    function showWeatherData(currentWeatherData, forecastData) {
        
        let {humidity, pressure}=forecastData.list[0].main;
        let {sunrise, sunset}=currentWeatherData.sys;
        let windSpeed = forecastData.list[0].wind.speed;
        const sunriseTime = new Date(sunrise * 1000);
        const sunsetTime = new Date(sunset * 1000);
        const sunriseMinutes = sunriseTime.getMinutes();
        const sunsetHours = sunsetTime.getHours();
        const sunsetMinutes = sunsetTime.getMinutes();
        const sunriseHours = sunriseTime.getHours();
        const sunrisePeriod = sunriseHours >= 12 ? 'PM' : 'AM';
        const sunsetPeriod = sunsetHours >= 12 ? 'PM' : 'AM';    
        const sunriseFormattedHours = (sunriseHours % 12 || 12).toString().padStart(2, '0');
        const sunsetFormattedHours = (sunsetHours % 12 || 12).toString().padStart(2, '0');
        const sunriseFormatted = sunriseFormattedHours + ':' + sunriseMinutes.toString().padStart(2, '0') + ' ' + sunrisePeriod;
        const sunsetFormatted = sunsetFormattedHours + ':' + sunsetMinutes.toString().padStart(2, '0') + ' ' + sunsetPeriod;
        const pressureAtm = (pressure / 1013.25).toFixed(2);
        const forecastItems = forecastData.list;
        const forecastDataByDay = {};
        forecastItems.forEach((forecast) => {
            const timestamp = forecast.dt;
            const dates = new Date(timestamp * 1000);
            const dayOfWeek = dates.toLocaleDateString('en-US', { weekday: 'long' });
    
            if (!forecastDataByDay[dayOfWeek]) {
                forecastDataByDay[dayOfWeek] = [];
            }
            forecastDataByDay[dayOfWeek].push(forecast);
        });
        const forecastCarouselElement = document.getElementById('carouselExampleSlidesOnly');
        let carouselHTML = '';
        let active = true;
        for (const dayOfWeek in forecastDataByDay) {
            const forecasts = forecastDataByDay[dayOfWeek];
            const temperatureDay = forecasts[0].main.temp_max;
            const temperatureNight = forecasts[0].main.temp_min;
            const icon = forecasts[0].weather[0].icon;
            carouselHTML += `
            <div class="carousel-item ${active ? 'active' : ''}">
                <div class="future-forecast">
                    <div class="weather-forecast">
                        <div class="weather-forecast-item">
                            <div class="day">${dayOfWeek}</div>
                            <img src="https://openweathermap.org/img/w/${icon}.png" alt="weather-icon" class="w-icon">
                            <div class="temp">Day ${temperatureDay.toFixed(1)}°C</div>
                            <div class="temp">Night ${temperatureNight.toFixed(1)}°C</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        active = false;
        }
         forecastCarouselElement.innerHTML = carouselHTML;
        currentWeatherItemsElement.innerHTML=
        `<div class="weather-item">
        <div class="card-subtitle">Humidity</div>
        <div class="card-text" id="humidity">${humidity} %</div>
    </div>
    <div class="weather-item">
        <div class="card-subtitle">Pressure</div>
        <div class="card-text" id="pressure">${pressureAtm} atm</div>
    </div>
    <div class="weather-item">
        <div class="card-subtitle">Wind</div>
        <div class="card-text" id="wind">${windSpeed} m/s</div>
    </div>
    <div class="weather-item">
        <div class="card-subtitle">Sunrise</div>
        <div class="card-text" id="sunrise">${sunriseFormatted}</div>
    </div>
    <div class="weather-item">
        <div class="card-subtitle">Sunset</div>
        <div class="card-text" id="sunset">${sunsetFormatted}</div>
    </div>`
    }
});