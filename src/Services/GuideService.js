import guideFile from "../Data/Guides/guides.json";

// Service guides for the Guide Hub, from src/Data/Guides/guides.json (see the
// README there). Each guide's first tag is its category.
const guides = guideFile.data ?? [];

export const GuideService = {
  guides,
  meta: guideFile.metadata,

  byId: (id) => guides.find((guide) => guide.id === id) ?? null,

  // Guides whose title or tags contain the words, e.g. "senior id"
  search: (query) => {
    const term = query.trim().toLowerCase();
    if (!term) return guides;
    return guides.filter(
      (guide) =>
        guide.title.toLowerCase().includes(term) ||
        guide.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
  },

  // Every tag used by any guide
  tags: [...new Set(guides.flatMap((guide) => guide.tags))],

  // Categories (each guide's first tag) with how many guides have the tag, largest first
  categories: [...new Set(guides.map((guide) => guide.tags[0]))]
    .map((name) => ({ name, count: guides.filter((guide) => guide.tags.includes(name)).length }))
    .sort((a, b) => b.count - a.count),

  // Date of the most recently updated guide (ISO dates compare as strings)
  lastUpdated: guides.reduce((latest, guide) => (guide.date > latest ? guide.date : latest), ""),
};
