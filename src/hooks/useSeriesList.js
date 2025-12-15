import { useEffect, useState } from "react";
import seriesService from "../api/seriesService";
import { enrichTitleWithImage } from "../utils/enrichTitle";

function normalizeList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.series)) return payload.series;

  if (payload.data && (Array.isArray(payload.data.items) || Array.isArray(payload.data.results))) {
    return payload.data.items || payload.data.results || [];
  }

  try {
    const arr = Object.keys(payload).map(k => payload[k]).filter(v => Array.isArray(v));
    if (arr.length) return arr[0];
  } catch {}

  return [];
}

export default function useSeriesList(params = {}) {
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
        const payload = await seriesService.listSeries(params);
        const arr = normalizeList(payload);

        const enriched = await Promise.all(
          (arr || []).map(s => enrichTitleWithImage(s))
        );

        if (!mounted) return;

        setList(enriched);

        const totalFromAPI =
          payload.total ?? payload.totalItems ?? payload.totalCount ?? payload.totalResults ?? null;
        setTotal(totalFromAPI);

        const tp =
          payload.totalPages ??
          (totalFromAPI ? Math.ceil(totalFromAPI / (params.pageSize ?? 20)) : null);

        setTotalPages(tp);
      } catch (err) {
        console.error("useSeriesList ERROR:", err);
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
