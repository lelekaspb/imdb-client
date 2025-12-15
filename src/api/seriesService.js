import backend from "./backendClient";

const DEFAULT_PAGE_SIZE = 20;

const buildQs = (obj = {}) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    qs.set(k, String(v));
  }
  return qs.toString();
};

const seriesService = {
  listSeries({ page = 1, pageSize = DEFAULT_PAGE_SIZE, genre, sort } = {}) {
    const qs = buildQs({ page, pageSize, type: "series", genre, sort });
    return backend.get(`/Movies?${qs}`);
  },

  getSeries(tconst) {
    if (!tconst) {
      return Promise.reject(new Error("Missing series tconst"));
    }
    return backend.get(`/Movies/${tconst}`);
  },

  getEpisode(tconst) {
    if (!tconst) {
      return Promise.reject(new Error("Missing episode tconst"));
    }
    return backend.get(`/Episodes/${tconst}`);
  },
};

export default seriesService;
