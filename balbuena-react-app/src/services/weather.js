const CITY_PRESETS = [
  { id: 'manila', name: 'Manila', latitude: 14.5995, longitude: 120.9842 },
  { id: 'cebu', name: 'Cebu City', latitude: 10.3157, longitude: 123.8854 },
  { id: 'davao', name: 'Davao City', latitude: 7.1907, longitude: 125.4553 },
  { id: 'baguio', name: 'Baguio', latitude: 16.4023, longitude: 120.596 },
];

export function getCityPresets() {
  return CITY_PRESETS;
}

export async function fetchWeather({ latitude, longitude }) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(latitude)}` +
    `&longitude=${encodeURIComponent(longitude)}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather');
  const data = await res.json();

  return {
    temperature: data?.current?.temperature_2m,
    windSpeed: data?.current?.wind_speed_10m,
    weatherCode: data?.current?.weather_code,
    todayHigh: data?.daily?.temperature_2m_max?.[0],
    todayLow: data?.daily?.temperature_2m_min?.[0],
    timezone: data?.timezone,
  };
}

export function weatherLabel(code) {
  // Open-Meteo weather codes (simplified)
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2) return 'Mostly clear';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Weather';
}

