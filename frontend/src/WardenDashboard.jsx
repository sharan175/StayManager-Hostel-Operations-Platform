import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

function ProfileIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#60a5fa" : "#94a3b8"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function StudentsIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#60a5fa" : "#94a3b8"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ComplaintsIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#60a5fa" : "#94a3b8"} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const NAV = [
  { id: "profile",    label: "Profile",    icon: ProfileIcon,    wip: false },
  { id: "students",   label: "Students",   icon: StudentsIcon,   wip: false },
  { id: "complaints", label: "Complaints", icon: ComplaintsIcon, wip: false },
];

// ─── Stats config ─────────────────────────────────────────────────────────────
const STAT_CONFIG = [
  { key: "totalRooms",  label: "Total Rooms", icon: "🏠", color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  { key: "occupied",    label: "Occupied",    icon: "👥", color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  { key: "vacant",      label: "Vacant",      icon: "🔓", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  { key: "complaints",  label: "Complaints",  icon: "📋", color: "#f43f5e", bg: "rgba(244,63,94,0.1)"   },
];

// ─── Profile Panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ warden, stats }) {
  return (
    <div className="wd-panel">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", marginBottom: 4, letterSpacing: "-0.01em" }}>
          My Profile
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Your warden account details</p>
      </div>

      {/* Avatar Card */}
      <div style={{
        background: "#fff", borderRadius: 18, padding: "28px 28px",
        boxShadow: "0 4px 24px rgba(15,23,42,0.07)",
        border: "1px solid #e8edf5",
        marginBottom: 20,
        display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "'Sora', sans-serif",
          fontWeight: 800, fontSize: "1.6rem", flexShrink: 0,
          boxShadow: "0 8px 24px rgba(37,99,235,0.28)"
        }}>
          {warden?.name?.charAt(0)?.toUpperCase() || "W"}
        </div>
        <div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#0f172a", letterSpacing: "-0.01em" }}>
            {warden?.name || "—"}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 3 }}>{warden?.email || "—"}</div>
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", border: "1px solid #bfdbfe" }}>
            🛡️ WARDEN · FLOOR {warden?.floor_number || "—"}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Assigned Floor", value: warden?.floor_number ? `Floor ${warden.floor_number}` : "—" },
          { label: "Role",           value: "Warden" },
          { label: "Phone",          value: warden?.phone_no || warden?.phone || "—" },
          { label: "Status",         value: "Active ✅" },
        ].map(item => (
          <div key={item.label} style={{
            background: "#fff", borderRadius: 14, padding: "17px 18px",
            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{ fontSize: "0.66rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 7 }}>{item.label}</div>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14 }}>
        {STAT_CONFIG.map(s => (
          <div key={s.key} style={{
            background: "#fff", borderRadius: 16, padding: "20px 16px",
            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
            border: "1px solid #f1f5f9",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: -14, right: -14, width: 64, height: 64, borderRadius: "50%", background: s.color, opacity: 0.07, filter: "blur(2px)" }} />
            <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.65rem", color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {stats?.[s.key] ?? "—"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WIP Panel ─────────────────────────────────────────────────────────────────
function WipPanel({ label, icon: Icon }) {
  return (
    <div className="wd-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 380 }}>
      <div style={{ width: 76, height: 76, borderRadius: 22, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
        <Icon active={false} />
      </div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#0f172a", marginBottom: 10, letterSpacing: "-0.01em" }}>{label}</h2>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fef9c3", color: "#92400e", padding: "5px 16px", borderRadius: 20, fontSize: "0.76rem", fontWeight: 700, marginBottom: 14, border: "1px solid #fde68a" }}>
        🚧 Under Construction
      </div>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", textAlign: "center", maxWidth: 290, lineHeight: 1.7 }}>
        This section is being built. Check back soon for the full {label.toLowerCase()} management experience.
      </p>
    </div>
  );
}

// ─── Students Panel ────────────────────────────────────────────────────────────
function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API}/warden/student`, { credentials: "include" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        // backend returns { message, user } — user is rows array
        const rows = Array.isArray(data.user) ? data.user : data.user ? [data.user] : [];
        setStudents(rows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.room_number).includes(search)
  );

  return (
    <div className="wd-panel">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", marginBottom: 4, letterSpacing: "-0.01em" }}>
          Students
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>All students assigned to your floor</p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: "0.95rem", pointerEvents: "none" }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name or room…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px 10px 38px",
            borderRadius: 12, border: "1.5px solid #e2e8f0",
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem",
            background: "#fff", color: "#0f172a", outline: "none",
            boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#2563eb"}
          onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
        />
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          Loading student details…
        </div>
      )}

      {!loading && error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "20px 22px", color: "#dc2626", fontSize: "0.875rem", fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎓</div>
          {search ? "No students match your search." : "No students found for your floor."}
        </div>
      )}

      {/* Table — desktop */}
      {!loading && !error && filtered.length > 0 && (
        <>
          {/* Summary chips */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 13px", fontSize: "0.72rem", fontWeight: 700 }}>
              👥 {students.length} Total
            </span>
            <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 13px", fontSize: "0.72rem", fontWeight: 700 }}>
              ✅ {students.filter(s => s.paid).length} Fees Paid
            </span>
            <span style={{ background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa", borderRadius: 20, padding: "4px 13px", fontSize: "0.72rem", fontWeight: 700 }}>
              ⏳ {students.filter(s => !s.paid).length} Pending
            </span>
          </div>

          {/* Card grid (mobile-friendly) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {filtered.map((s, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 16, padding: "18px 20px",
                boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
                border: "1px solid #f1f5f9",
                display: "flex", flexDirection: "column", gap: 12,
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #2563eb, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1rem",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.22)",
                  }}>
                    {s.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name || "—"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                      📞 {s.phone || "—"}
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ background: "#f8faff", border: "1px solid #e0e7ff", borderRadius: 8, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 700, color: "#3730a3" }}>
                    🚪 Room {s.room_number ?? "—"}
                  </span>
                  <span style={{
                    borderRadius: 20, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 700,
                    background: s.paid ? "#f0fdf4" : "#fff7ed",
                    color:      s.paid ? "#16a34a" : "#ea580c",
                    border:     `1px solid ${s.paid ? "#bbf7d0" : "#fed7aa"}`,
                  }}>
                    {s.paid ? "✅ Paid" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Complaints Panel ──────────────────────────────────────────────────────────
const DEFAULT_IMG = "https://ui-avatars.com/api/?name=No+Image&background=f1f5f9&color=94a3b8&size=80";

function ComplaintsPanel() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [resolving, setResolving]   = useState(null);
  const [search, setSearch]         = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/complaints/warden`, { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setComplaints(Array.isArray(data.complaints) ? data.complaints : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleResolve = async (id) => {
    try {
      setResolving(id);
      const res = await fetch(`${API}/complaints/${id}/resolve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to resolve");
      // remove from list after resolving
      setComplaints(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(null);
    }
  };

  const filtered = complaints.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(c.room_number).includes(search) ||
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="wd-panel">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", marginBottom: 4, letterSpacing: "-0.01em" }}>
          Complaints
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Pending complaints from students on your floor</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: "0.95rem", pointerEvents: "none" }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name, room or title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px 10px 38px",
            borderRadius: 12, border: "1.5px solid #e2e8f0",
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.875rem",
            background: "#fff", color: "#0f172a", outline: "none",
            boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#2563eb"}
          onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          Loading complaints…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "20px 22px", color: "#dc2626", fontSize: "0.875rem", fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>✅</div>
          {search ? "No complaints match your search." : "No pending complaints on your floor."}
        </div>
      )}

      {/* Summary chips */}
      {!loading && !error && complaints.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <span style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 20, padding: "4px 13px", fontSize: "0.72rem", fontWeight: 700 }}>
            📋 {complaints.length} Pending
          </span>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((c) => (
            <div key={c.id} style={{
              background: "#fff", borderRadius: 16,
              boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
              border: "1px solid #f1f5f9",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {/* Image */}
              <div style={{ width: "100%", height: 160, overflow: "hidden", background: "#f8faff", flexShrink: 0 }}>
                <img
                  src={c.image_url || DEFAULT_IMG}
                  alt={c.title}
                  onError={e => { e.target.src = DEFAULT_IMG; }}
                  style={{ width: "100%", height: "100%", objectFit: c.image_url ? "cover" : "contain", padding: c.image_url ? 0 : 20 }}
                />
              </div>

              {/* Body */}
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {/* Student row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #2563eb, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "0.85rem",
                    boxShadow: "0 2px 8px rgba(37,99,235,0.22)",
                  }}>
                    {c.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.name || "—"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 1 }}>
                      🚪 Room {c.room_number ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                  {c.title}
                </div>

                {/* Description */}
                <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.6,
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
                }}>
                  {c.description}
                </div>

                {/* Date */}
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: "auto" }}>
                  🕐 {c.created_at ? (() => { const d = new Date(c.created_at); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; })() : "—"}
                </div>

                {/* Resolve button */}
                <button
                  onClick={() => handleResolve(c.id)}
                  disabled={resolving === c.id}
                  style={{
                    width: "100%", padding: "9px 0",
                    borderRadius: 10, border: "none",
                    background: resolving === c.id ? "#e2e8f0" : "linear-gradient(135deg, #2563eb, #6366f1)",
                    color: resolving === c.id ? "#94a3b8" : "#fff",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem",
                    cursor: resolving === c.id ? "not-allowed" : "pointer",
                    transition: "opacity 0.2s",
                    marginTop: 4,
                  }}
                  onMouseEnter={e => { if (resolving !== c.id) e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  {resolving === c.id ? "Resolving…" : "✅ Mark as Done"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, warden, onSignOut, onClose, isMobile }) {
  return (
    <div style={{
      width: "100%", background: "#0f172a",
      display: "flex", flexDirection: "column",
      height: "100%", overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(37,99,235,0.4)" }}>S</div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff" }}>UniStay</span>
        </div>
        {isMobile && onClose && (
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, color: "#94a3b8", fontSize: "0.9rem" }}>✕</button>
        )}
      </div>

      {/* Warden badge */}
      <div style={{ margin: "16px 14px", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.18)", borderRadius: 12, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "0.78rem", flexShrink: 0, boxShadow: "0 2px 8px rgba(37,99,235,0.35)" }}>
          {warden?.name?.charAt(0)?.toUpperCase() || "W"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.83rem", color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {warden?.name || "Warden"}
          </div>
          <div style={{ fontSize: "0.66rem", color: "#60a5fa", fontWeight: 700, letterSpacing: "0.05em", marginTop: 1 }}>
            WARDEN · FLOOR {warden?.floor_number || "—"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: "0.62rem", color: "#334155", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 9px", marginBottom: 6, marginTop: 4 }}>Navigation</div>
        {NAV.map(({ id, label, icon: Icon, wip }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => { setActive(id); if (onClose) onClose(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11,
                padding: "10px 11px", borderRadius: 10,
                border: "none", borderLeft: `2px solid ${isActive ? "#2563eb" : "transparent"}`,
                cursor: "pointer",
                background: isActive ? "rgba(37,99,235,0.14)" : "transparent",
                transition: "all 0.15s", textAlign: "left",
              }}
            >
              <Icon active={isActive} />
              <span style={{ flex: 1, fontWeight: isActive ? 700 : 500, fontSize: "0.875rem", color: isActive ? "#93c5fd" : "#94a3b8", fontFamily: "'DM Sans', sans-serif" }}>
                {label}
              </span>
              {wip && (
                <span style={{ fontSize: "0.58rem", background: "rgba(245,158,11,0.12)", color: "#fbbf24", padding: "2px 7px", borderRadius: 20, fontWeight: 700, border: "1px solid rgba(245,158,11,0.22)" }}>
                  WIP
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sign out */}
      <div style={{ padding: "14px 8px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8, flexShrink: 0 }}>
        <button
          onClick={onSignOut}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(244,63,94,0.09)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#f87171", fontFamily: "'DM Sans', sans-serif" }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function WardenDashboard() {
  const navigate = useNavigate();
  const [warden, setWarden]         = useState(null);
  const [checking, setChecking]     = useState(true);
  const [active, setActive]         = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [stats, setStats]           = useState(null);

  // Auth check — the JOIN on wardens table is the security gate.
  // If user is not in wardens table, backend returns 404 → redirect.
  // No role column check needed.
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API}/warden/profile`, { credentials: "include" });
        if (!res.ok) {
          console.warn("Warden profile fetch failed:", res.status);
          navigate("/");
          return;
        }
        const data = await res.json();
        if (!data.user) { navigate("/"); return; }
        setWarden(data.user);
        setChecking(false);
        setTimeout(() => setMounted(true), 50);
      } catch (err) {
        console.error("Warden auth error:", err);
        navigate("/");
      }
    };
    verify();
  }, []);

  // Fetch floor stats
  useEffect(() => {
    if (!warden) return;
    const fetchStats = async () => {
      try {
        const res  = await fetch(`${API}/warden/stats`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        
      }
    };
    fetchStats();
  }, [warden]);

  // Close mobile on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "GET", credentials: "include" });
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (checking) return null;

  const currentNav = NAV.find(n => n.id === active);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#f0f4ff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes wd-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        .wd-sidebar {
          width: 240px; flex-shrink: 0;
          position: sticky; top: 0; height: 100vh;
          z-index: 20;
        }
        @media (max-width: 767px) {
          .wd-sidebar { display: none; }
        }

        .wd-main {
          flex: 1; min-width: 0; display: flex; flex-direction: column;
          opacity: 0; transform: translateX(14px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .wd-main.mounted { opacity: 1; transform: translateX(0); }

        .wd-topbar {
          background: #fff;
          border-bottom: 1px solid #e8edf5;
          height: 62px; padding: 0 22px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-shrink: 0;
          position: sticky; top: 0; z-index: 10;
        }

        .wd-hamburger {
          display: none;
          background: #f1f5f9; border: none; border-radius: 9px;
          width: 36px; height: 36px; align-items: center; justify-content: center;
          cursor: pointer; font-size: 1rem; color: #374151; flex-shrink: 0;
        }
        @media (max-width: 767px) { .wd-hamburger { display: flex; } }

        .wd-page { flex: 1; overflow-y: auto; padding: 26px 22px; }
        @media (max-width: 480px) { .wd-page { padding: 18px 12px; } }

        .wd-panel { animation: wd-in 0.28s cubic-bezier(.4,0,.2,1); }

        .wd-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(3px);
          z-index: 40;
        }
        @media (max-width: 767px) { .wd-overlay.visible { display: block; } }

        .wd-drawer {
          position: fixed; top: 0; left: 0;
          width: 250px; height: 100dvh;
          z-index: 50;
          animation: slideIn 0.25s ease;
          box-shadow: 6px 0 32px rgba(0,0,0,0.2);
        }

        .wd-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;
          border-radius: 20px; padding: 3px 10px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em;
        }

        .wd-avatar-pill {
          display: flex; align-items: center; gap: 7px;
          background: #f8faff; border-radius: 30px; padding: 5px 11px;
        }
        .wd-avatar-sm {
          width: 25px; height: 25px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #6366f1);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
        }
        @media (max-width: 400px) { .wd-avatar-name { display: none; } }
        @media (max-width: 500px) { .wd-topbar-badge { display: none !important; } }
      `}</style>

      {/* Overlay */}
      <div className={`wd-overlay ${mobileOpen ? "visible" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* ── Desktop Sidebar ── */}
      <aside className="wd-sidebar">
        <Sidebar active={active} setActive={setActive} warden={warden} onSignOut={handleSignOut} />
      </aside>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="wd-drawer">
          <Sidebar active={active} setActive={setActive} warden={warden} onSignOut={handleSignOut} onClose={() => setMobileOpen(false)} isMobile />
        </div>
      )}

      {/* ── Main ── */}
      <div className={`wd-main ${mounted ? "mounted" : ""}`}>

        {/* Topbar */}
        <header className="wd-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button className="wd-hamburger" onClick={() => setMobileOpen(p => !p)}>☰</button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentNav?.label}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 1 }}>UniStay Warden Panel</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span className="wd-topbar-badge wd-badge">🏠 Warden</span>
            <div className="wd-avatar-pill">
              <div className="wd-avatar-sm">{warden?.name?.charAt(0)?.toUpperCase()}</div>
              <span className="wd-avatar-name" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
                {warden?.name?.split(" ")[0]}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              style={{ background: "none", border: "1.5px solid #e2e8f0", color: "#64748b", borderRadius: 9, padding: "6px 13px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.color = "#dc2626"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page */}
        <div className="wd-page">
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {active === "profile"    && <ProfilePanel warden={warden} stats={stats} />}
            {active === "students"   && <StudentsPanel />}
            {active === "complaints" && <ComplaintsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}