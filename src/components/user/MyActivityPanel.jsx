import { Card, Button, Form } from "react-bootstrap";
import { BookmarkPlus, BookmarkCheckFill } from "react-bootstrap-icons";
import { useState } from "react";
import NoteModal from "../notes/NoteModal";

export default function MyActivityPanel({
  isLoggedIn,
  isBookmarked,
  onBookmark,
  onUnbookmark,
  rating,
  onRate,
  noteTarget,
}) {
  const [showNoteModal, setShowNoteModal] = useState(false);

  if (!isLoggedIn) {
    return (
      <Card className="mt-3">
        <Card.Body>
          <Button
            variant="outline-secondary"
            className="w-100"
            href="/user/login"
          >
            Log in to interact
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-3 shadow-sm">
        <Card.Header className="fw-semibold bg-white">
          My activity
        </Card.Header>

        <Card.Body className="d-grid gap-2">
          <Button
            variant={isBookmarked ? "success" : "outline-primary"}
            onClick={isBookmarked ? onUnbookmark : onBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheckFill className="me-2" />
            ) : (
              <BookmarkPlus className="me-2" />
            )}
            {isBookmarked ? "Bookmarked" : "Add to watchlist"}
          </Button>

          {onRate && (
            <Form.Select
              value={rating ?? ""}
              onChange={(e) => onRate(Number(e.target.value))}
            >
              <option value="">Rate</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Form.Select>
          )}

          <Button
            variant="outline-secondary"
            onClick={() => setShowNoteModal(true)}
          >
            Add personal note
          </Button>
        </Card.Body>
      </Card>

      <NoteModal
        show={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        target={noteTarget}
      />
    </>
  );
}
