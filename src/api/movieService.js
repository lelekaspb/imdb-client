import backend from "./backendClient";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Build query string safely
 */
const buildQs = (obj = {}) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  return qs.toString();
};

export const movieService = {
  // -------------------------
  // Single movie / series / episode
  // -------------------------
  getMovie(tconst) {
    if (!tconst) throw new Error("getMovie requires tconst");
    return backend.get(`/Movies/${tconst}`);
  },

  // -------------------------
  // Cast
  // -------------------------
  getCast(tconst) {
    if (!tconst) throw new Error("getCast requires tconst");
    return backend.get(`/Movies/${tconst}/cast`);
  },

  // -------------------------
  // Search (LIGHTWEIGHT)
  // Backend returns:
  // [{ tconst, primaryTitle, matchCount }]
  // -------------------------
  searchBestMatch(query) {
    if (!query || !query.trim()) return Promise.resolve([]);

    const qs = buildQs({ query });
    return backend.get(`/Search/best-match?${qs}`);
  },

  // -------------------------
  // Movies list (browse pages)
  // -------------------------
  list({
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    type,
    genre,
    sort,
  } = {}) {
    const qs = buildQs({ page, pageSize, type, genre, sort });
    return backend.get(`/Movies?${qs}`);
  },

  // -------------------------
  // Hydrate search results
  // Turns tconst[] → full movie objects
  // -------------------------
  async getMoviesByTconsts(tconsts = []) {
    if (!Array.isArray(tconsts) || tconsts.length === 0) return [];

    // De-duplicate and guard
    const unique = [...new Set(tconsts)].filter(Boolean);

    const requests = unique.map(async (tconst) => {
      try {
        return await backend.get(`/Movies/${tconst}`);
      } catch (err) {
        console.warn(`[movieService] Failed to hydrate ${tconst}`, err.message);
        return null;
      }
    });

    const results = await Promise.all(requests);
    return results.filter(Boolean);
  },
};

export default movieService;
