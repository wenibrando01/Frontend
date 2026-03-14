import React, { useEffect, useMemo, useState } from "react";
import {
  getForecast,
  getForecastByCoords,
  normalizeWeatherError,
} from "../../services/weatherApi";
import LoadingSpinner from "../common/LoadingSpinner";

const ForecastDisplay = ({ city, coords, weather }) => {
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentConditions = useMemo(
    () => [
      { label: "Real Feel", value: `${Math.round(weather?.main?.feels_like ?? 0)}°` },
      { label: "Wind", value: `${Number(weather?.wind?.speed ?? 0).toFixed(1)} m/s` },
      { label: "Humidity", value: `${weather?.main?.humidity ?? 0}%` },
      { label: "Pressure", value: `${weather?.main?.pressure ?? 0} hPa` },
    ],
    [weather]
  );

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setError("");
        const data = await getForecast(city);
        const all = Array.isArray(data?.list) ? data.list : [];
        const hourlyForecast = all.slice(0, 6);
        const dailyForecast = all.filter((f) => f.dt_txt.includes("12:00:00")).slice(0, 7);
        setHourly(hourlyForecast);
        setDaily(dailyForecast);
      } catch (err) {
        setError(normalizeWeatherError(err));
      } finally {
        setLoading(false);
      }
    };
    const fetchForecastByCoords = async () => {
      try {
        setError("");
        const data = await getForecastByCoords(coords);
        const all = Array.isArray(data?.list) ? data.list : [];
        const hourlyForecast = all.slice(0, 6);
        const dailyForecast = all.filter((f) => f.dt_txt.includes("12:00:00")).slice(0, 7);
        setHourly(hourlyForecast);
        setDaily(dailyForecast);
      } catch (err) {
        setError(normalizeWeatherError(err));
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setHourly([]);
    setDaily([]);

    if (coords) fetchForecastByCoords();
    else if (city) fetchForecast();
    else setLoading(false);
  }, [city, coords]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="pill warn">{error}</div>;
  if (!daily.length) return <p className="muted">No forecast available.</p>;

  return (
    <div className="weather-forecast-layout">
      <div className="weather-card weather-today-forecast">
        <div className="weather-section-title">TODAY'S FORECAST</div>
        <div className="weather-hourly-strip">
          {hourly.map((slot, index) => (
            <div key={`${slot.dt_txt}-${index}`} className="weather-hour-item">
              <div className="weather-hour-time">
                {new Date(slot.dt_txt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${slot.weather[0].icon}@2x.png`}
                alt={slot.weather[0].description}
                className="weather-hour-icon"
              />
              <div className="weather-hour-temp">{Math.round(slot.main.temp)}°</div>
            </div>
          ))}
        </div>
      </div>

      <div className="weather-card weather-air-card">
        <div className="weather-section-title">AIR CONDITIONS</div>
        <div className="weather-air-grid">
          {currentConditions.map((item) => (
            <div key={item.label} className="weather-air-item">
              <div className="weather-air-label">{item.label}</div>
              <div className="weather-air-value">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="weather-card weather-weekly-card">
        <div className="weather-section-title">7-DAY FORECAST</div>
        <div className="weather-week-list">
          {daily.map((day, index) => (
            <div key={`${day.dt_txt}-${index}`} className="weather-week-row">
              <div className="weather-week-day">
                {index === 0
                  ? "Today"
                  : new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="weather-week-meta">
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                  className="weather-week-icon"
                />
                <span>{day.weather[0].main || day.weather[0].description}</span>
              </div>
              <div className="weather-week-temp">
                {Math.round(day.main.temp_max)}/{Math.round(day.main.temp_min)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForecastDisplay;