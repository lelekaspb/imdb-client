import backend from "./backendClient";

export const userService = {
  getProfile: () => backend.get("/Auth/me"),

  getBookmarks: () => backend.get("/Bookmarks"),

  getRatings: () => backend.get("/Ratings/user"),

  getSearchHistory: ({ page, pageSize }) =>
    backend.get("/SearchHistory", {
      params: { page, pageSize },
    }),
};
