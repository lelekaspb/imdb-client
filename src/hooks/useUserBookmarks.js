import { useEffect, useState } from "react";
import { userService } from "../api/userService";
import backend from "../api/backendClient";
import { enrichPerson } from "../utils/enrichPerson";

export default function useUserBookmarks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const res = await userService.getBookmarks();
        const bookmarks = Array.isArray(res?.data) ? res.data : [];

        const requests = bookmarks.map(async (b) => {
          // ---------- TITLE ----------
          if (b.tconst) {
            const res = await backend.get(`/Movies/${b.tconst}`);
            return {
              movie: res?.data ?? res,
              bookmarkId: b.bookmarkId,
            };
          }

          // ---------- PERSON ----------
          if (b.nconst) {
            const res = await backend.get(`/Person/${b.nconst}`);
            const rawPerson = res?.data ?? res;

            // 🔑 THIS WAS MISSING
            const enrichedPerson = await enrichPerson(rawPerson);

            return {
              person: enrichedPerson,
              bookmarkId: b.bookmarkId,
            };
          }

          return null;
        });

        const resolved = (await Promise.all(requests)).filter(Boolean);

        if (mounted) {
          setItems(resolved);
        }
      } catch (e) {
        if (mounted) {
          setError(e?.message || String(e));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function removeBookmark(bookmarkId) {
    await backend.delete(`/Bookmarks/${bookmarkId}`);
    setItems((items) =>
      items.filter((i) => i.bookmarkId !== bookmarkId)
    );
  }

  return { items, loading, error, removeBookmark };
}
