// src/Hooks/useCurrency.js
import { useState, useEffect } from 'react';
import { CurrencyService } from '../../Services/CurrencyAPI';

export function useCurrency() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = new CurrencyService();

    const fetchData = () => {
      service.getUSDToPHP().then(res => {
        if (res) {
          setData({
            ...res,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
        setLoading(false);
      });
    };

    // 1. Initial fetch
    fetchData();

    // 2. Refresh every 10 minutes (600,000 ms)
    const interval = setInterval(fetchData, 600000);

    // 3. Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return { data, loading };
}