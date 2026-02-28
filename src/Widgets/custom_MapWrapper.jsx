import React, { useEffect, useState, useRef, useMemo } from "react";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  useMapEvents,
} from "react-leaflet";
import {
  ShoppingBag,
  MapPin,
  Fuel,
  Compass,
  Search,
  Navigation,
  X,
  Utensils,
  Building,
  Coffee,
  Pill,
  User2,
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
  
  @keyframes dropdownFade {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-dropdown { animation: dropdownFade 0.2s ease-out forwards; }

  /* New Marker Animation */
  .marker-bounce { animation: markerBounce 0.3s ease-out; }
  @keyframes markerBounce {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }
`;

function RecenterMap({ position, isUserInteracting, setIsUserInteracting }) {
  const map = useMap();
  useMapEvents({
    dragstart: () => setIsUserInteracting(true),
    zoomstart: () => setIsUserInteracting(true),
    movestart: () => {
      if (!isUserInteracting) setIsUserInteracting(true);
    },
  });
  useEffect(() => {
    if (position && !isUserInteracting) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, isUserInteracting, map]);
  return null;
}

function RoutingMachine({ start, end }) {
  const map = useMap();
  const routingControlRef = useRef(null);

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
    }).addTo(map);

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        const instance = routingControlRef.current;
        try {
          instance.setWaypoints([]);
          const container = instance.getContainer();
          if (container && container.parentNode)
            container.parentNode.removeChild(container);
          if (map) map.removeControl(instance);
        } catch (e) {
          console.debug("Routing cleanup handled.");
        } finally {
          routingControlRef.current = null;
        }
      }
    };
  }, [map, start, end]);
  return null;
}

// --- NEW MODERN MARKER SHAPE ---
const createCustomIcon = (category, isSelected) => {
  const configs = {
    Shopping: { icon: ShoppingBag, color: "bg-blue-600" },
    "Tourist Spot": { icon: Compass, color: "bg-emerald-500" },
    "Gas Station": { icon: Fuel, color: "bg-orange-500" },
    Food: { icon: Utensils, color: "bg-rose-500" },
    Malls: { icon: Building, color: "bg-indigo-600" },
    Cafe: { icon: Coffee, color: "bg-amber-700" },
    Pharmacy: { icon: Pill, color: "bg-green-500" },
    User: { icon: User2, color: "bg-blue-500" },
    Default: { icon: MapPin, color: "bg-slate-500" },
  };

  const config = configs[category] || configs.Default;
  const Icon = config.icon;

  const iconHtml = renderToString(
    <div
      className={`relative flex items-center justify-center transition-all duration-300 ${isSelected ? "scale-125 z-[1000]" : "marker-bounce"}`}
    >
      {/* The Modern "Squircle" Shape */}
      <div
        className={`w-10 h-10 ${config.color} rounded-2xl shadow-lg border-2 border-white flex items-center justify-center transform rotate-45`}
      >
        <div className="transform -rotate-45 text-white">
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      {/* Bottom Point / Shadow */}
      <div className="absolute -bottom-1 w-2 h-2 bg-white rotate-45 border-b border-r border-slate-200" />
    </div>,
  );

  return L.divIcon({
    html: iconHtml,
    className: "bg-transparent",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export default function IntuitiveMap() {
  const [userPos, setUserPos] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeDestination, setRouteDestination] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const markerRefs = useRef({});

  const cleanCategories = useMemo(() => {
    const cats = geoData.Categories.filter((c) => c !== "All");
    return ["All", ...cats];
  }, []);

  const filteredLocations = useMemo(() => {
    return geoData.locations.filter((loc) => {
      const matchesCategory =
        activeCategory === "All" || loc.category === activeCategory;
      const matchesSearch = loc.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
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

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setIsUserInteracting(true);
    setIsSearchFocused(false);
    setSearchQuery(loc.name);
    setTimeout(() => markerRefs.current[loc.id]?.openPopup(), 200);
  };

  if (!userPos)
    return (
      <div className="h-screen w-full flex items-center justify-center font-bold text-slate-400">
        Locating...
      </div>
    );

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-slate-50 font-sans"
      onClick={() => setIsSearchFocused(false)}
    >
      <style>{mobileStyles}</style>

      {/* SEARCH & DROPDOWN */}
      <div
        className="absolute top-4 left-4 right-4 z-[1005] sm:w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search size={18} className="text-slate-400 ml-2" />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search Panabo..."
              className="w-full p-2 text-sm outline-none bg-transparent"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
            />
            {searchQuery && (
              <X
                size={16}
                className="text-slate-400 mr-2 cursor-pointer"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>

          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-dropdown">
              <div className="p-3 border-b border-slate-50">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {cleanCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        if (!searchQuery) setIsSearchFocused(false);
                      }}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                        activeCategory === cat
                          ? "bg-blue-600 text-white"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAP */}
      <MapContainer
        center={userPos}
        zoom={15}
        className="h-full w-full z-0"
        zoomControl={false}
        closePopupOnClick={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <RecenterMap
          position={userPos}
          isUserInteracting={isUserInteracting}
          setIsUserInteracting={setIsUserInteracting}
        />
        <Marker position={userPos} icon={createCustomIcon("User", false)} />

        {filteredLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={loc.coords}
            icon={createCustomIcon(
              loc.category,
              selectedLocation?.id === loc.id,
            )}
            ref={(el) => (markerRefs.current[loc.id] = el)}
            eventHandlers={{
              click: () => {
                setSelectedLocation(loc);
                setIsUserInteracting(true);
                setIsSearchFocused(false);
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="p-4 flex flex-col gap-3">
                <h3 className="text-lg font-black">{loc.name}</h3>
                <p className="text-[11px] text-slate-400">{loc.address}</p>
                <button
                  onClick={() => setRouteDestination(loc.coords)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase"
                >
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {routeDestination && (
          <RoutingMachine start={userPos} end={routeDestination} />
        )}
      </MapContainer>

      {/* FLOATING ACTIONS */}
      <div className="absolute z-[1000] right-6 bottom-10 flex flex-col gap-3">
        {routeDestination && (
          <button
            onClick={() => setRouteDestination(null)}
            className="bg-white p-4 rounded-full shadow-2xl text-red-500 border border-red-100 transition-all"
          >
            <X size={24} strokeWidth={3} />
          </button>
        )}
        {isUserInteracting && (
          <button
            onClick={() => setIsUserInteracting(false)}
            className="bg-white p-4 rounded-full shadow-2xl text-blue-600 transition-all"
          >
            <Navigation size={24} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
