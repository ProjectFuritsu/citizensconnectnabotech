import { useState, useMemo, useEffect } from "react";
// Import all icons to allow dynamic selection by string name
import * as LucideIcons from "lucide-react";
import { InfoDataService } from "../../Services/InfoLibServices/InfoLibService";
import { Link } from "react-router-dom";
import Custom_PageLayout from "../../Widgets/custom_PageLayout";
import Custom_InfoCard from "../../Widgets/custom_info_card";

/**
 * Helper component to render Lucide icons dynamically based on JSON string
 */

// Store the Component reference, not the JSX element
const secondaryResources = [
  {
    title: "Historical Archives",
    desc: "Explore digitised records of city history and development.",
    linkText: "Browse Archives",
    icon: LucideIcons.History,
    color: "text-blue-500",
  },
  {
    title: "Legal Definitions",
    desc: "Glossary of common legal terms used in public documents.",
    linkText: "View Glossary",
    icon: LucideIcons.Scale,
    color: "text-blue-500",
  },
  {
    title: "FAQ Database",
    desc: "Answers to frequently asked questions about city life.",
    linkText: "Read FAQs",
    icon: LucideIcons.MessageSquareQuote,
    color: "text-blue-500",
  },
];

export default function InfoLibPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Published Date");
  const [selectedTag, setSelectedTag] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const meta = InfoDataService.getLibraryMeta();
  const allTags = useMemo(() => InfoDataService.getAllTags(), []);

  // 1. Filter and Sort Logic
  const filteredPamphlets = useMemo(() => {
    let results = InfoDataService.searchPrograms(searchQuery);

    if (selectedTag) {
      results = results.filter((doc) => doc.tags.includes(selectedTag));
    }

    return [...results].sort((a, b) => {
      if (sortBy === "A-Z") return a.title.localeCompare(b.title);
      if (sortBy === "Z-A") return b.title.localeCompare(a.title);
      if (sortBy === "Published Date") {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });
  }, [searchQuery, sortBy, selectedTag]);

  // 2. Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, selectedTag]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Use "auto" for an instant jump
    });
  }, [currentPage]);

  // 3. Slice data for Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPamphlets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPamphlets, currentPage]);

  const totalPages = Math.ceil(filteredPamphlets.length / itemsPerPage);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setSortBy("Published Date");
    setCurrentPage(1);
  };

  return (
    <Custom_PageLayout>
      {/* Hero / Search Section */}
      <section className="relative w-full py-12 px-4 bg-linear-to-b from-blue-50/50 to-white flex flex-col items-center text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full"></div>
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-3xl w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Panabo City Guide Hub
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Access a library of public knowledge of guidelines. Updated as of{" "}
            <span className="font-semibold text-slate-700">
              {meta.last_updated}
            </span>{" "}
            by {meta.author}.
          </p>

          <div className="relative group w-full max-w-2xl mx-auto">
            <div className="flex items-center w-full bg-white rounded-xl border border-slate-200 p-1.5 transition-all duration-300 ease-in-out shadow-sm group-focus-within:shadow-xl group-focus-within:border-blue-200">
              <div className="pl-4 pr-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <LucideIcons.Search size={18} strokeWidth={2.5} />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="How can I help you?"
                className="flex-1 py-3 bg-transparent border-none outline-none text-[15px] text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-400">Popular Topics:</span>
            <div className="flex gap-3">
              {["Legal", "Health", "Scholarship"].map((topic, index, array) => (
                <div key={topic} className="flex items-center gap-3">
                  <button
                    onClick={() => setSearchQuery(topic)}
                    className="text-blue-400 hover:text-blue-500 hover:underline transition-colors"
                  >
                    {topic}
                  </button>
                  {index < array.length - 1 && (
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-blue-500 text-sm font-medium hover:text-blue-600"
              >
                Reset
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="mb-8">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer"
                >
                  <option>Published Date</option>
                  <option>A-Z</option>
                  <option>Z-A</option>
                </select>
                <LucideIcons.ChevronDown
                  size={16}
                  className="absolute right-3 top-2.5 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Dynamic Tag Filter */}
            <div className="mb-8">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              {searchQuery ? "Search Results" : "How to Apply"}
            </h1>
            {searchQuery && (
              <p className="text-sm text-slate-400 animate-in fade-in duration-300">
                Showing {filteredPamphlets.length} results
              </p>
            )}
          </div>

          {/* Data Grid / Empty State */}
          {paginatedData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((doc) => (
                <Custom_InfoCard doc={doc} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <LucideIcons.Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No results found
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">
                We couldn't find any documents matching "{searchQuery}".
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-600 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredPamphlets.length > itemsPerPage && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <LucideIcons.ChevronLeft size={18} />
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <LucideIcons.ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer Resources */}
      {/* <section className="w-full bg-[#EBF4FF] py-16 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {secondaryResources.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 transition-transform group-hover:-translate-y-1 text-[#3B82F6]">
                  <IconComponent className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed mb-5">
                  {item.desc}
                </p>
                <a
                  href="#"
                  className="text-[#3B82F6] text-sm font-semibold hover:underline decoration-2 underline-offset-4 transition-colors"
                >
                  {item.linkText}
                </a>
              </div>
            );
          })}
        </div>
      </section> */}
    </Custom_PageLayout>
  );
}
