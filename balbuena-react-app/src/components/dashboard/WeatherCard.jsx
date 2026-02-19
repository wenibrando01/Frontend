import React, { useEffect, useMemo, useState } from 'react';
import Card from '../ui/Card';
import { CloudSun, MapPin, Wind } from 'lucide-react';
import { fetchWeather, getCityPresets, weatherLabel } from '../../services/weather';

export default function WeatherCard() {
  const presets = useMemo(() => getCityPresets(), []);
  const [cityId, setCityId] = useState(presets[0]?.id ?? 'manila');
  const city = useMemo(() => presets.find((c) => c.id === cityId) ?? presets[0], [cityId, presets]);

  const [state, setState] = useState({ status: 'idle', data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setState({ status: 'loading', data: null, error: null });
      try {
        const data = await fetchWeather({ latitude: city.latitude, longitude: city.longitude });
        if (cancelled) return;
        setState({ status: 'success', data, error: null });
      } catch (e) {
        if (cancelled) return;
        setState({ status: 'error', data: null, error: e?.message ?? 'Weather error' });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [city.latitude, city.longitude]);

  return (
    <Card
      title="Weather"
      description="Live data via Open‑Meteo (no API key)."
      actions={
        <label className="select-wrap">
          <MapPin size={16} />
          <select value={cityId} onChange={(e) => setCityId(e.target.value)} aria-label="Select city">
            {presets.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      }
    >
      {state.status === 'loading' && <div className="muted">Loading weather…</div>}
      {state.status === 'error' && <div className="muted">Weather unavailable: {state.error}</div>}
      {state.status === 'success' && (
        <div className="weather">
          <div className="weather-main">
            <div className="weather-icon">
              <CloudSun size={22} />
            </div>
            <div>
              <div className="weather-temp">{Math.round(state.data.temperature)}°C</div>
              <div className="weather-label">{weatherLabel(state.data.weatherCode)}</div>
            </div>
          </div>

          <div className="weather-grid">
            <div className="weather-chip">
              <span className="muted">High</span>
              <strong>{Math.round(state.data.todayHigh)}°</strong>
            </div>
            <div className="weather-chip">
              <span className="muted">Low</span>
              <strong>{Math.round(state.data.todayLow)}°</strong>
            </div>
            <div className="weather-chip">
              <Wind size={16} />
              <strong>{Math.round(state.data.windSpeed)} km/h</strong>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

