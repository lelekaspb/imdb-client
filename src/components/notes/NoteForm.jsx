import { useState } from "react";

export default function NoteForm({ initialValue = "", onSave, onCancel }) {
  const [content, setContent] = useState(initialValue);

  function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    onSave(content.trim());
    setContent("");
  }

  return (
    <form onSubmit={submit} className="note-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note…"
      />
      <div className="actions">
        <button type="submit">Save</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
