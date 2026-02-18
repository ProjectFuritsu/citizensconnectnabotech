export class CurrencyService {
  constructor() {
    // Frankfurter is open-source and free
    this.baseUrl = 'https://api.frankfurter.dev/v1/latest';
  }

  async getUSDToPHP() {
    try {
      // We set USD as base and PHP as the target symbol
      const response = await fetch(`${this.baseUrl}?base=USD&symbols=PHP`);
      
      if (!response.ok) return null;

      const data = await response.json();
      
      return {
        rate: data.rates.PHP.toFixed(2),
        date: data.date // The official date of the exchange rate
      };
    } catch (error) {
      console.error("Currency fetch failed:", error);
      return null;
    }
  }
}