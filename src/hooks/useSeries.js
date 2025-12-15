import { useEffect, useState } from "react";
import seriesService from "../api/seriesService";
import { enrichTitleWithImage } from "../utils/enrichTitle";

export default function useSeries(id) {
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const s = await seriesService.getSeries(id);
        const enriched = await enrichTitleWithImage(s);
        if (mounted) setSeries(enriched);
      } catch (e) {
        if (mounted) setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  return { series, loading, error };
}
