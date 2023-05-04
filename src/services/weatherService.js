import { DateTime } from "luxon";
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
  };
};



const formatForecastWeather = (data) => {
    let { list } = data;
    let {timezone} = data;
   
    let daily = list
    .filter((obj, index, self) => {
      const currentDate = new Date(obj.dt_txt.replace(/-/g, "/")); // Replace '-' with '/' for Safari compatibility
      return self.findIndex(o => new Date(o.dt_txt.replace(/-/g, "/")).toDateString() === currentDate.toDateString()) === index;
    })
    
    .slice(1, 6).map((d) => {
        return {
        title: formatToLocalTime(d.dt, timezone, "ccc"),
        temp: d.main.temp,
        icon: d.weather[0].icon,
        };
    });

    let hourly = list.slice(1, 6).map((d) => {
        return {
        title: formatToLocalTime(d.dt, timezone, "hh:mm a"),
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
  format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

const iconUrlFromCode = (code) =>
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;

export { formatToLocalTime, iconUrlFromCode };