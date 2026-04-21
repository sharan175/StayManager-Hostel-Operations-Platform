import { useState, useEffect } from "react";

const API = "http://localhost:3000";

export default function FloorPanel() {
  const [list, setList]         = useState([]);
  const [form, setForm]         = useState({ floor: "", name: "" });
  const [delFloor, setDelFloor] = useState("");
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [addMsg, setAddMsg]     = useState({ text: "", ok: true });
  const [delMsg, setDelMsg]     = useState({ text: "", ok: true });
  const [addLoading, setAddLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  // Edit state
  const [editTarget, setEditTarget]   = useState(null); // floor_number being edited
  const [editForm, setEditForm]       = useState({ name: "" });
  const [editImage, setEditImage]     = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editMsg, setEditMsg]         = useState({ text: "", ok: true });
  const [editLoading, setEditLoading] = useState(false);

  const fetchList = async () => {
    try {
      const res  = await fetch(`${API}/floors`, { credentials: "include" });
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
    if (!form.floor || !form.name) {
      setAddMsg({ text: "Floor number and name are required", ok: false }); return;
    }
    setAddLoading(true);
    try {
      const fd = new FormData();
      fd.append("floor", form.floor);
      fd.append("name", form.name);
      if (image) fd.append("image", image);
      const res  = await fetch(`${API}/floors`, { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) { setAddMsg({ text: data.message || "Error", ok: false }); return; }
      setAddMsg({ text: "Floor created!", ok: true });
      setForm({ floor: "", name: "" });
      setImage(null); setPreview(null);
      fetchList();
    } catch (err) { setAddMsg({ text: err.message, ok: false }); }
    finally { setAddLoading(false); }
  };

  const handleDelete = async () => {
    setDelMsg({ text: "", ok: true });
    if (!delFloor) { setDelMsg({ text: "Floor number is required", ok: false }); return; }
    setDelLoading(true);
    try {
      const res  = await fetch(`${API}/floors`, {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floor: delFloor }),
      });
      const data = await res.json();
      if (!res.ok) { setDelMsg({ text: data.message || "Error", ok: false }); return; }
      setDelMsg({ text: "Floor deleted!", ok: true });
      setDelFloor(""); fetchList();
    } catch (err) { setDelMsg({ text: err.message, ok: false }); }
    finally { setDelLoading(false); }
  };

  const openEdit = (f) => {
    setEditTarget(f.floor_number);
    setEditForm({ name: f.name });
    setEditImage(null);
    setEditPreview(f.image_url ? `${API}${f.image_url}` : null);
    setEditMsg({ text: "", ok: true });
  };

  const handleEdit = async () => {
    setEditMsg({ text: "", ok: true });
    if (!editForm.name) { setEditMsg({ text: "Name is required", ok: false }); return; }
    setEditLoading(true);
    try {
      const fd = new FormData();
      fd.append("floor", editTarget);
      fd.append("name", editForm.name);
      if (editImage) fd.append("image", editImage);
      const res  = await fetch(`${API}/floors`, { method: "PUT", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) { setEditMsg({ text: data.message || "Error", ok: false }); return; }
      setEditMsg({ text: "Floor updated!", ok: true });
      setTimeout(() => setEditTarget(null), 800);
      fetchList();
    } catch (err) { setEditMsg({ text: err.message, ok: false }); }
    finally { setEditLoading(false); }
  };

  return (
    <div className="adm-panel">
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 22 }}>
        🏢 Floor Management
      </h2>

      <div className="role-grid">
        {/* ADD */}
        <div className="role-card">
          <div className="role-card-header" style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)" }}>
            <span style={{ fontSize: "1.4rem" }}>➕</span><span>Add Floor</span>
          </div>
          <div className="role-card-body">
            <div className="adm-field-group">
              <label className="adm-field-label">Floor Number</label>
              <input className="adm-input" type="number" placeholder="e.g. 1"
                value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} />
            </div>
            <div className="adm-field-group">
              <label className="adm-field-label">Floor Name</label>
              <input className="adm-input" type="text" placeholder="e.g. Ground Floor"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="adm-field-group">
              <label className="adm-field-label">Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                style={{ fontSize: "0.82rem", color: "#64748b", cursor: "pointer" }} />
              {preview && <img src={preview} alt="preview" style={{ marginTop: 8, width: "100%", height: 110, objectFit: "cover", borderRadius: 8 }} />}
            </div>
            {addMsg.text && <div className={addMsg.ok ? "adm-msg-ok" : "adm-msg-err"}>{addMsg.ok ? "✅" : "⚠️"} {addMsg.text}</div>}
            <button className="adm-btn-primary" onClick={handleAdd} disabled={addLoading}>
              {addLoading ? "Creating…" : "Create Floor"}
            </button>
          </div>
        </div>

        {/* DELETE */}
        <div className="role-card">
          <div className="role-card-header" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
            <span style={{ fontSize: "1.4rem" }}>🗑️</span><span>Delete Floor</span>
          </div>
          <div className="role-card-body">
            <div className="adm-field-group">
              <label className="adm-field-label">Floor Number</label>
              <input className="adm-input" type="number" placeholder="e.g. 1"
                value={delFloor} onChange={e => setDelFloor(e.target.value)} />
            </div>
            {delMsg.text && <div className={delMsg.ok ? "adm-msg-ok" : "adm-msg-err"}>{delMsg.ok ? "✅" : "⚠️"} {delMsg.text}</div>}
            <button className="adm-btn-danger" onClick={handleDelete} disabled={delLoading}>
              {delLoading ? "Deleting…" : "Delete Floor"}
            </button>
          </div>
        </div>
      </div>

      {/* FLOOR LIST */}
      {list.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
            All Floors ({list.length})
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
            {list.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
                {/* Inline edit form */}
                {editTarget === f.floor_number ? (
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#2563eb" }}>
                      ✏️ Editing Floor {f.floor_number}
                    </div>
                    <div className="adm-field-group">
                      <label className="adm-field-label">New Name</label>
                      <input className="adm-input" type="text"
                        value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="adm-field-group">
                      <label className="adm-field-label">New Image (optional)</label>
                      <input type="file" accept="image/*" onChange={handleEditImageChange}
                        style={{ fontSize: "0.78rem", color: "#64748b", cursor: "pointer" }} />
                      {editPreview && <img src={editPreview} alt="preview" style={{ marginTop: 6, width: "100%", height: 80, objectFit: "cover", borderRadius: 7 }} />}
                    </div>
                    {editMsg.text && <div className={editMsg.ok ? "adm-msg-ok" : "adm-msg-err"} style={{ fontSize: "0.78rem" }}>{editMsg.ok ? "✅" : "⚠️"} {editMsg.text}</div>}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="adm-btn-primary" style={{ flex: 1, padding: "9px 0", fontSize: "0.82rem" }} onClick={handleEdit} disabled={editLoading}>
                        {editLoading ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => setEditTarget(null)} style={{ flex: 1, padding: "9px 0", fontSize: "0.82rem", background: "#f1f5f9", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#64748b" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {f.image_url
                      ? <img src={`${API}${f.image_url}`} alt={f.name} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                      : <div style={{ height: 80, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🏢</div>
                    }
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{f.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, marginTop: 3 }}>Floor {f.floor_number}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>{f.total_rooms || 0} rooms</div>
                      <button onClick={() => openEdit(f)} style={{ marginTop: 10, width: "100%", padding: "7px 0", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#2563eb", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
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