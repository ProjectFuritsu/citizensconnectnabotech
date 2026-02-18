// src/Services/OpenWeatherAPI.js
export class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.currentUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";
  }

  async getCitizenBulletin(lat, lon) {
    try {
      const [currRes, foreRes] = await Promise.all([
        fetch(
          `${this.currentUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`,
        ),
        fetch(
          `${this.forecastUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`,
        ),
      ]);

      if (!currRes.ok || !foreRes.ok) return null;

      const current = await currRes.json();
      const forecastData = await foreRes.json();

      // 1. Group the 3-hour chunks by date
      const dailyMap = {};
      forecastData.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0]; // Gets "YYYY-MM-DD"

        if (!dailyMap[date]) {
          dailyMap[date] = {
            maxTemp: item.main.temp,
            condition: item.weather[0].main,
            dt: item.dt,
          };
        } else {
          // 2. Always keep the HIGHEST temp found for that day
          if (item.main.temp > dailyMap[date].maxTemp) {
            dailyMap[date].maxTemp = item.main.temp;
            dailyMap[date].condition = item.weather[0].main;
          }
        }
      });

      // 3. Convert back to array and skip Today (index 0)
      const dailyForecast = Object.values(dailyMap)
        .slice(1, 4)
        .map((day) => ({
          dayName: new Date(day.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          temp: Math.round(day.maxTemp), // Now shows the peak of the day
          condition: day.condition,
        }));

      return {
        temp: Math.round(current.main.temp),
        description: `Today in ${current.name}, we are experiencing ${current.weather[0].description}.`,
        days: dailyForecast,
        updatedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch (error) {
      return null;
    }
  }
}
