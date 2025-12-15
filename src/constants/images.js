/**
 * Central image constants & placeholder generators
 */

export const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

/* =========================
   PLACEHOLDER GENERATOR
========================= */
function toBase64(str) {
  return window.btoa(
    unescape(encodeURIComponent(str))
  );
}

function svgPlaceholder({
  label = "",
  icon = "",
  width = 300,
  height = 450,
  bgTop = "#111827",
  bgBottom = "#1f2933",
  fg = "#9ca3af",
}) {
  const text = label || icon;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bgTop}" />
      <stop offset="100%" stop-color="${bgBottom}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    font-size="48"
    fill="${fg}"
    opacity="0.85"
  >
    ${text}
  </text>
</svg>`;

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}


/* =========================
   PERSON PLACEHOLDERS
========================= */

export function personPlaceholder(name = "", size = "card") {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join("");

  return svgPlaceholder({
    label: initials,
    icon: "🎭",
    width: size === "detail" ? 500 : 300,
    height: size === "detail" ? 700 : 450,
  });
}

/* =========================
   TITLE PLACEHOLDERS
========================= */

export function titlePlaceholder(title = "", size = "card") {
  return svgPlaceholder({
    label: "",
    icon: "🎬",
    width: size === "detail" ? 500 : 300,
    height: size === "detail" ? 750 : 450,
    bgBottom: "#020617",
  });
}

/* =========================
   GENERIC / FALLBACK
========================= */

export const GENERIC_PLACEHOLDER = svgPlaceholder({
  icon: "❓",
});

/* =========================
   IMAGE RESOLVER (IMPORTANT)
========================= */

/**
 * Resolve image in priority order:
 * 1. Full URL
 * 2. TMDB partial path
 * 3. Placeholder
 */
export function resolveImage({
  src,
  tmdbPath,
  type = "person",
  name = "",
  size = "card",
  tmdbSize = "w185",
}) {
  if (src) return src;

  if (tmdbPath) {
    return tmdbPath.startsWith("/")
      ? `${TMDB_IMG_BASE}/${tmdbSize}${tmdbPath}`
      : tmdbPath;
  }

  if (type === "person") {
    return personPlaceholder(name, size);
  }

  if (type === "title") {
    return titlePlaceholder(name, size);
  }

  return GENERIC_PLACEHOLDER;
}
