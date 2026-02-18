// src/hooks/useWeather.js
import { useState, useEffect } from 'react';
import { WeatherService } from '../Services/OpenWeatherAPI';

const API_KEY = import.meta.env.VITE_OpenWeather_API_KEY;
const LAT = import.meta.env.VITE_LAT;
const LON = import.meta.env.VITE_LON;

export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = new WeatherService(API_KEY);

    const fetchData = () => {
      service.getCitizenBulletin(LAT, LON)
        .then((res) => {
          if (res) {
            setData({
              ...res,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
        })
        .finally(() => setLoading(false));
    };

    // 1. Initial fetch when component mounts
    fetchData();

    // 2. Set interval to refresh every 10 minutes
    const interval = setInterval(fetchData, 600000); 

    // 3. Cleanup: Clear the timer if the user leaves the page
    return () => clearInterval(interval);

  }, [LAT, LON]);

  return { data, loading };
}