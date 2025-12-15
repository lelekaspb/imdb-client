import { useNotes } from "../../hooks/useNotes";
import { Button, Spinner } from "react-bootstrap";
import NoteForm from "./NoteForm";
import NoteItem from "./NoteItem";

export default function NotesSection({ tconst, nconst }) {
  const { notes, loading, create, update, remove } = useNotes({
    tconst,
    nconst,
  });

  if (loading) return <Spinner />;

  return (
    <section className="mb-4">
      <h5 className="mb-3">Your notes</h5>

      <NoteForm onSave={create} />

      {notes.length === 0 && (
        <p className="text-muted">No notes yet.</p>
      )}

      {notes.map(note => (
        <NoteItem
          key={note.noteId}
          note={note}
          onUpdate={update}
          onDelete={remove}
        />
      ))}
    </section>
  );
}
