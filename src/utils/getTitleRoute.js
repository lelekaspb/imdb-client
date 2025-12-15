/**
 * Resolves the correct route path for a title based on its type.
 *
 * @param {Object} title
 * @returns {string} route path
 */
export function getTitleRoute(title) {
  const tconst = title?.tconst;
  if (!tconst) return "/";

  const type = String(title.titleType || "").toLowerCase();

  if (type === "movie") return `/movie/${tconst}`;
  if (type === "episode") return `/episode/${tconst}`;

  // Treat all TV-like types as series
  if (
    type === "series" ||
    type === "tvseries" ||
    type === "tvminiseries"
  ) {
    return `/series/${tconst}`;
  }

  // Safe fallback
  return `/movie/${tconst}`;
}
