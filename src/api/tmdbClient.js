const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";
const KEY = import.meta.env.VITE_TMDB_API_KEY || "";

const CACHE_KEY = "tmdb_cache_v2";
const TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

/* =========================
   CACHE HELPERS
========================= */

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(c) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {}
}

function getCached(key) {
  const c = readCache();
  const entry = c[key];
  if (!entry) return null;

  if (Date.now() - entry.ts > (entry.ttl || TTL)) {
    delete c[key];
    writeCache(c);
    return null;
  }

  return entry.value;
}

function setCached(key, value, ttl = TTL) {
  if (value === null) return; 
  const c = readCache();
  c[key] = { value, ts: Date.now(), ttl };
  writeCache(c);
}

/* =========================
   NETWORK
========================= */

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("TMDB network error");
  return r.json();
}

/* =========================
   PEOPLE
========================= */

export async function findPersonByImdb(nconst) {
  if (!KEY || !nconst) return null;

  const cacheKey = `imdb:${nconst}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    const r = await fetchJson(
      `${TMDB_BASE}/find/${encodeURIComponent(
        nconst
      )}?external_source=imdb_id&api_key=${KEY}`
    );

    const id = r?.person_results?.[0]?.id || null;
    setCached(cacheKey, id);
    return id;
  } catch {
    return null;
  }
}

export async function getPersonProfileByTmdbId(tmdbId, size = "w185") {
  if (!KEY || !tmdbId) return null;

  const key = `tmdbPerson:${tmdbId}:${size}`;
  const cached = getCached(key);
  if (cached !== null) return cached;

  try {
    const r = await fetchJson(
      `${TMDB_BASE}/person/${tmdbId}/images?api_key=${KEY}`
    );

    const path = r?.profiles?.[0]?.file_path || null;
    const url = path ? `${TMDB_IMG}/${size}${path}` : null;

    setCached(key, url);
    return url;
  } catch {
    return null;
  }
}

export async function searchPersonByName(name, size = "w185") {
  if (!KEY || !name?.trim()) return null;

  const key = `tmdbPersonName:${name}:${size}`;
  const cached = getCached(key);
  if (cached !== null) return cached;

  try {
    const r = await fetchJson(
      `${TMDB_BASE}/search/person?api_key=${KEY}&query=${encodeURIComponent(
        name
      )}`
    );

    const path = r?.results?.[0]?.profile_path || null;
    const url = path ? `${TMDB_IMG}/${size}${path}` : null;

    setCached(key, url);
    return url;
  } catch {
    return null;
  }
}

/* =========================
   TITLES
========================= */

export async function searchTitlePosterByName(title, size = "w342") {
  if (!KEY || !title?.trim()) return null;

  const key = `tmdbTitle:${title}:${size}`;
  const cached = getCached(key);
  if (cached !== null) return cached;

  try {
    const r = await fetchJson(
      `${TMDB_BASE}/search/multi?api_key=${KEY}&query=${encodeURIComponent(
        title
      )}`
    );

    const first = r?.results?.find(
      x => x.media_type === "movie" || x.media_type === "tv"
    );

    const path = first?.poster_path || null;
    const url = path ? `${TMDB_IMG}/${size}${path}` : null;

    setCached(key, url);
    return url;
  } catch {
    return null;
  }
}

/* =========================
   PERSON IMAGE GALLERY
========================= */

export async function getPersonImages(tmdbPersonId) {
  if (!KEY || !tmdbPersonId) return null;

  const cacheKey = `tmdbPersonImages:${tmdbPersonId}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await fetchJson(
      `${TMDB_BASE}/person/${tmdbPersonId}/images?api_key=${KEY}`
    );

    setCached(cacheKey, res);
    return res;
  } catch {
    return null;
  }
}

/* =========================
   DEFAULT EXPORT
========================= */

export default {
  findPersonByImdb,
  getPersonProfileByTmdbId,
  searchPersonByName,
  searchTitlePosterByName,
  getPersonImages,
};
