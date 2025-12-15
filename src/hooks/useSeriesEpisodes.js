import { useEffect, useState } from "react";
import backend from "../api/backendClient";

export default function useSeriesEpisodes(seriesId) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!seriesId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    backend
       .get(`/Movies/${seriesId}/episodes`)
       .then((res) => {
        if (!mounted) return;

        // PagedResult or raw array safety
        const items = Array.isArray(res)
          ? res
          : res?.items ?? res?.Items ?? [];

        setEpisodes(items);
      })
      .catch((err) => mounted && setError(err))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [seriesId]);

  return { episodes, loading, error };
}
