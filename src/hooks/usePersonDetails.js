import { useEffect, useState } from "react";
import personService from "../api/personService";

export default function usePersonDetails(key) {
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(Boolean(key));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!key) {
      setPerson(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const p = await personService.getPerson(key);
        if (!active) return;

        // fetch filmography/credits as best-effort
        const credits = await personService.getFilmography(key).catch(() => []);
        if (!active) return;

        // Ensure normalized shape with credits & knownForTitles
        const normalized = {
          ...(p || {}),
          knownForTitles: p?.knownForTitles ?? p?.knownFor ?? [],
          credits: Array.isArray(credits) ? credits : [],
        };

        setPerson(normalized);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [key]);

  return { person, loading, error };
}
