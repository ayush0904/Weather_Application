import "./App.css";
import TopButtons from "./components/TopButtons";
import Inputs from "./components/Inputs";
import TimeAndLocation from "./components/TimeAndLocation";
import TemperatureAndDetails from "./components/TemperatureAndDetails";
import Forecast from "./components/Forecast";
import getFormattedWeatherData from "./services/weatherService";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [query, setQuery] = useState({ q: "Los Angeles" });
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);

  // useEffect(() => {
  //   const fetchWeather = async () => {
  //     const message = query.q ? query.q : "current location.";

  //     //toast.info("Fetching weather for " + message);

  //     await getFormattedWeatherData({ ...query, units }).then((data) => {
  //       toast.success(
  //         `Successfully fetched weather for ${data.name}, ${data.country}.`
  //       );
  //       setWeather(data);
  //     });
  //   };

  //   fetchWeather();
  // }, [query, units]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getFormattedWeatherData({ ...query, units });
        if (data) {
          toast.success(
            `Successfully fetched weather for ${data.name}, ${data.country}.`
          );
          setWeather(data);
          
         
        } else {
          toast.error("No weather data found for the given location.");
        }
      } catch (error) {
        toast.error("Error fetching weather data. Please try again later.");
        console.error(error);
      }
    };

    fetchWeather();
  }, [query, units]);

  return (
    <div
      className={`mx-auto max-w-screen-md mt-4 rounded-lg  py-5 px-32 bg-gradient-to-br h-fit opacity-80 shadow-xl shadow-gray-400 from-black to-blur }`}
    >
      <TopButtons setQuery={setQuery} />
      <Inputs setQuery={setQuery} units={units} setUnits={setUnits} />

      {weather && (
        <div>
          <TimeAndLocation weather={weather} />
          
          <TemperatureAndDetails weather={weather} />

          <Forecast title="hourly forecast" items={weather.hourly} />
          <Forecast title="daily forecast" items={weather.daily} />
        </div>
      )}

      <ToastContainer autoClose={5000} theme="colored" newestOnTop={true} />
    </div>
    

  );
}

export default App;