import { useEffect, useState } from "react";
import { movieService } from "../api/movieService";
import tmdb from "../api/tmdbClient";

/**
 * Cleans backend values like:
 * "['Walter White']" -> "Walter White"
 */
function cleanValue(v) {
  if (!v) return "";
  return String(v).replace(/[\[\]']+/g, "").trim();
}

export default function useCast(id) {
  const [cast, setCast] = useState([]);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function load() {
      try {
        // ✅ This endpoint works for movies, series, and episodes
        const rawCast = await movieService.getCast(id);

        // --------------------
        // Consolidate by person (IMDb ID)
        // --------------------
        const castMap = new Map();

        rawCast.forEach((member) => {
          if (!member?.nconst) return;

          if (castMap.has(member.nconst)) {
            const existing = castMap.get(member.nconst);

            if (member.characterName?.trim()) {
              existing.characterNames.push(member.characterName);
            }

            if (member.job?.trim()) {
              existing.jobs.add(member.job.trim());
            }
          } else {
            castMap.set(member.nconst, {
              nconst: member.nconst,
              primaryName: member.primaryName ?? member.name ?? "Unknown",
              name: member.name ?? member.primaryName,
              characterNames: member.characterName?.trim()
                ? [member.characterName]
                : [],
              jobs: new Set(
                member.job?.trim() ? [member.job.trim()] : []
              ),
            });
          }
        });

        // --------------------
        // Normalize fields
        // --------------------
        const consolidated = Array.from(castMap.values()).map(
          (member) => {
            const characters = member.characterNames
              .map(cleanValue)
              .filter(Boolean)
              .filter((c, i, arr) => arr.indexOf(c) === i)
              .join(", ");

            const jobs = Array.from(member.jobs)
              .map(cleanValue)
              .filter(Boolean)
              .join(", ");

            return {
              ...member,
              allCharacters: characters,
              allJobs: jobs || (characters ? "Actor" : ""),
            };
          }
        );

        // --------------------
        // Resolve images via IMDb → TMDB
        // --------------------
        const withPhotos = await Promise.all(
          consolidated.map(async (member) => {
            try {
              const tmdbId = await tmdb.findPersonByImdb(
                member.nconst
              );

              let url = tmdbId
                ? await tmdb.getPersonProfileByTmdbId(
                    tmdbId,
                    "w185"
                  )
                : null;

              if (!url && member.primaryName) {
                url = await tmdb.searchPersonByName(
                  member.primaryName,
                  "w185"
                );
              }

              return {
                ...member,
                profileUrl: url || null,
              };
            } catch {
              return member;
            }
          })
        );

        if (mounted) setCast(withPhotos);
      } catch (err) {
        console.error("useCast error:", err);
        if (mounted) setCast([]);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  return cast;
}
