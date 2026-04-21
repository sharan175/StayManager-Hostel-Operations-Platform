import { useState, useEffect } from "react";

const API = "http://localhost:3000";

export default function RoomPanel() {
  const [list, setList]       = useState([]);
  const [form, setForm]       = useState({ Room_no: "", floor_no: "", capacity: "" });
  const [delRoom, setDelRoom] = useState("");
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [addMsg, setAddMsg]   = useState({ text: "", ok: true });
  const [delMsg, setDelMsg]   = useState({ text: "", ok: true });
  const [addLoading, setAddLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  // Edit state
  const [editTarget, setEditTarget]   = useState(null); // room_number being edited
  const [editForm, setEditForm]       = useState({ capacity: "" });
  const [editImage, setEditImage]     = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editMsg, setEditMsg]         = useState({ text: "", ok: true });
  const [editLoading, setEditLoading] = useState(false);

  const fetchList = async () => {
    try {
      const res  = await fetch(`${API}/rooms`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setList(data.data || []);
    } catch {}
  };

  useEffect(() => { fetchList(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditImage(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    setAddMsg({ text: "", ok: true });
    if (!form.Room_no || !form.floor_no || !form.capacity) {
      setAddMsg({ text: "All fields are required", ok: false }); return;
    }
    setAddLoading(true);
    try {
      const fd = new FormData();
      fd.append("Room_no", form.Room_no);
      fd.append("floor_no", form.floor_no);
      fd.append("capacity", form.capacity);
      if (image) fd.append("image", image);
      const res  = await fetch(`${API}/rooms`, { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) { setAddMsg({ text: data.error || "Error", ok: false }); return; }
      setAddMsg({ text: "Room created!", ok: true });
      setForm({ Room_no: "", floor_no: "", capacity: "" });
      setImage(null); setPreview(null);
      fetchList();
    } catch (err) { setAddMsg({ text: err.message, ok: false }); }
    finally { setAddLoading(false); }
  };

  const handleDelete = async () => {
    setDelMsg({ text: "", ok: true });
    if (!delRoom) { setDelMsg({ text: "Room number is required", ok: false }); return; }
    setDelLoading(true);
    try {
      const res  = await fetch(`${API}/rooms`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Room_no: delRoom }),
      });
      const data = await res.json();
      if (!res.ok) { setDelMsg({ text: data.error || "Error", ok: false }); return; }
      setDelMsg({ text: "Room deleted!", ok: true });
      setDelRoom(""); fetchList();
    } catch (err) { setDelMsg({ text: err.message, ok: false }); }
    finally { setDelLoading(false); }
  };

  const openEdit = (r) => {
    setEditTarget(r.room_number);
    setEditForm({ capacity: r.capacity });
    setEditImage(null);
    setEditPreview(r.image_url ? `${API}${r.image_url}` : null);
    setEditMsg({ text: "", ok: true });
  };

  const handleEdit = async () => {
    setEditMsg({ text: "", ok: true });
    if (!editForm.capacity) { setEditMsg({ text: "Capacity is required", ok: false }); return; }
    setEditLoading(true);
    try {
      const fd = new FormData();
      fd.append("Room_no", editTarget);
      fd.append("capacity", editForm.capacity);
      if (editImage) fd.append("image", editImage);
      const res  = await fetch(`${API}/rooms`, { method: "PUT", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) { setEditMsg({ text: data.error || "Error", ok: false }); return; }
      setEditMsg({ text: "Room updated!", ok: true });
      setTimeout(() => setEditTarget(null), 800);
      fetchList();
    } catch (err) { setEditMsg({ text: err.message, ok: false }); }
    finally { setEditLoading(false); }
  };

  return (
    <div className="adm-panel">
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 22 }}>
        🚪 Room Management
      </h2>

      <div className="role-grid">
        {/* ADD */}
        <div className="role-card">
          <div className="role-card-header" style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)" }}>
            <span style={{ fontSize: "1.4rem" }}>➕</span><span>Add Room</span>
          </div>
          <div className="role-card-body">
            <div className="adm-field-group">
              <label className="adm-field-label">Room Number</label>
              <input className="adm-input" type="text" placeholder="e.g. 101"
                value={form.Room_no} onChange={e => setForm(p => ({ ...p, Room_no: e.target.value }))} />
            </div>
            <div className="adm-field-group">
              <label className="adm-field-label">Floor Number</label>
              <input className="adm-input" type="number" placeholder="e.g. 1"
                value={form.floor_no} onChange={e => setForm(p => ({ ...p, floor_no: e.target.value }))} />
            </div>
            <div className="adm-field-group">
              <label className="adm-field-label">Capacity</label>
              <input className="adm-input" type="number" placeholder="e.g. 4"
                value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
            </div>
            <div className="adm-field-group">
              <label className="adm-field-label">Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                style={{ fontSize: "0.82rem", color: "#64748b", cursor: "pointer" }} />
              {preview && <img src={preview} alt="preview" style={{ marginTop: 8, width: "100%", height: 110, objectFit: "cover", borderRadius: 8 }} />}
            </div>
            {addMsg.text && <div className={addMsg.ok ? "adm-msg-ok" : "adm-msg-err"}>{addMsg.ok ? "✅" : "⚠️"} {addMsg.text}</div>}
            <button className="adm-btn-primary" onClick={handleAdd} disabled={addLoading}>
              {addLoading ? "Creating…" : "Create Room"}
            </button>
          </div>
        </div>

        {/* DELETE */}
        <div className="role-card">
          <div className="role-card-header" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
            <span style={{ fontSize: "1.4rem" }}>🗑️</span><span>Delete Room</span>
          </div>
          <div className="role-card-body">
            <div className="adm-field-group">
              <label className="adm-field-label">Room Number</label>
              <input className="adm-input" type="text" placeholder="e.g. 101"
                value={delRoom} onChange={e => setDelRoom(e.target.value)} />
            </div>
            {delMsg.text && <div className={delMsg.ok ? "adm-msg-ok" : "adm-msg-err"}>{delMsg.ok ? "✅" : "⚠️"} {delMsg.text}</div>}
            <button className="adm-btn-danger" onClick={handleDelete} disabled={delLoading}>
              {delLoading ? "Deleting…" : "Delete Room"}
            </button>
          </div>
        </div>
      </div>

      {/* ROOM LIST */}
      {list.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
            All Rooms ({list.length})
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {list.map((r, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
                {editTarget === r.room_number ? (
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.83rem", color: "#2563eb" }}>
                      ✏️ Editing Room {r.room_number}
                    </div>
                    <div className="adm-field-group">
                      <label className="adm-field-label">Capacity</label>
                      <input className="adm-input" type="number"
                        value={editForm.capacity} onChange={e => setEditForm(p => ({ ...p, capacity: e.target.value }))} />
                    </div>
                    <div className="adm-field-group">
                      <label className="adm-field-label">New Image (optional)</label>
                      <input type="file" accept="image/*" onChange={handleEditImageChange}
                        style={{ fontSize: "0.75rem", color: "#64748b", cursor: "pointer" }} />
                      {editPreview && <img src={editPreview} alt="preview" style={{ marginTop: 6, width: "100%", height: 72, objectFit: "cover", borderRadius: 7 }} />}
                    </div>
                    {editMsg.text && <div className={editMsg.ok ? "adm-msg-ok" : "adm-msg-err"} style={{ fontSize: "0.76rem" }}>{editMsg.ok ? "✅" : "⚠️"} {editMsg.text}</div>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="adm-btn-primary" style={{ flex: 1, padding: "8px 0", fontSize: "0.8rem" }} onClick={handleEdit} disabled={editLoading}>
                        {editLoading ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditTarget(null)} style={{ flex: 1, padding: "8px 0", fontSize: "0.8rem", background: "#f1f5f9", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#64748b" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {r.image_url
                      ? <img src={`${API}${r.image_url}`} alt={`Room ${r.room_number}`} style={{ width: "100%", height: 90, objectFit: "cover" }} />
                      : <div style={{ height: 70, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🚪</div>
                    }
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>Room {r.room_number}</div>
                      <div style={{ fontSize: "0.74rem", color: "#2563eb", fontWeight: 600, marginTop: 2 }}>Floor {r.floor_number}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>Capacity: {r.capacity}</div>
                      <button onClick={() => openEdit(r)} style={{ marginTop: 10, width: "100%", padding: "7px 0", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#2563eb", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer" }}>
                        ✏️ Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}