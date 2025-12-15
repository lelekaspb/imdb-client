import { useState } from "react";
import { Button, Form } from "react-bootstrap";

export default function NoteItem({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);

  async function save() {
    if (!draft.trim()) return;
    await onUpdate(note.noteId, draft);
    setEditing(false);
  }

  return (
    <div className="border rounded p-3 mb-3">
      {editing ? (
        <>
          <Form.Control
            as="textarea"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mb-2"
          />

          <div className="d-flex gap-2">
            <Button size="sm" onClick={save}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => {
                setDraft(note.content);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2">{note.content}</p>

          <small className="text-muted d-block mb-2">
            {note.updatedAt
              ? `Updated ${new Date(note.updatedAt).toLocaleString()}`
              : `Created ${new Date(note.notedAt).toLocaleString()}`}
          </small>

          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => onDelete(note.noteId)}
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
