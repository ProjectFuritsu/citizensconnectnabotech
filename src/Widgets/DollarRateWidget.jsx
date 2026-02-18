import React, { useState, useEffect } from "react";
import { CurrencyService } from "./services/CurrencyAPI";

export default function DollarRateWidget() {
  const [currency, setCurrency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const service = new CurrencyService();
    service.getUSDToPHP().then((res) => {
      setCurrency(res);
      setLoading(false);
    });
  }, []);

  // Hide the widget if loading or if there's an error
  if (loading || !currency) return null;

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto bg-white border border-green-100 shadow-sm rounded-lg p-5 flex items-center justify-between">
        <div>
          <h3 className="text-green-600 font-bold uppercase text-[10px] tracking-widest mb-1">
            Official USD / PHP
          </h3>
          <p className="text-2xl font-black text-slate-800">₱{currency.rate}</p>
        </div>
        <div className="text-right">
          <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full mb-1">
            LIVE
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            As of {currency.date}
          </p>
        </div>
      </div>
    </div>
  );
}
