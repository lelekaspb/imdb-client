import { useEffect, useState } from "react";
import movieService from "../api/movieService";
import { enrichTitleWithImage } from "../utils/enrichTitle";
import { getTypeFromTitleType } from "../pages/listPageHelpers";

function normalizeList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.movies)) return payload.movies;

  if (
    payload.data &&
    (Array.isArray(payload.data.items) ||
      Array.isArray(payload.data.results))
  ) {
    return payload.data.items || payload.data.results || [];
  }

  try {
    const arr = Object.keys(payload)
      .map((k) => payload[k])
      .filter((v) => Array.isArray(v));
    if (arr.length) return arr[0];
  } catch {}

  return [];
}

export default function useMoviesList(params = {}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(null);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setList([]);

    (async () => {
      try {
        const payload = await movieService.list(params);
        const arr = normalizeList(payload);

        const enriched = await Promise.all(
          (arr || []).map((m) =>
            enrichTitleWithImage(m, {
              requireImage: Boolean(params.requireImage),
            })
          )
        );

        if (!mounted) return;

        const cleaned = enriched.filter(Boolean);

        // ✅ Home-only filtering (opt-in)
        const filtered = params.excludeEpisodes
          ? cleaned.filter(
              (item) =>
                getTypeFromTitleType(
                  item?.titleType ??
                  item?.TitleType ??
                  item?.type
                ) !== "episode"
            )
          : cleaned;

        setList(filtered);

        const totalFromAPI =
          payload.total ??
          payload.totalItems ??
          payload.totalCount ??
          payload.totalResults ??
          null;

        setTotal(totalFromAPI);

        const tp =
          payload.totalPages ??
          (totalFromAPI
            ? Math.ceil(totalFromAPI / (params.pageSize ?? 20))
            : null);

        setTotalPages(tp);
      } catch (err) {
        console.error("useMoviesList ERROR:", err);
        if (!mounted) return;
        setList([]);
        setTotal(null);
        setTotalPages(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(params)]);

  return { list, loading, totalPages, total };
}
