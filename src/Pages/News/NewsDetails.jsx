import { useParams, Link } from "react-router-dom";
import { NewsService } from "../../Services/NewsServices/NewsService";
import { useEffect, useState } from "react";

export default function NewsDetails() {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Use "auto" for an instant jump
    });
  }, [id]);

  // 1. Fetch the specific article (ID is already a string from useParams)
  const article = NewsService.getProgramById(id);

  // 2. Get related news (Exclude current article using string comparison)
  const relatedNews = NewsService.getAllPrograms()
    .filter((item) => item.id !== id)
    .slice(0, 3);

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold">Article not found</h2>
        <Link
          to="/news-updates"
          className="text-blue-600 mt-4 inline-block underline"
        >
          Return to Newsroom
        </Link>
      </div>
    );
  }

  // Helper for safe tag rendering
  const tags = Array.isArray(article.tags) ? article.tags : [];

  // Image PAgination
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = Array.isArray(article["img-src"])
    ? article["img-src"]
    : [{ url: article["img-src"], caption: article.title }];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto p-6">
        <Link
          to="/news-updates"
          className="text-gray-500 hover:text-blue-600 mb-6 inline-flex items-center text-sm transition"
        >
          <span className="mr-2">←</span> Back to Newsroom
        </Link>

        <div className="grid grid-cols-12 gap-8">
          <article className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border p-8">
            <header className="mb-8">
              {tags.length > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                  {tags[0]}
                </span>
              )}

              <h1 className="text-4xl font-extrabold mt-4 leading-tight text-gray-900">
                {article.title.charAt(0).toUpperCase() +
                  article.title.slice(1).toLowerCase()}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-500 mt-6 text-sm border-t border-b py-3">
                <p>Published: {article.date || "none"}</p>
                <p>Author: {article.author}</p>
                <p>Category: {tags.length > 0 ? tags.join(", ") : "General"}</p>
              </div>
            </header>

            <section className="mb-12 max-w-4xl mx-auto">
              <div className="relative group">
                {/* Main Image Container */}
                <div className="overflow-hidden rounded-sm bg-gray-100 aspect-3/2 flex items-center justify-center">
                  <img
                    key={currentIndex} // Adding a key triggers a re-render/animation when index changes
                    src={images[currentIndex].url}
                    alt={`Gallery image ${currentIndex + 1}`}
                    className="w-full h-full object-cover animate-in fade-in duration-500"
                  />
                </div>

                {/* Navigation Controls (Only show if more than 1 image) */}
                {images.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 hover:bg-white transition-all shadow-md"
                      aria-label="Previous image"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 hover:bg-white transition-all shadow-md"
                      aria-label="Next image"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Progress Indicator (Top Right) */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 text-[10px] font-mono tracking-tighter rounded">
                      {currentIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Caption Area */}
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between items-start gap-4">
                <figcaption className="text-[11px] font-sans uppercase tracking-widest text-gray-500 leading-relaxed border-l border-gray-200 pl-4 max-w-2xl">
                  {images[currentIndex].caption || article.title}
                </figcaption>

                {/* Dot Indicators */}
                {images.length > 1 && (
                  <div className="flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 transition-all duration-300 ${
                          i === currentIndex
                            ? "w-6 bg-black"
                            : "w-1.5 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed"></div>
            <div
              className="text-gray-600 mb-6"
              dangerouslySetInnerHTML={{ __html: article.desc }}
            />

            <div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between group hover:bg-gray-100 transition-colors duration-300">
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Minimalist Icon */}
                <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Official Source
                  </span>
                  <a
                    href={article.sources}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors truncate font-medium"
                  >
                    {article.sources}
                  </a>
                </div>
              </div>

              {/* External Link Indicator */}
              <svg
                className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-500">
                Share
              </h3>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded">
                  f
                </button>
                <button className="flex-1 bg-sky-400 text-white py-2 rounded">
                  t
                </button>
                <button className="flex-1 bg-blue-800 text-white py-2 rounded">
                  in
                </button>
              </div>
            </div>

            {/* Related News with String ID Comparison */}
            {/* Related News with String ID Comparison */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold mb-4 text-gray-900">Related News</h3>
              <div className="space-y-4">
                {relatedNews.map((news) => {
                  // Extract the first image URL specifically for THIS related news item
                  const firstImageUrl = Array.isArray(news["img-src"])
                    ? news["img-src"][0].url
                    : news["img-src"];

                  return (
                    <Link
                      key={news.id}
                      to={`/news-updates/${news.id}`}
                      className="flex gap-3 group"
                    >
                      <img
                        src={firstImageUrl}
                        className="w-16 h-16 rounded object-cover shrink-0 bg-gray-100"
                        alt=""
                      />
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">
                          {Array.isArray(news.tags) ? news.tags[0] : "News"}
                        </p>
                        <p className="text-xs font-bold leading-tight group-hover:text-blue-600 transition line-clamp-2">
                          {news.title}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
