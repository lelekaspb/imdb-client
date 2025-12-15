import { Spinner, Card, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserNotesWithMedia from "../../hooks/useUserNotesWithMedia";
import MovieCard from "../movies/MovieCard";
import PersonCard from "../people/PersonCard";

const CARD_HEIGHT = 420;
const MEDIA_HEIGHT = 280;

export default function UserNotesPanel() {
  const { items, loading, update, remove } =
    useUserNotesWithMedia();

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (!items.length) return <p>No notes yet.</p>;

  const titleNotes = items.filter(i => i.type === "title");
  const personNotes = items.filter(i => i.type === "person");

  async function save(noteId) {
    if (!draft.trim()) return;
    await update(noteId, draft);

    cancelEdit();
  }

  function startEdit(note) {
    setEditingId(note.noteId);
    setDraft(note.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }

  function renderNoteBody(note) {
    const isEditing = editingId === note.noteId;

    return (
      <Card.Body className="d-flex flex-column">
        {isEditing ? (
          <>
            <Form.Control
              as="textarea"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mb-2"
              autoFocus
            />

            <div className="mt-auto">
              <Button
                size="sm"
                className="w-100 mb-1"
                onClick={() => save(note.noteId)}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                className="w-100"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="small mb-2 clamp-3">
              {note.content}
            </p>

            <div className="mt-auto">
              <Button
                size="sm"
                variant="outline-primary"
                className="w-100 mb-1"
                onClick={() => startEdit(note)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                className="w-100"
                onClick={() => remove(note.noteId)}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    );
  }

  function renderGrid(children) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {children}
      </div>
    );
  }

  function renderMedia(children) {
    return (
      <div
        style={{
          height: MEDIA_HEIGHT,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <>
      {/* ---------- TITLES ---------- */}
      {titleNotes.length > 0 && (
        <>
          <h5 className="mb-3">Titles</h5>
          {renderGrid(
            titleNotes.map(({ note, media }) => (
              <Card
                key={note.noteId}
                style={{
                  height: CARD_HEIGHT,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {renderMedia(
                  <MovieCard
                    movie={{
                      tconst: media.tconst,
                      title: media.title,
                      posterUrl: media.posterUrl,
                    }}
                    onClick={() =>
                      navigate(`/movie/${media.tconst}`)
                    }
                  />
                )}

                {renderNoteBody(note)}
              </Card>
            ))
          )}
        </>
      )}

      {/* ---------- PEOPLE ---------- */}
      {personNotes.length > 0 && (
        <>
          <h5 className="mb-3 mt-4">People</h5>
          {renderGrid(
            personNotes.map(({ note, media }) => (
              <Card
                key={note.noteId}
                style={{
                  height: CARD_HEIGHT,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {renderMedia(
                  <PersonCard
                    person={{
                      nconst: media.nconst,
                      primaryName: media.name,
                      profileUrl: media.profileUrl,
                    }}
                  />
                )}

                {renderNoteBody(note)}
              </Card>
            ))
          )}
        </>
      )}
    </>
  );
}
