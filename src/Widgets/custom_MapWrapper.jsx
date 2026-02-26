import React, { useEffect, useState, useRef, useMemo } from "react";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, Popup, Tooltip } from "react-leaflet";
import {
  ShoppingBag,
  MapPin,
  Fuel,
  Wrench,
  Compass,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  Wallet,
} from "lucide-react";
import geoData from "../Data/Geo/geoData.json";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// --- STYLES ---
const mobileStyles = `
  .leaflet-routing-container { display: none !important; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .custom-popup .leaflet-popup-content-wrapper { border-radius: 20px; padding: 0; overflow: hidden; }
  .custom-popup .leaflet-popup-content { margin: 0; width: 280px !important; }
  
  /* Modern Tooltip Styling */
  .custom-tooltip {
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    padding: 4px 8px !important;
    font-weight: 700 !important;
    color: #1e293b !important;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
    font-size: 10px !important;
  }
  .custom-tooltip:before { border-top-color: white !important; }
`;

// --- HELPER: CHECK IF OPEN ---
const getStatus = (hours) => {
  if (hours === "24 Hours")
    return { label: "Open 24/7", color: "text-emerald-600 bg-emerald-50" };

  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  try {
    const [start, end] = hours.split(" - ");
    const parseTime = (t) => {
      let [time, modifier] = t.split(" ");
      let [hrs, mins] = time.split(":").map(Number);
      if (modifier === "PM" && hrs !== 12) hrs += 12;
      if (modifier === "AM" && hrs === 12) hrs = 0;
      return hrs * 100 + mins;
    };

    const openTime = parseTime(start);
    const closeTime = parseTime(end);

    if (currentTime >= openTime && currentTime <= closeTime) {
      return { label: "Open Now", color: "text-emerald-600 bg-emerald-50" };
    }
    return { label: "Closed", color: "text-red-600 bg-red-50" };
  } catch (e) {
    return { label: "None", color: "text-slate-500 bg-slate-100" };
  }
};

const createCustomIcon = (category, isSelected) => {
  const categoryConfigs = {
    Shopping: { icon: <ShoppingBag size={14} />, color: "bg-blue-600" },
    "Tourist Spot": { icon: <Compass size={14} />, color: "bg-emerald-500" },
    "Gas Station": { icon: <Fuel size={14} />, color: "bg-orange-500" },
    "Repair Shop": { icon: <Wrench size={14} />, color: "bg-slate-600" },
    User: { icon: <div className="w-2 h-2 bg-white rounded-full animate-ping" />, color: "bg-blue-500" },
    Default: { icon: <MapPin size={14} />, color: "bg-red-500" },
  };

  const config = categoryConfigs[category] || categoryConfigs.Default;
  const activeClass = isSelected ? "scale-125 z-[1000]" : "scale-100";

  const iconHtml = renderToString(
    <div className={`relative flex items-center justify-center transition-all duration-300 ${activeClass}`}>
      {/* Precision Pointing Pin */}
      <div className={`w-8 h-8 sm:w-9 sm:h-9 ${config.color} rounded-full rounded-bl-none rotate-45 border-2 border-white shadow-xl flex items-center justify-center`}>
        <div style={{ transform: "rotate(-45deg)" }} className="text-white">
          {config.icon}
        </div>
      </div>
      {/* Bottom Tip for exact location alignment */}
      <div className={`absolute -bottom-1 w-2 h-2 ${config.color} rotate-45 border-r-2 border-b-2 border-white`} />
      
      {/* Visual Indicator Ring for Selected Item */}
      {isSelected && (
        <div className="absolute -inset-2 border-2 border-blue-400 rounded-full animate-pulse opacity-50" />
      )}
    </div>,
  );

  return L.divIcon({
    html: iconHtml,
    className: "bg-transparent",
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Pointed at the exact bottom center
    popupAnchor: [0, -36],
  });
};

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

function RoutingMachine({ start, end, onDone }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!map || !start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 6, opacity: 0.8 }],
        addWaypoints: false,
      },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
    });

    try {
      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    } catch (err) {
      console.error("Routing Error:", err);
    }

    routingControl.on("routesfound", () => {
      if (onDoneRef.current) onDoneRef.current();
    });

    return () => {
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.debug("Safe routing cleanup.");
        } finally {
          routingControlRef.current = null;
        }
      }
    };
  }, [map, start, end]);

  return null;
}

