import { useEffect, useState } from "react";
import { userService } from "../api/userService";
import { useAuth } from "../context/AuthContext";

export default function useUserSearchHistory({ page, pageSize }) {
  const { token } = useAuth();

  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    userService
      .getSearchHistory({ page, pageSize })
      .then((res) => {
        if (!mounted) return;

        if (Array.isArray(res.data)) {
          setHistory(res.data);
          setTotal(res.data.length);
          return;
        }

        if (Array.isArray(res.data?.data)) {
          setHistory(res.data.data);
          setTotal(res.data.total ?? res.data.data.length);
          return;
        }

        if (Array.isArray(res.data?.items)) {
          setHistory(res.data.items);
          setTotal(res.data.totalCount ?? res.data.items.length);
          return;
        }

        // Fallback
        setHistory([]);
        setTotal(0);
      })
      .catch((e) => {
        if (!mounted) return;
        console.error("SearchHistory error:", e);
        setError(e.message ?? "Failed to load search history");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [token, page, pageSize]);

  return {
    history,
    total,
    loading,
    error,
  };
}
