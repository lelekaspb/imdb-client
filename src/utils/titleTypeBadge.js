export function getTitleTypeVariant(type) {
    const t = String(type || "").toLowerCase();
  
    if (t === "movie") return "primary";
    if (t === "tvseries" || t === "series") return "success";
    if (t === "tvminiseries") return "info";
    if (t === "tvepisode" || t === "episode") return "warning";
    if (t === "documentary") return "dark";
  
    return "secondary";
  }
  