const API_KEY = 'ab77f0c81f0641d1bf8112802250803';
const body = document.body;
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            getWeatherData(position.coords.latitude, position.coords.longitude);
        }, showError);
    } else {
        alert('Geolocation не поддерживается вашим браузером');
    }
}


async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no`
        );
        const data = await response.json();
        updateUI(data);
        updateTimeOfDay(data.location.localtime);
    } catch (error) {
        console.error('Ошибка получения данных:', error);
    }
}


function updateUI(data) {
    const current = data.current;
    const location = data.location;
    const forecast = data.forecast.forecastday;

    
    document.querySelector('.location h2').textContent = location.name;
    document.querySelector('.date').textContent = moment(location.localtime).format('dddd, MMMM D');
    document.querySelector('.temp-value').textContent = current.temp_c;
    document.querySelector('.weather-description p').textContent = current.condition.text;
    
    
    const icon = document.createElement('img');
    icon.src = `https:${current.condition.icon}`;
    document.querySelector('.weather-icon').innerHTML = '';
    document.querySelector('.weather-icon').appendChild(icon);

    
    document.querySelectorAll('.detail-value')[0].textContent = `${current.feelslike_c}°C`;
    document.querySelectorAll('.detail-value')[1].textContent = `${current.humidity}%`;
    document.querySelectorAll('.detail-value')[2].textContent = `${current.wind_kph} km/h`;
    document.querySelectorAll('.detail-value')[3].textContent = `${current.pressure_mb} hPa`;

    
    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.innerHTML = '';
    forecast.forEach(day => {
        const date = moment(day.date).format('ddd');
        const temp = day.day.avgtemp_c;
        const icon = day.day.condition.icon;
        
        forecastContainer.innerHTML += `
            <div class="forecast-day">
                <p class="day-name">${date}</p>
                <img src="https:${icon}" class="forecast-icon">
                <p class="forecast-temp">${temp}°C</p>
            </div>
        `;
    });
}


function updateTimeOfDay(localTime) {
    const hour = moment(localTime).hour();
    body.className = '';
    
    if (hour >= 5 && hour < 12) {
        body.classList.add('morning');
    } else if (hour >= 12 && hour < 18) {
        body.classList.add('day');
    } else if (hour >= 18 && hour < 21) {
        body.classList.add('evening');
    } else {
        body.classList.add('night');
    }
}


searchButton.addEventListener('click', () => {
    if (searchInput.value) {
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${searchInput.value}&days=5`)
            .then(response => response.json())
            .then(data => {
                updateUI(data);
                updateTimeOfDay(data.location.localtime);
            });
    }
});


function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert('Пожалуйста, разрешите доступ к геолокации');
            break;
        default:
            alert('Ошибка определения местоположения');
    }
}


getLocation();