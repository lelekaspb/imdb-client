import { Spinner, Alert, Card, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserNotesWithMedia from "../../hooks/useUserNotesWithMedia";
import MovieCard from "../movies/MovieCard";
import PersonCard from "../people/PersonCard";

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
    await update(noteId, draft);
    setEditingId(null);
    setDraft("");
  }

  return (
    <>
      {/* ---------- TITLES ---------- */}
      {titleNotes.length > 0 && (
        <>
          <h5 className="mb-3">Titles</h5>
          <div className="d-flex flex-wrap gap-3 mb-4">
            {titleNotes.map(({ note, media }) => (
              <Card key={note.noteId} style={{ width: 220 }}>
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

                <Card.Body className="pt-2">
                  {editingId === note.noteId ? (
                    <>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={draft}
                        onChange={(e) =>
                          setDraft(e.target.value)
                        }
                        className="mb-2"
                      />
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
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="small mb-2">
                        {note.content}
                      </p>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="w-100 mb-1"
                        onClick={() => {
                          setEditingId(note.noteId);
                          setDraft(note.content);
                        }}
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
                    </>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ---------- PEOPLE ---------- */}
      {personNotes.length > 0 && (
        <>
          <h5 className="mb-3">People</h5>
          <div className="d-flex flex-wrap gap-3">
            {personNotes.map(({ note, media }) => (
              <Card key={note.noteId} style={{ width: 220 }}>
                <PersonCard
                  person={{
                    nconst: media.nconst,
                    primaryName: media.name,
                    profileUrl: media.profileUrl,
                  }}
                />

                <Card.Body className="pt-2">
                  <p className="small mb-2">
                    {note.content}
                  </p>

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="w-100 mb-1"
                    onClick={() => {
                      setEditingId(note.noteId);
                      setDraft(note.content);
                    }}
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
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
