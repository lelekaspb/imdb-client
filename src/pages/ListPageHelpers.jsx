/**
 * Normalizes a raw titleType value to one of:
 * "movie" | "series" | "episode"
 *
 * IMPORTANT:
 * - Handles tvSeries explicitly
 * - Infers series if episode/season metadata exists
 */
export function getTypeFromTitleType(raw, item = null) {
  // 1. Explicit titleType handling
  if (raw) {
    const type = String(raw).toLowerCase();

    if (type === "episode" || type.includes("episode")) return "episode";
    if (
      type === "tvseries" ||
      type === "tvminiseries" ||
      type.includes("series")
    ) {
      return "series";
    }
  }

  // 2. Shape-based inference (CRITICAL FIX)
  if (item) {
    if (
      item.parentSeriesId ||
      item.seasonNumber !== undefined ||
      item.episodeNumber !== undefined ||
      item.numberOfSeasons !== undefined
    ) {
      return "series";
    }
  }

  // 3. Safe default
  return "movie";
}

/**
 * Resolves the correct route path for a movie/series/episode item.
 */
export function getCardPath(item) {
  const id =
    item?.tconst ??
    item?.Tconst ??
    item?.id ??
    null;

  if (!id) return "/";

  const rawType =
    item?.titleType ??
    item?.TitleType ??
    item?.type ??
    null;

  const type = getTypeFromTitleType(rawType, item);

  if (type === "series") return `/series/${id}`;
  if (type === "episode") return `/episode/${id}`;

  return `/movie/${id}`;
}

/**
 * Builds a compressed pagination array with ellipses.
 */
export function buildPageButtons(currentPage, totalPages) {
  if (!totalPages) {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  const visible = [];

  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      Math.abs(p - currentPage) <= 2
    ) {
      visible.push(p);
    }
  }

  const compressed = [];
  visible.forEach((p, i) => {
    if (i > 0 && p !== visible[i - 1] + 1) {
      compressed.push("ellipsis");
    }
    compressed.push(p);
  });

  return compressed;
}
