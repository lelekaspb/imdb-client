import { useState } from "react";
import { Spinner, Button, Form, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useNotes } from "../../hooks/useNotes";

export default function UserNotes() {
  const { notes, loading, update, remove } = useNotes();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const navigate = useNavigate();

  if (loading) return <Spinner />;

  if (!notes.length) {
    return <p className="text-muted">You haven’t written any notes yet.</p>;
  }

  function startEdit(note) {
    setEditingId(note.noteId);
    setDraft(note.content);
  }

  async function saveEdit(noteId) {
    if (!draft.trim()) return;
    await update(noteId, draft);
    setEditingId(null);
    setDraft("");
  }

  return (
    <>
      <h5 className="mb-3">Your notes</h5>

      {notes.map(note => {
        const isTitle = !!note.tconst;
        const label = isTitle ? note.titleName : note.personName;
        const link = isTitle
          ? `/movie/${note.tconst}`
          : `/person/${note.nconst}`;

        return (
          <div key={note.noteId} className="border rounded p-3 mb-3">
            <div className="d-flex justify-content-between mb-2">
              <Badge
                bg="secondary"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(link)}
              >
                {label ?? "Unknown"}
              </Badge>

              <small className="text-muted">
                {note.updatedAt
                  ? `Updated ${new Date(note.updatedAt).toLocaleString()}`
                  : `Created ${new Date(note.notedAt).toLocaleString()}`}
              </small>
            </div>

            {editingId === note.noteId ? (
              <>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="mb-2"
                />

                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => saveEdit(note.noteId)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2">{note.content}</p>

                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => startEdit(note)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => remove(note.noteId)}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
