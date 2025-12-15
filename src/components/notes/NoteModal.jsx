import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import { useNotes } from "../../hooks/useNotes";
import { toast } from "react-toastify";

export default function NoteModal({ show, onClose, target }) {
  const { create } = useNotes(target);
  const [content, setContent] = useState("");

  async function save() {
    if (!content.trim()) return;
    await create(content);
    toast.success("Note saved to your profile");
    setContent("");
    onClose();
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add note</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Write a personal note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>Save note</Button>
      </Modal.Footer>
    </Modal>
  );
}
