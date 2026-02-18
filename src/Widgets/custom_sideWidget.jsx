import React from "react";
import {
  Cloud,
  ArrowUpRight,
  Clock,
  MapPin,
  TrendingUp,
  RefreshCw,
} from "lucide-react"; // Suggested icons
import { useWeather } from "../Hooks/useWeather";
import { useCurrency } from "../Hooks/Currency/useCurrency";
import Custom_EventPortalCard from "./custom_EventPortalCard";

export default function Custom_SideWidget() {
  const { data: weather, loading: weatherLoading } = useWeather();
  const { data: currency, loading: currencyLoading } = useCurrency();

  const lastUpdate = weather?.updatedAt || currency?.updatedAt || "Updating...";

  // Skeleton Loader Component for a smoother UX
  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-slate-100 rounded w-1/3"></div>
      <div className="h-12 bg-slate-100 rounded-lg"></div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-50 rounded-xl"></div>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="col-span-12 lg:col-span-4 space-y-6">
      {/* --- WEATHER & FOREX CARD --- */}
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-6">
          {/* Weather Section */}
          {weatherLoading ? (
            <Skeleton />
          ) : (
            weather && (
              <section className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <MapPin size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Panabo City
                      </span>
                    </div>
                    <h1 className="text-slate-800 text-lg font-heavy">
                      Local Forecast
                    </h1>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-green-700 uppercase tracking-tight">
                      Live
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="text-5xl font-black text-slate-900 tracking-tighter">
                    {weather.temp}°
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-600 text-sm font-medium leading-tight capitalize">
                      {weather.description}
                    </p>
                    <div className="inline-flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      REAL FEEL {weather.feelsLike || weather.temp}°
                    </div>
                  </div>
                </div>

                {/* 3-Day Mini Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {weather.days.map((day, index) => (
                    <div
                      key={index}
                      className="group text-center p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-md transition-all duration-300"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {day.dayName}
                      </span>
                      <div className="text-sm font-bold text-slate-800 my-1">
                        {day.temp}°
                      </div>
                      <Cloud
                        size={14}
                        className="mx-auto text-blue-400 group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
          )}

          {/* Forex Section */}
          {currencyLoading ? (
            <div className="h-16 bg-slate-50 animate-pulse rounded-xl" />
          ) : (
            currency && (
              <section className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                      <TrendingUp size={14} />
                    </div>
                    <h2 className="text-slate-800 text-xs font-bold uppercase tracking-wide">
                      Exchange Rate
                    </h2>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    USD / PHP
                  </span>
                </div>

                <div className="flex justify-between items-center bg-linear-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-inner">
                  <span className="text-sm font-bold text-slate-500">
                    $1.00
                  </span>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight size={14} className="text-green-500" />
                    <span className="text-lg font-mono font-black text-slate-900">
                      ₱{currency.rate}
                    </span>
                  </div>
                </div>
              </section>
            )
          )}
        </div>

        {/* Dynamic Footer */}
        <footer className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-slate-400">
            <RefreshCw
              size={10}
              className={weatherLoading ? "animate-spin" : ""}
            />
            <p className="text-[10px] font-medium leading-none">
              Updated {lastUpdate}
            </p>
          </div>
          <div className="flex gap-2">
             <a href="https://openweathermap.org/" className="text-[8px] text-slate-400 hover:text-blue-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 transition-all">
                Weather
              </a>
              <a href="https://frankfurter.dev/" className="text-[8px] text-slate-400 hover:text-blue-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 transition-all">
                Forex
              </a>
          </div>
        </footer>
      </div>

      {/* --- UPCOMING EVENTS --- */}
      <Custom_EventPortalCard/>
    </aside>
  );
}
