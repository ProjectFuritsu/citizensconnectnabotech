import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { NewsService } from "../../Services/NewsServices/NewsService";
import Custom_SideWidget from "../../Widgets/custom_sideWidget";
import Custom_PageLayout from "../../Widgets/custom_PageLayout";
import { usePageMeta } from "../../SEO/usePageMeta";

export default function NewsPage() {
  usePageMeta({
    title: "News & Updates",
    description: "Announcements and updates for Panabo City residents.",
  });

  const scrollRef = useRef(null);

  // 1. Get the data from your service
  const allNews = NewsService.getAllPrograms();
  const allTags = NewsService.getAllTags();

  // 2. State for filtering
  const [activeTag, setActiveTag] = useState("All");

  // 3. Filter AND Sort news by Date (Latest First)
  const sortedAndFilteredNews = useMemo(() => {
    // First, filter by tag
    let filtered =
      activeTag === "All"
        ? [...allNews]
        : allNews.filter((item) => item.tags && item.tags.includes(activeTag));

    // Second, sort by date (Newest first)
    // This assumes your data has a 'date' property (e.g., "2024-05-20")
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeTag, allNews]);

  // 4. Extract the single latest for Hero, the rest for the grid
  const heroArticle = sortedAndFilteredNews[0];
  const gridArticles = sortedAndFilteredNews.slice(1);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <Custom_PageLayout>
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              What happen in Panabo City
            </h1>
            <p className="text-gray-500 text-sm">
              Official updates from the city.
            </p>
          </div>

          {/* Tag Scroller Container */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full border border-gray-200 bg-white shadow-sm active:scale-95 transition-transform"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="relative flex-1 max-w-75 sm:max-w-md md:max-w-xs lg:max-w-md overflow-hidden">
              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scroll-smooth no-scrollbar py-1 px-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <button
                  onClick={() => setActiveTag("All")}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeTag === "All"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  All Updates
                </button>

                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      activeTag === tag
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full border border-gray-200 bg-white shadow-sm active:scale-95 transition-transform"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          <main className="col-span-12 lg:col-span-8 space-y-8">
            {/* --- HERO CARD (Latest Article) --- */}
            {heroArticle && (
              <Link
                to={`/news-updates/${heroArticle.id}`}
                className="relative block h-96 rounded-xl overflow-hidden shadow-lg group"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={
                      Array.isArray(heroArticle["img-src"])
                        ? heroArticle["img-src"][0]?.url
                        : heroArticle.image || "/hero-placeholder.jpg"
                    }
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    alt={heroArticle.title}
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 w-fit rounded mb-2 uppercase">
                    {/* Display first tag or fallback */}
                    {Array.isArray(heroArticle.tags)
                      ? heroArticle.tags[0]
                      : heroArticle.tags || "Latest News"}
                  </span>
                  <h2 className="text-3xl text-white font-bold group-hover:underline decoration-blue-400">
                    {heroArticle.title.toUpperCase()}
                  </h2>
                  <p className="text-gray-300 text-sm mt-2">
                    {heroArticle.date &&
                      new Date(heroArticle.date).toLocaleDateString(undefined, {
                        dateStyle: "long",
                      })}
                  </p>
                </div>
              </Link>
            )}

            {/* --- GRID (Remaining Articles) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gridArticles.map((item) => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  // Pass first tag if it's an array
                  category={Array.isArray(item.tags) ? item.tags[0] : item.tags}
                  title={item.title}
                  image={item["img-src"]}
                  date={item.date}
                />
              ))}
            </div>

            {sortedAndFilteredNews.length === 0 && (
              <p className="text-center py-10 text-gray-500">
                No news found for this category.
              </p>
            )}
          </main>

          {/* Sidebar */}
          <Custom_SideWidget />
        </div>
      </div>
    </Custom_PageLayout>
  );
}

const NewsCard = ({ id, category, title, image, date }) => {
  const imageUrl = Array.isArray(image)
    ? image[0]?.url
    : image?.url || image || "/api/placeholder/400/250";

  return (
    <Link to={`/news-updates/${id}`} className="block group">
      <div className="bg-white h-full rounded-xl overflow-hidden shadow-sm border group-hover:shadow-md transition-all flex flex-col">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4 text-left flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">
              {category}
            </span>
            <span className="text-gray-400 text-[10px] uppercase">
              {date && new Date(date).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-bold text-lg group-hover:text-blue-600 line-clamp-2">
            {title.toUpperCase()}
          </h3>
          <p className="text-blue-500 text-sm mt-auto pt-4 font-medium">
            Read Full Report →
          </p>
        </div>
      </div>
    </Link>
  );
};
