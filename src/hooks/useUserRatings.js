import { useEffect, useState } from "react";
import backend from "../api/backendClient";

export default function useUserRatings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    backend
      .get("/Ratings/user")
      .then(res => {
        if (!mounted) return;

        // backend returns a plain array
        if (Array.isArray(res)) {
          setItems(res);
        } else {
          console.warn("Unexpected ratings response:", res);
          setItems([]);
        }
      })
      .catch(e => {
        if (mounted) setError(e.message || String(e));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading, error };
}
