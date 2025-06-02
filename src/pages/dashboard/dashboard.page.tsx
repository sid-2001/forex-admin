import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import HasPermission from '@/components/permissionWrapper'
const API_URL = "https://data.fixer.io/api/latest?access_key=a2a71cbc49db03a0c67fb2fa5cb4e5a9&base=ZAR";
const STORAGE_KEY = "exchange_rates";
const EXPIRATION_TIME = 30 * 60 * 1000; // 30 minutes
import { LocalStorageService } from '@/helpers/local-storage-service';

const fetchExchangeRates = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (data.success) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
      return data;
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
  }
  return null;
};

const getExchangeRates = async () => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    if (Date.now() - parsedData.timestamp < EXPIRATION_TIME) {
      return parsedData;
    }
  }
  return await fetchExchangeRates();
};

const ExchangeRateBarChart = () => {
  const [rates, setRates] = useState([]);
  const local_service = new LocalStorageService();
  useEffect(() => {
    const updateRates = async () => {
      const data = await getExchangeRates();
      if (data && data.rates) {
        const weakerCurrencies = Object.entries(data.rates)
          .filter(([_, value]) =>
            //@ts-ignore
            value < 1)
          .map(([currency, value]) => ({ currency, value }));

        //@ts-ignore
        setRates(weakerCurrencies);
      }
    };
    updateRates();
    const interval = setInterval(updateRates, EXPIRATION_TIME);
    return () => clearInterval(interval);
  }, []);

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.DASHBOARD}>
      <BarChart
        series={[{
          data: rates.map((item) =>

            //@ts-ignore
            item.value), label: ' Rates'
        }]}
        xAxis={[{
          data: rates.map((item) =>
            //@ts-ignore
            item.currency), scaleType: 'band'
        }]}
        yAxis={[{
          min: 0, max: Math.max(...rates.map((item) =>
            //@ts-ignore
            item.value), 1) * 1.1
        }]} // Fixed yAxis type to be an array
        // barLabel={(item) => (item.value ? item.value.toFixed(6) : null)}
        width={1200}
        height={350}
      />
    </HasPermission>
  );
};

export default ExchangeRateBarChart;
