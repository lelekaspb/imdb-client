/**
 * Formatting helpers for UI labels
 */

export function formatTitleType(value) {
    if (!value) return "";
  
    const v = String(value).toLowerCase();
  
    const map = {
      movie: "Movie",
      short: "Short",
      tvseries: "TV Series",
      tvminiseries: "TV Mini Series",
      tvepisode: "TV Episode",
      episode: "Episode",
      series: "Series",
      documentary: "Documentary",
    };
  
    return map[v] || v.replace(/^\w/, c => c.toUpperCase());
  }
  
  export function formatProfession(value) {
    if (!value) return "";
  
    return value
      .split(",")
      .map(p =>
        p
          .trim()
          .toLowerCase()
          .replace(/^\w/, c => c.toUpperCase())
      )
      .join(", ");
  }
  
  export function getPrimaryProfession(value) {
    if (!value) return "";
    return formatProfession(value).split(", ")[0];
  }
  