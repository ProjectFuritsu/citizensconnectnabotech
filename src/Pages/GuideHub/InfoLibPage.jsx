import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchX,
} from "lucide-react";
import { InfoDataService } from "../../Services/InfoLibServices/InfoLibService";
import Custom_InfoCard from "../../Widgets/custom_info_card";
import Custom_DynamicIcon from "../../Widgets/custom_DynamicIcon";
import { categoryIcons, formatDate, pluralize } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import JsonLd from "../../SEO/JsonLd";
import { breadcrumbSchema } from "../../SEO/schema";

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
];

export default function InfoLibPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const meta = InfoDataService.getLibraryMeta();
  const allGuides = InfoDataService.getAllPrograms();
  const allTags = useMemo(() => InfoDataService.getAllTags(), []);
  const categories = useMemo(() => InfoDataService.getCategories(), []);

  // The selected category lives in the URL (/info?tag=Health),
  // so home page links and shared links open the right filter
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get("tag");
  const selectedTag = allTags.includes(tagParam) ? tagParam : null;

  usePageMeta(
    selectedTag
      ? {
          title: `${selectedTag} Guides`,
          description: `${pluralize(allGuides.filter((g) => g.tags.includes(selectedTag)).length, "guide")} to ${selectedTag.toLowerCase()} services in Panabo City, with requirements, fees and processing times.`,
        }
      : {
          title: "Guide Hub: City Service Guides",
          description: `Browse ${allGuides.length} guides to Panabo City services. Compare requirements, fees and processing times for ${categories.map((c) => c.name.toLowerCase()).join(", ")} services.`,
        },
  );

  const lastUpdated = useMemo(() => {
    const newest = allGuides.reduce(
      (latest, guide) => (guide.date > latest ? guide.date : latest),
      "",
    );
    return newest ? formatDate(newest) : meta.last_updated;
  }, [allGuides, meta.last_updated]);

  // Start at the top when arriving from another page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Filter and Sort Logic
  const filteredGuides = useMemo(() => {
    let results = InfoDataService.searchPrograms(searchQuery);

    if (selectedTag) {
      results = results.filter((doc) => doc.tags.includes(selectedTag));
    }

    return [...results].sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return new Date(b.date) - new Date(a.date);
    });
  }, [searchQuery, sortBy, selectedTag]);

  // 2. Slice data for Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredGuides.length / ITEMS_PER_PAGE),
  );
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedGuides = filteredGuides.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // 3. Handlers: any filter change goes back to page 1
  const selectTag = (tag) => {
    setSearchParams(tag ? { tag } : {}, { replace: true });
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    selectTag(null);
  };

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    document
      .getElementById("guide-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasFilters = searchQuery || selectedTag || sortBy !== "newest";

  // A tag from the URL that isn't a primary category still gets a chip
  const extraTag =
    selectedTag && !categories.some((c) => c.name === selectedTag)
      ? selectedTag
      : null;

  return (
    <div className="bg-canvas font-sans text-ink pb-20 md:pb-24">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guide Hub", path: "/info" },
        ])}
      />

      {/* Header */}
      <section className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted"
          >
            <Link to="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <span aria-current="page" className="font-medium text-ink">
              Guide Hub
            </span>
          </nav>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Guide Hub
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl text-pretty">
            Requirements, fees and step-by-step processes for{" "}
            {allGuides.length} city services in Panabo City.
          </p>
          <p className="mt-2 text-sm text-subtle">
            Updated {lastUpdated} by {meta.author}
          </p>

          {/* Search */}
          <div className="relative mt-8 max-w-2xl">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search guides"
              placeholder="Search guides, e.g. senior citizen ID"
              className="w-full rounded-control border border-line bg-surface py-3.5 pl-12 pr-4 text-ink shadow-sm placeholder:text-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600 transition-shadow"
            />
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section
        id="guide-results"
        className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-12 scroll-mt-24"
      >
        {/* Category filter: scrolls sideways on phones, wraps on wider screens */}
        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0">
          <div
            role="group"
            aria-label="Filter by category"
            className="flex w-max gap-2 md:w-auto md:flex-wrap"
          >
            <CategoryChip
              label="All guides"
              count={allGuides.length}
              active={!selectedTag}
              onClick={() => selectTag(null)}
            />
            {categories.map((category) => (
              <CategoryChip
                key={category.name}
                label={category.name}
                count={category.count}
                icon={categoryIcons[category.name]}
                active={selectedTag === category.name}
                onClick={() => selectTag(category.name)}
              />
            ))}
            {extraTag && (
              <CategoryChip
                label={extraTag}
                count={
                  allGuides.filter((g) => g.tags.includes(extraTag)).length
                }
                active
                onClick={() => selectTag(null)}
              />
            )}
          </div>
        </div>

        {/* Results bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm text-muted" aria-live="polite">
            {totalPages > 1 ? (
              <>
                Showing{" "}
                <span className="font-semibold text-ink tabular-nums">
                  {startIndex + 1}–{startIndex + paginatedGuides.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-ink tabular-nums">
                  {filteredGuides.length}
                </span>{" "}
                guides
              </>
            ) : (
              <span className="font-semibold text-ink tabular-nums">
                {pluralize(filteredGuides.length, "guide")}
              </span>
            )}
            {selectedTag && (
              <>
                {" "}
                in <span className="font-medium text-ink">{selectedTag}</span>
              </>
            )}
            {searchQuery && (
              <>
                {" "}
                for “<span className="font-medium text-ink">{searchQuery}</span>”
              </>
            )}
          </p>

          <div className="flex items-center gap-4">
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Reset
              </button>
            )}
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort
              <span className="relative">
                <select
                  value={sortBy}
                  onChange={handleSort}
                  className="cursor-pointer appearance-none rounded-control border border-line bg-surface py-2 pl-3 pr-9 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
                />
              </span>
            </label>
          </div>
        </div>

        {/* Data Grid / Empty State */}
        {paginatedGuides.length > 0 ? (
          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedGuides.map((doc) => (
              <li key={doc.id}>
                <Custom_InfoCard doc={doc} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
            <SearchX size={32} className="text-subtle" />
            <h2 className="mt-4 font-semibold">No guides match your search</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Try a different word or category, or browse all{" "}
              {allGuides.length} guides.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-control border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6"
          >
            <PageButton
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </PageButton>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => goToPage(pageNum)}
                    aria-current={pageNum === page ? "page" : undefined}
                    className={`h-9 min-w-9 rounded-control px-2 text-sm font-medium tabular-nums transition-colors ${
                      pageNum === page
                        ? "bg-brand-50 text-brand-700"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}
            </div>

            <PageButton
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
              <ChevronRight size={16} />
            </PageButton>
          </nav>
        )}
      </section>
    </div>
  );
}

// Sub-components for cleaner code
const CategoryChip = ({ label, count, icon, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-brand-200 bg-brand-50 text-brand-700"
        : "border-line bg-surface text-ink-soft hover:border-brand-300 hover:text-brand-700"
    }`}
  >
    {icon && (
      <Custom_DynamicIcon
        name={icon}
        className={`h-4 w-4 ${active ? "text-brand-600" : "text-subtle"}`}
      />
    )}
    {label}
    <span
      className={`text-xs tabular-nums ${active ? "text-brand-600" : "text-subtle"}`}
    >
      {count}
    </span>
  </button>
);

const PageButton = ({ disabled, onClick, children }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="inline-flex items-center gap-1 rounded-control border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-soft hover:border-brand-300 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-40 transition-colors"
  >
    {children}
  </button>
);
