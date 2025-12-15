import tmdbClient from "../api/tmdbClient";

/**
 * Enrich cast / crew members with:
 * - profile image (TMDB)
 * - normalized job (crew)
 *
 * @param {Array} cast
 * @param {Object} opts
 * @returns {Promise<Array>}
 */
export default async function enrichCastWithImages(cast = [], opts = {}) {
  const size = opts.size || "w185";
  const concurrency = opts.concurrency || 8;

  if (!Array.isArray(cast) || cast.length === 0) return [];

  const result = new Array(cast.length);
  let index = 0;

  async function worker() {
    while (true) {
      const i = index++;
      if (i >= cast.length) return;

      const member = cast[i] || {};
      const enriched = { ...member };

      /* -------------------------------
         Normalize job / department
      -------------------------------- */
      if (!enriched.job) {
        enriched.job =
          enriched.job ??
          enriched.known_for_department ??
          enriched.department ??
          enriched.category ??
          null;
      }

      /* -------------------------------
         Preserve existing images
      -------------------------------- */
      const hasProfileUrl =
        enriched.profileUrl && String(enriched.profileUrl).trim() !== "";
      const hasProfilePath =
        enriched.profile_path &&
        String(enriched.profile_path).trim() !== "";

      if (hasProfileUrl || hasProfilePath) {
        result[i] = enriched;
        continue;
      }

      /* -------------------------------
         TMDB lookup via IMDb nconst
      -------------------------------- */
      const nconst =
        enriched.nconst || enriched.NConst || enriched.nConst || null;

      if (nconst && tmdbClient?.findPersonByImdb) {
        try {
          const tmdbId = await tmdbClient.findPersonByImdb(nconst);
          if (tmdbId) {
            const url =
              await tmdbClient.getPersonProfileByTmdbId(tmdbId, size);
            if (url) {
              enriched.profileUrl = url;
              enriched.tmdbId = tmdbId;
              result[i] = enriched;
              continue;
            }
          }
        } catch {
          // fall through
        }
      }

      /* -------------------------------
         TMDB lookup by name
      -------------------------------- */
      const name =
        enriched.primaryName ||
        enriched.name ||
        enriched.displayName ||
        null;

      if (name) {
        try {
          const url = await tmdbClient.searchPersonByName(name, size);
          if (url) {
            enriched.profileUrl = url;
            result[i] = enriched;
            continue;
          }
        } catch {
          
        }
      }

      result[i] = enriched;
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, cast.length) },
    worker
  );

  await Promise.all(workers);
  return result;
}
