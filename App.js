// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const API = "http://localhost:5000/api/notes";

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(API);
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      alert("Gagal ambil data. Pastikan backend berjalan di port 5000.");
    }
  };

  // Add or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingId) {
        // Update
        await axios.put(`${API}/${editingId}`, { title, content });
        setEditingId(null);
      } else {
        // Create
        await axios.post(API, { title, content });
      }
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Gagal menyimpan note. Cek console untuk detail.");
    }
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Apakah yakin ingin menghapus note ini?");
      if (!confirmDelete) return;
      await axios.delete(`${API}/${id}`);
      // Optimis update UI langsung tanpa refetch penuh:
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Gagal menghapus note.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  return (
    <div className="container">
      <h1>📝 Note App</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="form-actions">
          <button type="submit" className="primary">
            {editingId ? "💾 Save Changes" : "➕ Add Note"}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={cancelEdit}>
              ✖ Cancel
            </button>
          )}
        </div>
      </form>

      <div className="notes-grid">
        {notes.length === 0 && <p className="empty">Belum ada note. Tambah dulu yuk!</p>}
        {notes.map((note) => (
          <div className="note" key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="actions">
              <button className="delete" onClick={() => handleDelete(note._id)}>🗑️ Delete</button>
              <button className="edit" onClick={() => handleEdit(note)}>✏️ Edit</button>
            </div>
            <small className="meta">Created: {new Date(note.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
