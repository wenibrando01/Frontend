import React, { useMemo, useState, useEffect } from "react";
import {
  getCurrentWeather,
  getCurrentWeatherByCoords,
  normalizeWeatherError,
} from "../../services/weatherApi";
import ForecastDisplay from "./ForecastDisplay";

const WeatherWidget = ({ defaultCity = "Manila" }) => {
  const [cityInput, setCityInput] = useState(defaultCity);
  const [activeCity, setActiveCity] = useState(defaultCity);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const locationLabel = useMemo(() => {
    if (coords) return "Your location";
    return activeCity;
  }, [coords, activeCity]);

  const skyPhase = useMemo(() => {
    const fallbackHour = new Date().getHours();
    const weatherHour =
      typeof weather?.dt === "number" && typeof weather?.timezone === "number"
        ? new Date((weather.dt + weather.timezone) * 1000).getUTCHours()
        : fallbackHour;

    if (weatherHour >= 5 && weatherHour < 11) return "morning";
    if (weatherHour >= 11 && weatherHour < 17) return "day";
    if (weatherHour >= 17 && weatherHour < 20) return "evening";
    return "night";
  }, [weather]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");
        const data = coords
          ? await getCurrentWeatherByCoords(coords)
          : await getCurrentWeather(activeCity);
        setWeather(data);
      } catch (err) {
        setError(normalizeWeatherError(err));
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };
    if (activeCity || coords) fetchWeather();
  }, [activeCity, coords]);

  const onSearch = (e) => {
    e.preventDefault();
    const next = cityInput.trim();
    if (!next) return;
    setCoords(null);
    setActiveCity(next);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setError("");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setWeather(null);
        setLoading(false);
      },
      () => {
        setError("Location permission denied. You can still search by city.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <div className={`weather weather-shell weather-phase-${skyPhase}`}>
      <div className="weather-sky-bg" aria-hidden="true">
        <span className="weather-cloud cloud-1" />
        <span className="weather-cloud cloud-2" />
        <span className="weather-cloud cloud-3" />
      </div>

      <form className="weather-search-bar" onSubmit={onSearch}>
        <input
          className="input educo-input weather-search-input"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="Search city (e.g. Manila)"
          aria-label="City"
        />
        <button className="button primary weather-action-btn" type="submit" disabled={loading}>
          Search
        </button>
        <button className="button weather-action-btn ghost" type="button" onClick={useMyLocation} disabled={loading}>
          Use my location
        </button>
      </form>

      {error && <div className="pill warn">{error}</div>}
      {loading && <div className="muted">Loading weather...</div>}

      {!loading && weather && (
        <div className="weather-layout">
          <div className="weather-hero-panel">
            <div className="weather-main">
              <div className="weather-hero-text">
                <div className="weather-city">{locationLabel}</div>
                <div className="weather-label">
                  {weather.weather?.[0]?.description || "Current conditions"}
                </div>
                <div className="weather-temp">{Math.round(weather.main.temp)}°</div>
              </div>
              <div className="weather-hero-icon" aria-hidden>
                {weather.weather?.[0]?.icon ? (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description || "Current weather"}
                    className="weather-hero-weather-image"
                    style={{ width: 128, height: 128 }}
                  />
                ) : (
                  "☁"
                )}
              </div>
            </div>

            <div className="weather-hero-meta">
              <div className="weather-chip">
                <span className="muted">Feels like</span>
                <span className="mono">{Math.round(weather.main.feels_like)}°</span>
              </div>
              <div className="weather-chip">
                <span className="muted">Humidity</span>
                <span className="mono">{weather.main.humidity}%</span>
              </div>
              <div className="weather-chip">
                <span className="muted">Wind</span>
                <span className="mono">{Number(weather.wind.speed).toFixed(1)} m/s</span>
              </div>
            </div>
          </div>

          <ForecastDisplay city={coords ? null : activeCity} coords={coords} weather={weather} />
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
