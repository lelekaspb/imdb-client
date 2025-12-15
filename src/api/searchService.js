import backend from "./backendClient";

export const searchService = {
  async search(query) {
    if (!query || !query.trim()) return [];

    const encoded = encodeURIComponent(query.trim());
    const hasToken = Boolean(localStorage.getItem("authToken"));

    const endpoint = hasToken
      ? `/Search/structured?query=${encoded}`
      : `/Search/best-match?query=${encoded}`;

    return backend.get(endpoint, { silent: !hasToken });
  },
};
