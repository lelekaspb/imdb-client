// src/hooks/useNotes.js
import { useEffect, useState } from "react";
import { noteService } from "../api/noteService";

export function useNotes({ tconst, nconst } = {}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      let data;
      if (tconst) {
        data = await noteService.getMovieNotes(tconst);
      } else if (nconst) {
        data = await noteService.getPersonNotes(nconst);
      } else {
        data = await noteService.getMyNotes();
      }
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }

  async function create(content) {
    if (tconst) {
      await noteService.createForMovie(tconst, content);
    } else if (nconst) {
      await noteService.createForPerson(nconst, content);
    }
    await load();
  }

  async function update(noteId, content) {
    await noteService.update(noteId, content);
    await load();
  }

  async function remove(noteId) {
    await noteService.remove(noteId);
    setNotes(prev => prev.filter(n => n.noteId !== noteId));
  }

  useEffect(() => {
    load();
  }, [tconst, nconst]);

  return { notes, loading, create, update, remove };
}
