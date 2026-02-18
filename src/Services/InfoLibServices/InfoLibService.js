import infoData from '../../Data/InfoLib/InfoData.json';

/**
 * Service to manage library and program information
 */
export const InfoDataService = {
  // Get the complete list of pamphlets/programs
  getAllPrograms: () => {
    return infoData.data || [];
  },

  // Get metadata like version and last updated date
  getLibraryMeta: () => {
    return infoData.metadata;
  },

  // Find a specific program by its ID (useful for detail pages)
  getProgramById: (id) => {
    return infoData.data.find((item) => item.id === id);
  },

  // Filter programs based on a search term (checks title and tags)
  searchPrograms: (query) => {
    const term = query.toLowerCase();
    return infoData.data.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  },

  // Get all unique tags across all programs (useful for filter buttons)
  getAllTags: () => {
    const tags = infoData.data.flatMap((item) => item.tags);
    return [...new Set(tags)];
  }
  
};