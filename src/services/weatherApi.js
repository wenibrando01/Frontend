import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY?.toString().trim();
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const apiWeather = axios.create({
  baseURL: BASE_URL,
});

function requireApiKey() {
  if (API_KEY) return;
  const err = new Error(
    "Missing OpenWeather API key. Set VITE_OPENWEATHER_API_KEY in your .env file."
  );
  err.code = "WEATHER_API_KEY_MISSING";
  throw err;
}

function normalizeWeatherError(e) {
  const status = e?.response?.status;
  if (status === 429) return "Weather API rate limit reached. Please try again shortly.";
  if (status === 404) return "City not found. Try a different spelling.";
  if (status) return `Weather API error (${status}). Please try again.`;
  return "Network error while fetching weather.";
}

// Get current weather by city
export const getCurrentWeather = async (city) => {
  requireApiKey();
  const response = await apiWeather.get(`/weather`, {
    params: {
      q: city,
      appid: API_KEY,
      units: "metric",
    },
  });
  return response.data;
};

export const getCurrentWeatherByCoords = async ({ lat, lon }) => {
  requireApiKey();
  const response = await apiWeather.get(`/weather`, {
    params: { lat, lon, appid: API_KEY, units: "metric" },
  });
  return response.data;
};

// Get 5-day forecast by city
export const getForecast = async (city) => {
  requireApiKey();
  const response = await apiWeather.get(`/forecast`, {
    params: {
      q: city,
      appid: API_KEY,
      units: "metric",
    },
  });
  return response.data;
};

export const getForecastByCoords = async ({ lat, lon }) => {
  requireApiKey();
  const response = await apiWeather.get(`/forecast`, {
    params: { lat, lon, appid: API_KEY, units: "metric" },
  });
  return response.data;
};

export { normalizeWeatherError };
export default apiWeather;