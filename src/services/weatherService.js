import { DateTime,IANAZone,FixedOffsetZone } from "luxon";
const API_KEY = process.env.REACT_APP_API_URL;  // API KEY Store in .env file
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const getWeatherData = (infoType, searchParams) => {
  const url = new URL(BASE_URL + "/" + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

  return fetch(url).then((res) => res.json());
};

const formatCurrentWeather = (data) => {
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed },
    timezone,
  } = data;

  const { main: details, icon } = weather[0];

  return {
    lat,
    lon,
    temp,
    feels_like,
    temp_min,
    temp_max,
    humidity,
    name,
    dt,
    country,
    sunrise,
    sunset,
    details,
    icon,
    speed,
    timezone,
  };
};



const formatForecastWeather = (data) => {
    let { list } = data;
    let {timezone} = data.city;
    let uniqueDates = [];
    let daily = list
    .filter((obj) => {
      const currentDate = new Date(obj.dt_txt.replace(/-/g, "/")); // Replace '-' with '/' for Safari compatibility
      const currentDateString = currentDate.toDateString();
      if (!uniqueDates.includes(currentDateString)) {
        uniqueDates.push(currentDateString);
        return true;
      }
      return false;
    })
    .map((d) => {
      const currentDate = new Date(d.dt_txt.replace(/-/g, "/"));
      const currentDay = currentDate.toLocaleDateString(undefined, { weekday: "short" });
      return {
        title: currentDay,
        temp: d.main.temp,
        icon: d.weather[0].icon,
      };
    });

    let hourly = list.slice(1, 6).map((d) => {
        return {
        title: formatToLocalTime(d.dt, timezone,
          {hour: 'numeric',
          minute: 'numeric',
          hour12: true}),
        temp: d.main.temp,
        icon: d.weather[0].icon,
        };
    });
  

  return { timezone, daily, hourly};
};

const getFormattedWeatherData = async (searchParams) => {
  const formattedCurrentWeather = await getWeatherData(
    "weather",
    searchParams
  ).then(formatCurrentWeather);

  const { lat, lon } = formattedCurrentWeather;

  const formattedForecastWeather = await getWeatherData(
    "forecast",
    searchParams
  ).then(formatForecastWeather);

  return { ...formattedCurrentWeather, ...formattedForecastWeather };
};

const formatToLocalTime = (
  secs,
  zone,
  options = {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZoneName: 'short'
  },
) => {try {

const timestamp = secs; // Unix timestamp in seconds
const offset = zone/60; // UTC offset in minutes (-4 hours)

const date = new Date(timestamp * 1000); // convert timestamp to milliseconds
const utc = date.getTime() + (date.getTimezoneOffset() * 60000); // convert to UTC
const local = utc + (offset * 60000); // add offset to get local time in milliseconds

const localDate = new Date(local); // create new Date object for local time

const formattedDate = localDate.toLocaleString('en-US', options);


return formattedDate;
} catch (error) {
  console.error(error);
  return "Invalid time zone name";
}
}




const iconUrlFromCode = (code) =>
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export { formatToLocalTime, iconUrlFromCode };