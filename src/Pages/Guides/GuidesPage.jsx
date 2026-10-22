import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Chip, ChipGroup, SearchInput, Select } from "../../Components/Controls";
import { Container, Page, PageHeader } from "../../Components/Page";
import { EmptyState } from "../../Components/States";
import { GuideService } from "../../Services/GuideService";
import { categoryIcons, formatDate, pluralize } from "../../Theme/display";
import { usePageMeta } from "../../SEO/usePageMeta";
import GuideCard from "./components/GuideCard";

// Guide Hub: every service guide, with search, category chips, sorting and
// pages of 12. Guides come from src/Data/Guides/guides.json.
const PAGE_SIZE = 12;

const SORTS = [
  { id: "newest", label: "Newest first", compare: (a, b) => new Date(b.date) - new Date(a.date) },
  { id: "az", label: "A–Z", compare: (a, b) => a.title.localeCompare(b.title) },
  { id: "za", label: "Z–A", compare: (a, b) => b.title.localeCompare(a.title) },
];

const { guides, categories, meta, tags, lastUpdated } = GuideService;
const countWithTag = (tag) => guides.filter((guide) => guide.tags.includes(tag)).length;

export default function GuidesPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // The category lives in the URL (/info?tag=Health), so shared links open it
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = tags.includes(searchParams.get("tag")) ? searchParams.get("tag") : null;

  usePageMeta(
    tag
      ? {
          title: `${tag} Guides`,
          description: `${pluralize(countWithTag(tag), "guide")} to ${tag.toLowerCase()} services in Panabo City, with requirements, fees and processing times.`,
        }
      : {
          title: "Guide Hub: City Service Guides",
          description: `Browse ${guides.length} guides to Panabo City services. Compare requirements, fees and processing times for ${categories.map((c) => c.name.toLowerCase()).join(", ")} services.`,
        },
  );

  const results = useMemo(
    () =>
      GuideService.search(query)
        .filter((guide) => !tag || guide.tags.includes(tag))
        .sort(SORTS.find((s) => s.id === sort).compare),
    [query, sort, tag],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageGuides = results.slice(start, start + PAGE_SIZE);

  // Any filter change goes back to page 1
  const selectTag = (next) => {
    setSearchParams(next ? { tag: next } : {}, { replace: true });
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setQuery("");
    setSort("newest");
    selectTag(null);
  };
  const goToPage = (n) => {
    setCurrentPage(n);
    document.getElementById("guide-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasFilters = query || tag || sort !== "newest";
  // A tag from the URL that isn't a main category still gets a chip
  const extraTag = tag && !categories.some((c) => c.name === tag) ? tag : null;

  return (
    <Page>
      <PageHeader
        title="Guide Hub"
        path="/info"
        intro={`Requirements, fees and step-by-step processes for ${guides.length} city services in Panabo City.`}
        note={`Updated ${lastUpdated ? formatDate(lastUpdated) : meta.last_updated}`}
      >
        <div className="mt-8 max-w-2xl">
          <SearchInput
            size="lg"
            value={query}
            onChange={(text) => {
              setQuery(text);
              setCurrentPage(1);
            }}
            label="Search guides"
            placeholder="Search guides, e.g. senior citizen ID"
          />
        </div>
      </PageHeader>

      <Container id="guide-results" className="pt-10 md:pt-12 scroll-mt-24">
        <ChipGroup label="Filter by category">
          <Chip active={!tag} count={guides.length} onClick={() => selectTag(null)}>
            All guides
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.name}
              icon={categoryIcons[category.name]}
              count={category.count}
              active={tag === category.name}
              onClick={() => selectTag(category.name)}
            >
              {category.name}
            </Chip>
          ))}
          {extraTag && (
            <Chip active count={countWithTag(extraTag)} onClick={() => selectTag(null)}>
              {extraTag}
            </Chip>
          )}
        </ChipGroup>

        {/* Results bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm text-muted" aria-live="polite">
            {totalPages > 1 ? (
              <>
                Showing{" "}
                <span className="font-semibold text-ink tabular-nums">
                  {start + 1}–{start + pageGuides.length}
                </span>{" "}
                of <span className="font-semibold text-ink tabular-nums">{results.length}</span> guides
              </>
            ) : (
              <span className="font-semibold text-ink tabular-nums">{pluralize(results.length, "guide")}</span>
            )}
            {tag && (
              <>
                {" "}
                in <span className="font-medium text-ink">{tag}</span>
              </>
            )}
            {query && (
              <>
                {" "}
                for “<span className="font-medium text-ink">{query}</span>”
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
            <Select
              label="Sort"
              value={sort}
              onChange={(id) => {
                setSort(id);
                setCurrentPage(1);
              }}
              options={SORTS}
            />
          </div>
        </div>

        {pageGuides.length > 0 ? (
          <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pageGuides.map((guide) => (
              <li key={guide.id}>
                <GuideCard doc={guide} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-6"
            title="No guides match your search"
            action={<Button onClick={resetFilters}>Clear filters</Button>}
          >
            Try a different word or category, or browse all {guides.length} guides.
          </EmptyState>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6"
          >
            <Button disabled={page === 1} onClick={() => goToPage(page - 1)}>
              <ChevronLeft size={16} />
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`h-9 min-w-9 rounded-control px-2 text-sm font-medium tabular-nums transition-colors ${
                    n === page ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <Button disabled={page === totalPages} onClick={() => goToPage(page + 1)}>
              Next
              <ChevronRight size={16} />
            </Button>
          </nav>
        )}
      </Container>
    </Page>
  );
}
