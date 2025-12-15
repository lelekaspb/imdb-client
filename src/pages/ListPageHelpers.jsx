/**
 * Normalizes a raw titleType value to one of:
 * "movie" | "series" | "episode"
 */
export function getTypeFromTitleType(raw) {
    if (!raw) return "movie";
  
    const type = String(raw).toLowerCase();
  
    if (type.includes("episode")) return "episode";
    if (type.includes("series") || type.includes("miniseries")) return "series";
  
    return "movie";
  }
  
  /**
   * Resolves the correct route path for a movie/series/episode item.
   */
  export function getCardPath(item) {
    const id =
      item?.Tconst ??
      item?.tconst ??
      item?.id ??
      null;
  
    if (!id) return "/";
  
    const rawType =
      item?.TitleType ??
      item?.titleType ??
      item?.title_type ??
      item?.type ??
      "";
  
    const type = getTypeFromTitleType(rawType);
  
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
  