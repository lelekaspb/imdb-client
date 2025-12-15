import { useEffect, useState } from "react";
import { useNotes } from "./useNotes";
import {
  searchTitlePosterByName,
  searchPersonByName,
} from "../api/tmdbClient";



export default function useUserNotesWithMedia() {
  const { notes, loading, update, remove } = useNotes();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!notes.length) {
      setItems([]);
      return;
    }

    let cancelled = false;

    async function enrich() {
      const enriched = await Promise.all(
        notes.map(async (note) => {
          if (note.tconst && note.titleName) {
            const poster = await searchTitlePosterByName(
              note.titleName
            );

            return {
              type: "title",
              key: note.noteId,
              note,
              media: {
                tconst: note.tconst,
                title: note.titleName,
                posterUrl: poster,
              },
            };
          }

          if (note.nconst && note.personName) {
            const image = await searchPersonByName(
              note.personName
            );

            return {
              type: "person",
              key: note.noteId,
              note,
              media: {
                nconst: note.nconst,
                name: note.personName,
                profileUrl: image,
              },
            };
          }

          return null;
        })
      );

      if (!cancelled) {
        setItems(enriched.filter(Boolean));
      }
    }

    enrich();
    return () => {
      cancelled = true;
    };
  }, [notes]);

  return {
    loading,
    items,
    update,
    remove,
  };
}
