import { useEffect, useState, useCallback } from "react";
import { bookmarkService } from "../api/bookmarkService";

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.bookmarks)) return response.bookmarks;
  return [];
}

export default function useBookmarks({ tconst = null, nconst = null }) {
  const [bookmark, setBookmark] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = Boolean(localStorage.getItem("authToken"));

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    bookmarkService.getAll().then(res => {
      const list = normalizeList(res);

      const found = list.find(b =>
        (tconst && b.tconst === tconst) ||
        (nconst && b.nconst === nconst)
      );

      setBookmark(found ?? null);
      setLoading(false);
    }).catch(() => {
      setBookmark(null);
      setLoading(false);
    });
  }, [tconst, nconst, isLoggedIn]);

  const addBookmark = useCallback(async () => {
    const result = tconst
      ? await bookmarkService.addTitle(tconst)
      : await bookmarkService.addPerson(nconst);

    setBookmark(result);
  }, [tconst, nconst]);

  const removeBookmark = useCallback(async () => {
    if (!bookmark?.bookmarkId) return;
    await bookmarkService.remove(bookmark.bookmarkId);
    setBookmark(null);
  }, [bookmark]);

  return {
    isLoggedIn,
    isBookmarked: Boolean(bookmark),
    addBookmark,
    removeBookmark,
    loading,
  };
}
