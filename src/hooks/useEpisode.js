import { useEffect, useState } from "react";
import backend from "../api/backendClient";

export default function useEpisode(tconst) {
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tconst) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    backend
      .get(`/Movies/${tconst}`)
      .then((data) => {
        if (!mounted) return;
        setEpisode(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [tconst]);

  return { episode, loading, error };
}
