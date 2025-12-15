import { useEffect, useState } from "react";
import tmdbClient from "../api/tmdbClient";

export default function usePersonImages(nconst) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!nconst || !tmdbClient?.findPersonByImdb) return;

      try {
        setLoading(true);

        const tmdbId = await tmdbClient.findPersonByImdb(nconst);
        if (!tmdbId || !tmdbClient.getPersonImages) return;

        const res = await tmdbClient.getPersonImages(tmdbId);
        const profiles = res?.profiles ?? [];

        if (mounted) {
          setImages(
            profiles
              .filter(p => p.file_path)
              .map(p => `https://image.tmdb.org/t/p/w300${p.file_path}`)
          );
        }
      } catch (e) {
        console.warn("Person images failed to load", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [nconst]);

  return { images, loading };
}
