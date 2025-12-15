import { useEffect, useMemo, useState } from "react";
import { searchService } from "../api/searchService";
import movieService from "../api/movieService";
import seriesService from "../api/seriesService";
import { searchTitlePosterByName } from "../api/tmdbClient";

const PAGE_SIZE = 20;
const TMDB_ENRICH_LIMIT = 8;

/**
 * Normalize raw search hit into minimal safe shape
 */
function normalizeSearchHit(hit) {
  return {
    tconst: hit.tconst ?? hit.Tconst ?? null,
    primaryTitle:
      hit.primaryTitle ??
      hit.PrimaryTitle ??
      hit.title ??
      "Untitled",
    titleType: hit.titleType ?? hit.Type ?? null,
    posterUrl: hit.posterUrl ?? null,
  };
}

function isSeriesType(type) {
  const t = String(type || "").toLowerCase();
  return t === "tvseries" || t === "tvminiseries" || t === "series";
}

function isEpisodeType(type) {
  const t = String(type || "").toLowerCase();
  return t === "episode" || t === "tvepisode";
}

export default function useSearchResults(query) {
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!query || !query.trim()) {
      setAllResults([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    setPage(1);

    (async () => {
      try {
        const hits = await searchService.search(query);

        if (!Array.isArray(hits) || hits.length === 0) {
          if (mounted) setAllResults([]);
          return;
        }

        // Search defines polymorphic truth (even if incomplete)
        const base = hits
          .map(normalizeSearchHit)
          .filter(x => x.tconst);

        const isLoggedIn = Boolean(localStorage.getItem("authToken"));

        /* =====================================================
           ANONYMOUS USERS — posters only
        ===================================================== */
        if (!isLoggedIn) {
          const toEnrich = base.slice(0, TMDB_ENRICH_LIMIT);

          const enriched = await Promise.all(
            toEnrich.map(async item => {
              if (item.posterUrl) return item;
              const posterUrl = await searchTitlePosterByName(item.primaryTitle);
              return posterUrl ? { ...item, posterUrl } : item;
            })
          );

          if (mounted) {
            setAllResults(
              base.map((item, i) =>
                i < enriched.length ? enriched[i] : item
              )
            );
          }
          return;
        }

        /* =====================================================
           LOGGED-IN USERS — POLYMORPHIC HYDRATION
        ===================================================== */

        const hydrated = await Promise.all(
          base.map(async item => {
            try {
              // If search already knows the type, respect it
              if (item.titleType) {
                if (isEpisodeType(item.titleType)) {
                  const ep = await seriesService.getEpisode(item.tconst);
                  return { ...item, ...ep, titleType: "episode" };
                }

                if (isSeriesType(item.titleType)) {
                  const s = await seriesService.getSeries(item.tconst);
                  return { ...item, ...s, titleType: "series" };
                }

                const m = await movieService.getMovie(item.tconst);
                return { ...item, ...m, titleType: "movie" };
              }

              // UNKNOWN TYPE — PROBE BACKEND (REQUIRED)
              // Try episode
              try {
                const ep = await seriesService.getEpisode(item.tconst);
                return { ...item, ...ep, titleType: "episode" };
              } catch {}

              // Try series
              try {
                const s = await seriesService.getSeries(item.tconst);
                return { ...item, ...s, titleType: "series" };
              } catch {}

              // Fallback: movie
              const m = await movieService.getMovie(item.tconst);
              return { ...item, ...m, titleType: "movie" };
            } catch {
              
              return item;
            }
          })
        );

        if (mounted) setAllResults(hydrated);
      } catch (e) {
        if (mounted) setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [query]);

  /* =====================================================
     Pagination 
  ===================================================== */
  const totalPages = Math.ceil(allResults.length / PAGE_SIZE);

  const pagedResults = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allResults.slice(start, start + PAGE_SIZE);
  }, [allResults, page]);

  return {
    results: pagedResults,
    loading,
    error,
    page,
    setPage,
    totalPages,
  };
}
