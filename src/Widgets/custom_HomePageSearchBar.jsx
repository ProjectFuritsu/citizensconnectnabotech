import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { Search, ChevronRight } from "lucide-react";

// Assuming your JSON structure: { metadata: { slug: "/path" }, data: [...] }
import guides from "../Data/InfoLib/InfoData.json";
// import news from "../Data/News/NewsData.json";

export default function Custom_HomePageSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // 1. Combine all data into one searchable array using metadata for pathing
  const allData = useMemo(() => {
    const combined = [
      ...guides.data.map((item) => ({
        ...item,
        type: "Guide",
        // Constructs path: /info/NW-0126
        fullPath: `${guides.metadata.slug}/${item.id}`,
      })),
      // ...news.data.map((item) => ({
      //   ...item,
      //   type: "News",
      //   fullPath: `${news.metadata.slug}/${item.id}`,
      // })),
    ];
    return combined;
  }, []);

  // 2. Configure Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(allData, {
        keys: ["title", "tags", "id"],
        threshold: 0.4, // Balanced sensitivity
      }),
    [allData],
  );

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 2) {
      const searchResults = fuse.search(value);
      setResults(searchResults.map((result) => result.item));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleItemClick = (path) => {
    window.location.href = path;
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative max-w-2xl mx-auto mb-4" ref={searchRef}>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      <input
        type="text"
        value={query}
        onChange={handleSearch}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        placeholder="Search guides and city services"
      />

      {/* 3. Display Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute w-full mt-3 bg-white border border-slate-300 rounded-lg shadow-xl z-50 max-h-128 overflow-hidden flex flex-col">
          {/* Header: More formal and structured */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Search Results
            </span>
            <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-0.5 border border-slate-200 rounded-full">
              {results.length} Matches
            </span>
          </div>

          <div className="overflow-y-auto">
            {results.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => handleItemClick(item.fullPath)}
                className="group relative p-4 flex gap-5 items-start hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
              >
                {/* Status Indicator (Left Bar) */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Image Preview: Larger, more architectural shape */}
                {item["img-src"]?.[0]?.url && (
                  <div className="shrink-0 w-20 h-20 rounded border border-slate-200 bg-slate-100 overflow-hidden">
                    <img
                      src={item["img-src"][0].url}
                      alt=""
                      className="w-full h-full object-cover filter grayscale-20 group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                )}

                <div className="grow flex flex-col gap-1">
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-800 text-white font-bold uppercase tracking-tighter">
                      {item.type}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.date}
                    </span>
                  </div>

                  <h4 className="text-base font-serif font-semibold text-slate-900 leading-tight group-hover:text-blue-800 transition-colors">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <p className="text-xs text-slate-600 font-medium">
                      Filed under:{" "}
                      <span className="text-slate-900 underline decoration-slate-200 underline-offset-2">
                        {item.tags?.[0] || "General Publication"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="self-center">
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-800 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
          
        </div>
      )}

      {/* No Results State */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-8 text-center">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
