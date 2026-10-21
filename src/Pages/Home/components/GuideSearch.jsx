import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { ChevronRight, Search } from "lucide-react";
import { GuideService } from "../../../Services/GuideService";
import { formatDate, pluralize } from "../../../Theme/display";

// Home page search: finds guides by title, tag or id while you type, and
// forgives small typos (Fuse.js). Results open the guide's page.
const MIN_LENGTH = 2;

export default function GuideSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const fuse = useMemo(() => new Fuse(GuideService.guides, { keys: ["title", "tags", "id"], threshold: 0.4 }), []);
  const results = query.trim().length >= MIN_LENGTH ? fuse.search(query.trim()).map((r) => r.item) : [];

  // Close on a click outside or Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const showPanel = open && query.trim().length >= MIN_LENGTH;

  return (
    <div className="relative" ref={rootRef}>
      <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        aria-label="Search guides and city services"
        placeholder="Search guides and city services"
        className="w-full rounded-control border border-line bg-surface py-4 pl-12 pr-4 text-ink shadow-sm placeholder:text-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
      />

      {showPanel && (
        // A floating layer, so it's allowed a shadow (DESIGN.md)
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-card border border-line bg-surface shadow-lg">
          {results.length > 0 ? (
            <>
              <p className="border-b border-line bg-canvas px-4 py-2 text-xs text-muted" aria-live="polite">
                {pluralize(results.length, "guide")}
              </p>
              <ul className="max-h-96 overflow-y-auto divide-y divide-line">
                {results.map((guide) => (
                  <li key={guide.id}>
                    <Link
                      to={`/info/${guide.id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="group flex items-center gap-4 px-4 py-3 hover:bg-canvas transition-colors"
                    >
                      <span className="min-w-0 grow">
                        <span className="block text-xs text-muted">
                          <span className="font-medium text-brand-600">{guide.tags[0]}</span> · {formatDate(guide.date)}
                        </span>
                        <span className="mt-0.5 block font-medium text-ink group-hover:text-brand-700">{guide.title}</span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-faint group-hover:text-brand-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted" aria-live="polite">
              No guides match “{query.trim()}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