export default function IntuitiveMap() {
  const [userPos, setUserPos] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeDestination, setRouteDestination] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollRef = useRef(null);
  const markerRefs = useRef({});

  const categories = useMemo(
    () => ["All", ...new Set(geoData.locations.map((loc) => loc.category))],
    [],
  );

  const filteredLocations = useMemo(() => {
    return geoData.locations.filter((loc) => {
      const matchesCategory = activeCategory === "All" || loc.category === activeCategory;
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error(err),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleSelect = (loc) => {
    setSelectedLocation(loc);
    setIsSidebarOpen(false);
    markerRefs.current[loc.id]?.openPopup();
  };

  if (!userPos)
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center font-bold text-slate-400 animate-pulse">
        Initializing Panabo Map...
      </div>
    );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <style>{mobileStyles}</style>

      {/* SEARCH BAR */}
      <div className="absolute top-4 left-4 right-4 z-1000 sm:left-6 sm:right-auto sm:w-84">
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-2">
          <Search size={18} className="text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search Panabo..."
            className="w-full p-2 text-sm bg-transparent outline-none text-slate-700"
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSidebarOpen(true)}
          />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-100 rounded-xl sm:hidden">
            {isSidebarOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className={`absolute left-0 right-0 bottom-0 z-1001 bg-white rounded-t-[40px] shadow-2xl transition-all duration-500 sm:top-24 sm:left-6 sm:right-auto sm:bottom-auto sm:w-84 sm:rounded-3xl sm:max-h-[75vh] ${isSidebarOpen ? "h-[75vh]" : "h-16 sm:h-auto sm:hidden"}`}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 sm:hidden cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="px-6 pb-6 overflow-hidden h-full flex flex-col">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap ${activeCategory === cat ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-500"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {filteredLocations.map((loc) => {
              const status = getStatus(loc.hours);
              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedLocation?.id === loc.id ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100"}`}
                >
                  <h4 className="font-bold text-slate-800 text-sm">{loc.name}</h4>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {loc.address}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <MapContainer center={userPos} zoom={15} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <RecenterMap position={userPos} />
        
        {/* USER LOCATION */}
        <Marker position={userPos} icon={createCustomIcon("User", false)}>
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>You are here</Tooltip>
        </Marker>

        {/* LOCATION MARKERS */}
        {filteredLocations.map((loc) => {
          const status = getStatus(loc.hours);
          const isSelected = selectedLocation?.id === loc.id;

          return (
            <Marker
              key={loc.id}
              position={loc.coords}
              icon={createCustomIcon(loc.category, isSelected)}
              ref={(el) => (markerRefs.current[loc.id] = el)}
              eventHandlers={{ click: () => setSelectedLocation(loc) }}
            >
              {/* LABEL: Visible on hover (or permanent if you prefer) */}
              <Tooltip 
                className="custom-tooltip" 
                direction="top" 
                offset={[0, -35]} 
                opacity={1}
              >
                {loc.name}
              </Tooltip>

              <Popup className="custom-popup">
                <div className="p-4 flex flex-col gap-3">
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black text-blue-600 uppercase">{loc.category}</span>
                    <h3 className="text-lg font-bold text-slate-900">{loc.name}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={12} /> {loc.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 py-2 border-y border-slate-50">
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-700">{loc.hours}</span>
                    </div>
                  </div>

                  <button
                    disabled={isRouting}
                    onClick={() => {
                      setIsRouting(true);
                      setRouteDestination(loc.coords);
                    }}
                    className={`w-full py-3.5 text-white text-[11px] font-black uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg ${isRouting ? "bg-slate-400" : "bg-blue-600"}`}
                  >
                    {isRouting ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
                    {isRouting ? "Calculating..." : "Start Navigation"}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {routeDestination && (
          <RoutingMachine
            start={userPos}
            end={routeDestination}
            onDone={() => setIsRouting(false)}
          />
        )}
      </MapContainer>
    </div>
  );
}