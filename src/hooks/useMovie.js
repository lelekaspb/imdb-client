import { useEffect, useState } from "react";
import { movieService } from "../api/movieService";
import { enrichTitleWithImage } from "../utils/enrichTitle";

export default function useMovie(id) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await movieService.getMovie(id);
        const enriched = await enrichTitleWithImage(data);
        if (mounted) setMovie(enriched);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  return { movie, loading, error };
}
