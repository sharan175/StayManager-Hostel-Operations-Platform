import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
const DUMMY_IMG = "https://ui-avatars.com/api/?name=No+Image&background=f1f5f9&color=94a3b8&size=80";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ProfileIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#60a5fa" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const ComplaintsIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#60a5fa" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const FoodIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#60a5fa" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const NAV = [
  { id: "profile",    label: "Profile",    icon: ProfileIcon,    wip: false },
  { id: "complaints", label: "Complaints", icon: ComplaintsIcon, wip: false },
  { id: "food",       label: "Food",       icon: FoodIcon,       wip: true  },
];

// ─── Profile Panel ────────────────────────────────────────────────────────────
function ProfilePanel({ user, allocation }) {
  if (!user) return <div style={loadingStyle}>Loading profile…</div>;

  const fields = [
    { label: "Full Name",  value: user.name },
    { label: "Email",      value: user.email },
    { label: "Phone",      value: user.phone || "—" },
    { label: "Room",  value: allocation?.rooms ? `Room ${allocation.rooms}` : "Not allocated" },
    { label: "Floor", value: allocation?.floor ? `Floor ${allocation.floor}` : "—" },
    { label: "Fees Paid",  value: allocation?.fees_paid? "✅ Paid" : "❌ Unpaid" },
  ];

  return (
    <div className="sd-panel">
      <h2 style={panelTitle}>My Profile</h2>
      <p style={panelSub}>Your account and room details</p>

      {/* Avatar card */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "24px 24px", boxShadow: "0 4px 20px rgba(15,23,42,0.07)", border: "1px solid #e8edf5", marginBottom: 16, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.6rem", flexShrink: 0 }}>
          {user.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>{user.name}</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 3 }}>{user.email}</div>
          <div style={{ marginTop: 8, display: "inline-block", background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "3px 12px", fontSize: "0.7rem", fontWeight: 700 }}>🎓 Student</div>
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {fields.map(f => (
          <div key={f.label} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", border: "1px solid #f1f5f9", boxShadow: "0 1px 6px rgba(15,23,42,0.04)" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{f.label}</div>
            <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.88rem" }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Complaints Panel ─────────────────────────────────────────────────────────
function ComplaintsPanel() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ title: "", description: "" });
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [msg, setMsg]               = useState({ text: "", ok: true });
  const [showForm, setShowForm]     = useState(false);
  const fileRef                     = useRef();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/complaints`, { credentials: "include" });
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch { setComplaints([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setMsg({ text: "Title and description are required", ok: false }); return;
    }
    try {
      setSubmitting(true);
      setMsg({ text: "", ok: true });

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      if (imageFile) fd.append("image", imageFile);

      const res  = await fetch(`${API}/complaints`, { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMsg({ text: "Complaint submitted successfully", ok: true });
      setForm({ title: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      fetchComplaints();
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
  };

  return (
    <div className="sd-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={panelTitle}>My Complaints</h2>
          <p style={panelSub}>Submit and track your complaints</p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setMsg({ text: "", ok: true }); }}
          style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
        >
          {showForm ? "✕ Cancel" : "+ New Complaint"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "#f8faff", borderRadius: 16, padding: "20px 20px", border: "1px solid #e2e8f0", marginBottom: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              style={inputStyle}
            />
            <textarea
              placeholder="Describe your complaint…"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            {/* Image upload */}
            <div
              onClick={() => fileRef.current.click()}
              style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", background: "#fff", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}
            >
              {imagePreview
                ? <img src={imagePreview} alt="preview" style={{ maxHeight: 140, borderRadius: 8, objectFit: "cover" }} />
                : <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>📷 Click to attach a photo (optional)</div>
              }
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
            </div>

            {msg.text && (
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: msg.ok ? "#16a34a" : "#dc2626", background: msg.ok ? "#f0fdf4" : "#fef2f2", borderRadius: 8, padding: "10px 14px" }}>
                {msg.ok ? "✅" : "⚠️"} {msg.text}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ padding: "10px 0", borderRadius: 10, border: "none", background: submitting ? "#e2e8f0" : "linear-gradient(135deg,#2563eb,#6366f1)", color: submitting ? "#94a3b8" : "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "Submitting…" : "Submit Complaint"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading && <div style={loadingStyle}>Loading complaints…</div>}

      {!loading && complaints.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>📭</div>
          No complaints submitted yet.
        </div>
      )}

      {!loading && complaints.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {complaints.map(c => (
            <div key={c.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "0 2px 10px rgba(15,23,42,0.05)", overflow: "hidden", display: "flex", gap: 0, flexWrap: "wrap" }}>
              {/* Image */}
              {(c.image_url || true) && (
                <div style={{ width: 100, flexShrink: 0, background: "#f8faff" }}>
                  <img
                    src={c.image_url ? `${API}${c.image_url}` : DUMMY_IMG}
                    alt={c.title}
                    onError={e => { e.target.src = DUMMY_IMG; }}
                    style={{ width: "100%", height: "100%", minHeight: 90, objectFit: c.image_url ? "cover" : "contain", padding: c.image_url ? 0 : 16 }}
                  />
                </div>
              )}
              <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{c.title}</div>
                  <span style={{
                    background: c.status ? "#f0fdf4" : "#fef9ec",
                    color: c.status ? "#16a34a" : "#d97706",
                    borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0
                  }}>
                    {c.status ? "✅ Resolved" : "⏳ Pending"}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 5, lineHeight: 1.5 }}>{c.description}</div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 8 }}>🕐 {formatDate(c.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WIP Panel ────────────────────────────────────────────────────────────────
function WipPanel({ label }) {
  return (
    <div className="sd-panel" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🍽️</div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: 8 }}>{label}</h3>
        <p style={{ color: "#64748b", fontSize: "0.85rem" }}>This section is under construction.</p>
        <div style={{ marginTop: 16, display: "inline-block", background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "5px 16px", fontSize: "0.72rem", fontWeight: 700 }}>Coming Soon</div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate                    = useNavigate();
  const [active, setActive]         = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser]             = useState(null);
  const [allocation, setAllocation] = useState(null);

  useEffect(() => {
    // fetch user profile
    fetch(`${API}/auth/user`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});

    // fetch allocation/room info
    fetch(`${API}/allocatecheck`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.rooms) setAllocation(d); })  
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "GET", credentials: "include" });
    navigate("/");
  };

  const handleNav = (id) => {
    setActive(id);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4ff", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sd-sidebar { position: fixed; top: 0; left: 0; height: 100vh; width: 220px; background: #0f172a; display: flex; flex-direction: column; z-index: 100; transition: transform 0.3s; }
        .sd-main { margin-left: 220px; flex: 1; padding: 28px 24px; min-height: 100vh; }
        .sd-panel { background: transparent; }
        .sd-overlay { display: none; }
        @media (max-width: 768px) {
          .sd-sidebar { transform: translateX(-100%); }
          .sd-sidebar.open { transform: translateX(0); }
          .sd-main { margin-left: 0; padding: 16px; }
          .sd-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 99; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`sd-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1rem" }}>S</div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>UniStay</span>
          </div>
          {user && <div style={{ marginTop: 10, fontSize: "0.75rem", color: "#64748b" }}>👋 {user.name?.split(" ")[0]}</div>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(({ id, label, icon: Icon, wip }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, border: "none",
                  background: isActive ? "rgba(37,99,235,0.18)" : "transparent",
                  color: isActive ? "#60a5fa" : "#94a3b8",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: isActive ? 700 : 500,
                  fontSize: "0.875rem", cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "all 0.2s",
                }}
              >
                <Icon active={isActive} />
                {label}
                {wip && <span style={{ marginLeft: "auto", background: "#1e293b", color: "#64748b", borderRadius: 20, padding: "2px 8px", fontSize: "0.6rem", fontWeight: 700 }}>SOON</span>}
              </button>
            );
          })}
        </nav>

        {/* Signout */}
        <div style={{ padding: "12px 12px 24px" }}>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(239,68,68,0.1)", color: "#f87171", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", width: "100%" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="sd-main">
        {/* Mobile topbar */}
        <div style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: 20, className: "mobile-top" }}>
          <style>{`.mobile-topbar { display: none; } @media(max-width:768px){ .mobile-topbar{ display:flex !important; align-items:center; justify-content:space-between; margin-bottom:20px; } }`}</style>
        </div>
        <div className="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: "1.1rem" }}
          >☰</button>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>UniStay</span>
          <div style={{ width: 40 }} />
        </div>

        {/* Panels */}
        {active === "profile"    && <ProfilePanel user={user} allocation={allocation} />}
        {active === "complaints" && <ComplaintsPanel />}
        {active === "food"       && <WipPanel label="Food Selection" />}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const panelTitle = { fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#0f172a", marginBottom: 4, letterSpacing: "-0.01em" };
const panelSub   = { color: "#94a3b8", fontSize: "0.84rem", marginBottom: 20 };
const loadingStyle = { textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: "0.875rem" };
const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontFamily: "'DM Sans',sans-serif",
  fontSize: "0.875rem", color: "#0f172a", background: "#fff", outline: "none",
};