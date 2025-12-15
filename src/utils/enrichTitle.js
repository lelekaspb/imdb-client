import tmdbClient from "../api/tmdbClient";

/**
 * Enriches a title object with a poster image if missing.
 * The original object is not mutated.
 *
 * @param {Object} title
 * @param {Object} [opts]
 * @param {string} [opts.size="w342"] TMDB image size
 * @param {boolean} [opts.requireImage=false] If true, reject titles without images
 * @returns {Promise<Object|null>} Enriched title or null if rejected
 */
export async function enrichTitleWithImage(title, opts = {}) {
  const size = opts.size || "w342";
  const requireImage = opts.requireImage || false;

  if (!title) return null;

  const copy = { ...title };

  // Already has some form of image
  const hasPoster =
    copy.posterUrl ||
    copy.poster_path ||
    copy.poster ||
    copy.imageUrl ||
    copy.tmdbPoster;

  if (hasPoster) {
    return copy;
  }

  // Resolve title name
  const name =
    copy.primaryTitle ||
    copy.movieTitle ||
    copy.title ||
    copy.name ||
    null;

  if (!name || !tmdbClient?.searchTitlePosterByName) {
    return requireImage ? null : copy;
  }

  try {
    const url = await tmdbClient.searchTitlePosterByName(name, size);

    if (!url && requireImage) {
      // STRICT MODE: no image → no title
      return null;
    }

    if (url) {
      copy.posterUrl = url;
      copy.tmdbPoster = url;
    }
  } catch {
    if (requireImage) return null;
  }

  return copy;
}
