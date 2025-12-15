import backend from "./backendClient";
import tmdbClient from "./tmdbClient"; 

/**
 * personService — normalized API for fetching person details and filmography.
 * Uses backend endpoints when available and falls back to TMDB image lookup
 * for profile pictures (by IMDB nconst).
 */

async function getFromBackend(path) {
  return backend.get(path);
}

async function safeGetPerson(nconstOrId) {
  try {
    // main canonical backend endpoint
    const p = await getFromBackend(`/Person/${nconstOrId}`);
    return p;
  } catch (err) {
    // bubble 404-ish to caller but log other errors
    const msg = String(err || "").toLowerCase();
    if (!msg.includes("404") && !msg.includes("not found")) {
      console.debug("[personService] backend getPerson error", err);
    }
    return null;
  }
}

async function safeGetFilmography(nconstOrId) {
  try {
    const resp = await getFromBackend(`/Person/${nconstOrId}/filmography`);
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.filmography)) return resp.filmography;
    if (Array.isArray(resp.credits)) return resp.credits;
    return [];
  } catch (err) {
    const msg = String(err || "").toLowerCase();
    if (msg.includes("404") || msg.includes("not found")) return [];
    console.debug("[personService] filmography error", err);
    return [];
  }
}

function normalizeBackendPerson(p, key) {
  if (!p) return null;
  // prefer consistent naming: primaryName, name, nconst, id
  return {
    ...p,
    primaryName: p.primaryName ?? p.name ?? p.displayName ?? null,
    name: p.name ?? p.primaryName ?? p.displayName ?? null,
    nconst: p.nconst ?? p.id ?? p.nConst ?? null,
    id: p.id ?? (p.nconst ? p.nconst : null),
    profile_path: p.profile_path ?? p.tmdbProfilePath ?? null, // TMDB-style partial path
    profileUrl: p.profileUrl ?? p.photoUrl ?? p.profile_url ?? null, // full external URL
    knownForTitles: p.knownForTitles ?? p.knownFor ?? (p.known || []),
    raw: p,
  };
}

export const personService = {
  /**
   * Get a person and enrich with TMDB image when backend lacks an image.
   * Returns normalized object.
   */
  async getPerson(nconstOrId) {
    if (!nconstOrId) return null;

    // 1) try backend canonical endpoint
    let p = await safeGetPerson(nconstOrId);

    // 2) if backend didn't return (null) try listing endpoint and match
    if (!p) {
      try {
        const list = await getFromBackend(`/Person`);
        if (Array.isArray(list)) {
          p = list.find((x) => x.nconst === nconstOrId || String(x.id) === String(nconstOrId)) ?? null;
        }
      } catch (e) {
        // ignore: list endpoint might not exist or be heavy
      }
    }

    // 3) Normalize shape (or fallback minimal)
    let norm = normalizeBackendPerson(p, nconstOrId) || {
      id: nconstOrId,
      nconst: nconstOrId,
      primaryName: nconstOrId,
      name: nconstOrId,
      profile_path: null,
      profileUrl: null,
      knownForTitles: [],
      raw: null,
    };

    // 4) If we don't have a usable image, try TMDB lookup by imdb nconst
    const hasBackendImage = !!(norm.profile_path || norm.profileUrl);
    if (!hasBackendImage && typeof nconstOrId === "string" && nconstOrId.startsWith("nm") && tmdbClient && tmdbClient.findPersonByImdb) {
      try {
        // find the TMDB person id by IMDb nconst
        const tmdbId = await tmdbClient.findPersonByImdb(nconstOrId);
        if (tmdbId) {
          // retrieve profile image url (already cached by tmdbClient)
          const img = await tmdbClient.getPersonProfileByTmdbId(tmdbId, "w185");
          if (img) {
            // store tmdb info on normalized object
            norm.tmdbId = tmdbId;
            norm.tmdbProfilePath = img.startsWith("http") ? null : img; // img is full URL via client; keep both fields for compatibility
            // store profileUrl as the actual URL to display
            norm.profileUrl = img;
            // also keep profile_path null if TMDB returned full URL — UI will check profile_path then profileUrl
          } else {
            // try name-based TMDB search (fallback)
            const nameToSearch = norm.primaryName || norm.name;
            if (nameToSearch) {
              const searchImg = await tmdbClient.searchPersonByName(nameToSearch, "w185").catch(() => null);
              if (searchImg) {
                norm.profileUrl = searchImg;
                norm.tmdbProfilePath = null;
              }
            }
          }
        } else {
          // tmdbId not found — optionally try searching by name
          const nameToSearch = norm.primaryName || norm.name;
          if (nameToSearch) {
            const searchImg = await tmdbClient.searchPersonByName(nameToSearch, "w185").catch(() => null);
            if (searchImg) {
              norm.profileUrl = searchImg;
              norm.tmdbProfilePath = null;
            }
          }
        }
      } catch (e) {
        console.debug("[personService] TMDB enrichment failed", e);
        
      }
    }

    return norm;
  },

  /**
   * Get filmography/credits for a person (normalized to array)
   */
  async getFilmography(nconstOrId) {
    return safeGetFilmography(nconstOrId);
  },
};

export default personService;
