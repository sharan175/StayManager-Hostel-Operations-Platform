import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FloorPanel from "./Floorpanel.jsx";
import RoomPanel from "./Roompanel.jsx";


const SIDEBAR_ITEMS = [
  { key: "profile", icon: "👤", label: "Profile" },
  { key: "warden",  icon: "🏠", label: "Wardens" },
  { key: "cook",    icon: "🍽️", label: "Cooks" },
  { key: "student", icon: "🎓", label: "Students" },
  { key: "floors",  icon: "🏢", label: "Floors" },
  { key: "rooms",   icon: "🚪", label: "Rooms" },
  { key: "fees",    icon: "💰", label: "Student Fees Record" },
];

const API = "http://localhost:3000";

/* ─── Reusable role management panel ─── */
function RolePanel({ title, icon, addEndpoint, removeEndpoint, extraFields = [], listKey = "list" }) {
  const [list, setList]       = useState([]);
  const [addForm, setAddForm] = useState({ email: "", ...Object.fromEntries(extraFields.map(f => [f.name, ""])) });
  const [delEmail, setDelEmail] = useState("");
  const [addMsg, setAddMsg]   = useState({ text: "", ok: true });
  const [delMsg, setDelMsg]   = useState({ text: "", ok: true });
  const [addLoading, setAddLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const handleAdd = async () => {
    setAddMsg({ text: "", ok: true });
    if (!addForm.email) { setAddMsg({ text: "Email is required", ok: false }); return; }
    for (const f of extraFields) {
      if (!addForm[f.name]) { setAddMsg({ text: `${f.label} is required`, ok: false }); return; }
    }
    setAddLoading(true);
    try {
      const res  = await fetch(`${API}/roles${addEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) { setAddMsg({ text: data.message || "Error", ok: false }); return; }
      setAddMsg({ text: data.message || "Added successfully", ok: true });
      setAddForm({ email: "", ...Object.fromEntries(extraFields.map(f => [f.name, ""])) });
      // refresh list
      fetchList();
   } catch (err) { setAddMsg({ text: err.message || "Cannot reach server", ok: false }); }
    finally { setAddLoading(false); }
  };

  const handleRemove = async () => {
    setDelMsg({ text: "", ok: true });
    if (!delEmail) { setDelMsg({ text: "Email is required", ok: false }); return; }
    setDelLoading(true);
    try {
      const res  = await fetch(`${API}/roles${removeEndpoint}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: delEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setDelMsg({ text: data.message || "Error", ok: false }); return; }
      setDelMsg({ text: data.message || "Removed successfully", ok: true });
      setDelEmail("");
      fetchList();
  } catch (err) { setDelMsg({ text: err.message || "Cannot reach server", ok: false }); }
    finally { setDelLoading(false); }
  };

  const fetchList = async () => {
    try {
      const res  = await fetch(`${API}/roles${addEndpoint}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setList(data[listKey] || []);
      }
    } catch {}
  };

  useEffect(() => { fetchList(); }, []);

  return (
    <div className="adm-panel">
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 22 }}>
        {icon} {title} Management
      </h2>

      <div className="role-grid">
        {/* ADD CARD */}
        <div className="role-card">
          <div className="role-card-header" style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)" }}>
            <span style={{ fontSize: "1.4rem" }}>➕</span>
            <span>Add {title}</span>
          </div>
          <div className="role-card-body">
            <div className="adm-field-group">
              <label className="adm-field-label">Email Address</label>
              <input
                className="adm-input"
                type="email"
                placeholder="user@example.com"
                value={addForm.email}
                onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            {extraFields.map(f => (
              <div key={f.name} className="adm-field-group">
                <label className="adm-field-label">{f.label}</label>
                <input
                  className="adm-input"
                  type={f.type || "text"}
                  placeholder={f.placeholder || ""}
                  value={addForm[f.name]}
                  onChange={e => setAddForm(p => ({ ...p, [f.name]: e.target.value }))}
                />
              </div>
            ))}

            {addMsg.text && (
              <div className={addMsg.ok ? "adm-msg-ok" : "adm-msg-err"}>
                {addMsg.ok ? "✅" : "⚠️"} {addMsg.text}
              </div>
            )}

            <button className="adm-btn-primary" onClick={handleAdd} disabled={addLoading}>
              {addLoading ? "Adding…" : `Add ${title}`}
            </button>
          </div>
        </div>

        {/* REMOVE CARD */}
        <div className="role-card">
          <div className="role-card-header" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
            <span style={{ fontSize: "1.4rem" }}>🗑️</span>
            <span>Remove {title}</span>
          </div>
          <div className="role-card-body">
            <div className="adm-field-group">
              <label className="adm-field-label">Email Address</label>
              <input
                className="adm-input"
                type="email"
                placeholder="user@example.com"
                value={delEmail}
                onChange={e => setDelEmail(e.target.value)}
              />
            </div>

            {delMsg.text && (
              <div className={delMsg.ok ? "adm-msg-ok" : "adm-msg-err"}>
                {delMsg.ok ? "✅" : "⚠️"} {delMsg.text}
              </div>
            )}

            <button className="adm-btn-danger" onClick={handleRemove} disabled={delLoading}>
              {delLoading ? "Removing…" : `Remove ${title}`}
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      {list.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
            Current {title}s ({list.length})
          </h3>
          <div className="role-list">
            {list.map((item, i) => (
              <div key={i} className="role-list-item">
                <div className="role-list-avatar">
                  {(item.name || item.email || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{item.name || "—"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{item.email}</div>
                  {item.floor_number && (
                    <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, marginTop: 2 }}>
                      🏢 Floor {item.floor_number}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Fees Panel ─── */
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

function FeesPanel() {
  const [fees, setFees]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res  = await fetch(`${API}/fees/get/fees`, { credentials: "include" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        setFees(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const filtered = fees.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.phone_no?.includes(search)
  );

  const totalAmount = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  return (
    <div className="adm-panel">
      {/* Header */}
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
        💰 Student Fees Record
      </h2>
      <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: 22 }}>All fee transactions recorded in the system</p>

      {/* Summary chips */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700 }}>
            📋 {fees.length} Transactions
          </span>
          <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 14px", fontSize: "0.72rem", fontWeight: 700 }}>
            💵 ₹{totalAmount.toLocaleString()} Collected
          </span>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: "0.95rem", pointerEvents: "none" }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="adm-input"
          style={{ paddingLeft: 38 }}
        />
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          Loading fee records…
        </div>
      )}
      {!loading && error && (
        <div className="adm-msg-err">⚠️ {error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>💸</div>
          {search ? "No records match your search." : "No fee records found."}
        </div>
      )}

      {/* Desktop table */}
      {!loading && !error && filtered.length > 0 && (
        <>
          {/* Table — hidden on mobile */}
          <div style={{ overflowX: "auto", borderRadius: 16, boxShadow: "0 2px 16px rgba(15,23,42,0.07)", display: "block" }} className="fees-table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 16, overflow: "hidden", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f8faff" }}>
                  {["Student", "Phone", "Amount", "Months Paid", "Paid Date", "Expires"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8faff", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
                          {f.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{f.name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#64748b", whiteSpace: "nowrap" }}>{f.phone_no || "—"}</td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: 700, color: "#16a34a" }}>₹{Number(f.amount).toLocaleString()}</span>
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "3px 11px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid #bfdbfe" }}>
                        {f.months_paid} {f.months_paid === 1 ? "month" : "months"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#64748b", whiteSpace: "nowrap", fontSize: "0.83rem" }}>{formatDate(f.paid_date)}</td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      {f.expire_date ? (
                        <span style={{
                          background: new Date(f.expire_date) < new Date() ? "#fef2f2" : "#f0fdf4",
                          color:      new Date(f.expire_date) < new Date() ? "#dc2626"  : "#16a34a",
                          border:     `1px solid ${new Date(f.expire_date) < new Date() ? "#fecaca" : "#bbf7d0"}`,
                          borderRadius: 20, padding: "3px 11px", fontSize: "0.75rem", fontWeight: 700,
                        }}>
                          {new Date(f.expire_date) < new Date() ? "⚠️ " : "✅ "}{formatDate(f.expire_date)}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — shown only on small screens */}
          <div className="fees-cards" style={{ display: "none", flexDirection: "column", gap: 12 }}>
            {filtered.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(15,23,42,0.06)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Name row */}
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.95rem", flexShrink: 0 }}>
                    {f.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>{f.name || "—"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>📞 {f.phone_no || "—"}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontWeight: 800, color: "#16a34a", fontSize: "1rem" }}>
                    ₹{Number(f.amount).toLocaleString()}
                  </div>
                </div>
                {/* Detail row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "3px 11px", fontSize: "0.72rem", fontWeight: 700, border: "1px solid #bfdbfe" }}>
                    🗓 {f.months_paid} {f.months_paid === 1 ? "month" : "months"}
                  </span>
                  <span style={{ background: "#f8faff", color: "#64748b", borderRadius: 20, padding: "3px 11px", fontSize: "0.72rem", fontWeight: 600, border: "1px solid #e0e7ff" }}>
                    Paid: {formatDate(f.paid_date)}
                  </span>
                  {f.expire_date && (
                    <span style={{
                      background: new Date(f.expire_date) < new Date() ? "#fef2f2" : "#f0fdf4",
                      color:      new Date(f.expire_date) < new Date() ? "#dc2626"  : "#16a34a",
                      border:     `1px solid ${new Date(f.expire_date) < new Date() ? "#fecaca" : "#bbf7d0"}`,
                      borderRadius: 20, padding: "3px 11px", fontSize: "0.72rem", fontWeight: 700,
                    }}>
                      {new Date(f.expire_date) < new Date() ? "⚠️ Expired" : "✅ Valid"} · {formatDate(f.expire_date)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .fees-table-wrap { display: block; }
        .fees-cards      { display: none !important; }
        @media (max-width: 640px) {
          .fees-table-wrap { display: none !important; }
          .fees-cards      { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin]             = useState(null);
  const [checking, setChecking]       = useState(true);
  const [active, setActive]           = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const res  = await fetch(`${API}/auth/user`, { credentials: "include" });
        const data = await res.json();
        if (!data.user || data.user.role !== "admin") { navigate("/"); return; }
        setAdmin(data.user);
        setChecking(false);
        setTimeout(() => setMounted(true), 50);
      } catch { navigate("/"); }
    };
    verify();
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { credentials: "include" });
    navigate("/");
  };

  const handleNav = (key) => { setActive(key); setMobileOpen(false); };

  if (checking) return null;

  const currentItem = SIDEBAR_ITEMS.find(i => i.key === active);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", minHeight: "100vh", background: "#f0f4ff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-sidebar {
          width: 240px; background: #0f172a;
          display: flex; flex-direction: column; flex-shrink: 0;
          transition: width 0.3s cubic-bezier(.4,0,.2,1);
          position: sticky; top: 0; height: 100vh; z-index: 20;
        }
        .adm-sidebar.collapsed { width: 68px; }
        @media (max-width: 767px) {
          .adm-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0;
            width: 240px !important; height: 100vh;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(.4,0,.2,1);
            z-index: 50;
          }
          .adm-sidebar.mobile-open { transform: translateX(0); }
          .desktop-toggle { display: none !important; }
        }

        .adm-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.45); backdrop-filter: blur(2px); z-index: 40;
        }
        @media (max-width: 767px) { .adm-overlay.visible { display: block; } }

        .adm-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          overflow: hidden; white-space: nowrap; flex-shrink: 0;
        }

        .adm-nav-item {
          display: flex; align-items: center; gap: 13px;
          padding: 12px 16px; cursor: pointer;
          border-left: 3px solid transparent;
          white-space: nowrap; overflow: hidden;
          color: #94a3b8; font-size: 0.88rem; font-weight: 500;
          transition: background 0.18s, color 0.18s;
        }
        .adm-nav-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .adm-nav-item.active { background: rgba(37,99,235,0.15); border-left-color: #2563eb; color: #60a5fa; }
        .adm-nav-icon { font-size: 1.05rem; flex-shrink: 0; width: 20px; text-align: center; }
        .adm-nav-label { transition: opacity 0.2s; }
        .collapsed .adm-nav-label { opacity: 0; width: 0; overflow: hidden; pointer-events: none; }

        .adm-main {
          flex: 1; min-width: 0; display: flex; flex-direction: column;
          opacity: 0; transform: translateX(16px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .adm-main.mounted { opacity: 1; transform: translateX(0); }

        .adm-topbar {
          background: #fff; border-bottom: 1px solid #e8edf5;
          height: 62px; padding: 0 22px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-shrink: 0;
          position: sticky; top: 0; z-index: 10;
        }

        .adm-hamburger {
          display: none; background: #f1f5f9; border: none; border-radius: 9px;
          width: 36px; height: 36px; align-items: center; justify-content: center;
          cursor: pointer; font-size: 1rem; color: #374151; flex-shrink: 0;
        }
        @media (max-width: 767px) { .adm-hamburger { display: flex; } }

        .adm-page { flex: 1; overflow-y: auto; padding: 26px 22px; }
        @media (max-width: 480px) { .adm-page { padding: 18px 12px; } }

        .adm-panel { animation: adm-in 0.26s cubic-bezier(.4,0,.2,1); }
        @keyframes adm-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Profile */
        .adm-profile-card {
          background: #fff; border-radius: 20px; padding: 34px;
          max-width: 500px; box-shadow: 0 4px 24px rgba(15,23,42,0.07);
        }
        @media (max-width: 480px) { .adm-profile-card { padding: 22px 16px; border-radius: 14px; } }

        .adm-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg,#2563eb,#6366f1);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.8rem; font-weight: 800;
          font-family: 'Sora', sans-serif; margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(37,99,235,0.22);
        }

        .adm-field { display: flex; flex-direction: column; gap: 4px; padding: 13px 0; border-bottom: 1px solid #f1f5f9; }
        .adm-field:last-child { border-bottom: none; }
        .adm-field-label { font-size: 0.68rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
        .adm-field-value { font-size: 0.96rem; font-weight: 600; color: #0f172a; word-break: break-all; }

        /* Role management */
        .role-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        @media (max-width: 640px) { .role-grid { grid-template-columns: 1fr; } }

        .role-card {
          background: #fff; border-radius: 18px;
          box-shadow: 0 2px 16px rgba(15,23,42,0.07);
          overflow: hidden;
        }

        .role-card-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px;
          color: #fff; font-weight: 700; font-size: 0.95rem;
          font-family: 'Sora', sans-serif;
        }

        .role-card-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

        .adm-field-group { display: flex; flex-direction: column; gap: 6px; }

        .adm-input {
          width: 100%; padding: 11px 13px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          color: #0f172a; background: #f8faff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .adm-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: #fff; }
        .adm-input::placeholder { color: #cbd5e1; }

        .adm-btn-primary {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg,#2563eb,#4f46e5);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
        }
        .adm-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .adm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .adm-btn-danger {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg,#dc2626,#b91c1c);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
        }
        .adm-btn-danger:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .adm-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

        .adm-msg-ok {
          background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;
          border-radius: 8px; padding: 9px 12px; font-size: 0.82rem; font-weight: 500;
        }
        .adm-msg-err {
          background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
          border-radius: 8px; padding: 9px 12px; font-size: 0.82rem; font-weight: 500;
        }

        /* Role list */
        .role-list { display: flex; flex-direction: column; gap: 10px; }
        .role-list-item {
          display: flex; align-items: center; gap: 14px;
          background: #fff; border-radius: 12px; padding: 14px 16px;
          box-shadow: 0 1px 8px rgba(15,23,42,0.05);
        }
        .role-list-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg,#2563eb,#6366f1);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.9rem; font-weight: 700; flex-shrink: 0;
        }

        /* Coming soon */
        .adm-coming {
          background: #fff; border-radius: 20px; padding: 50px 32px;
          text-align: center; box-shadow: 0 4px 24px rgba(15,23,42,0.07);
          max-width: 440px; width: 100%;
        }
        @media (max-width: 480px) { .adm-coming { padding: 36px 20px; } }

        /* Misc */
        .adm-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;
          border-radius: 20px; padding: 3px 11px;
          font-size: 0.71rem; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap;
        }
        @media (max-width: 500px) { .adm-badge-topbar { display: none !important; } }

        .adm-toggle-btn {
          background: rgba(255,255,255,0.08); border: none; color: #94a3b8;
          cursor: pointer; width: 28px; height: 28px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; transition: background 0.2s, color 0.2s; flex-shrink: 0;
        }
        .adm-toggle-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

        .adm-logout-btn {
          background: none; border: 1.5px solid #e2e8f0; color: #64748b;
          border-radius: 9px; padding: 6px 13px;
          font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .adm-logout-btn:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
        @media (max-width: 480px) { .adm-logout-btn { display: none; } }

        .adm-avatar-pill {
          display: flex; align-items: center; gap: 7px;
          background: #f8faff; border-radius: 30px; padding: 5px 11px;
        }
        .adm-avatar-sm {
          width: 25px; height: 25px; border-radius: 50%;
          background: linear-gradient(135deg,#2563eb,#6366f1);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
        }
        @media (max-width: 360px) { .adm-avatar-name { display: none; } }
      `}</style>

      {/* Overlay */}
      <div className={`adm-overlay ${mobileOpen ? "visible" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? "" : "collapsed"} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="adm-logo">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.9rem", fontWeight: 800, flexShrink: 0 }}>S</div>
          {(sidebarOpen || mobileOpen) && (
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#fff" }}>UniStay</span>
          )}
          <button className="adm-toggle-btn desktop-toggle" style={{ marginLeft: "auto" }} onClick={() => setSidebarOpen(p => !p)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <div style={{ flex: 1, padding: "10px 0", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {SIDEBAR_ITEMS.map(item => (
            <div key={item.key} className={`adm-nav-item ${active === item.key ? "active" : ""}`} onClick={() => handleNav(item.key)}>
              <span className="adm-nav-icon">{item.icon}</span>
              <span className="adm-nav-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div className="adm-nav-item" style={{ color: "#f87171" }} onClick={handleLogout}>
            <span className="adm-nav-icon">🚪</span>
            <span className="adm-nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={`adm-main ${mounted ? "mounted" : ""}`}>

        {/* Topbar */}
        <header className="adm-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button className="adm-hamburger" onClick={() => setMobileOpen(p => !p)}>☰</button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentItem?.icon} {currentItem?.label}
              </div>
              <div style={{ fontSize: "0.73rem", color: "#94a3b8", marginTop: 1 }}>UniStay Admin Panel</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span className="adm-badge adm-badge-topbar">🛡️ Admin</span>
            <div className="adm-avatar-pill">
              <div className="adm-avatar-sm">{admin?.name?.charAt(0)?.toUpperCase()}</div>
              <span className="adm-avatar-name" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
                {admin?.name?.split(" ")[0]}
              </span>
            </div>
            <button className="adm-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <div className="adm-page">

          {/* PROFILE */}
          {active === "profile" && (
            <div className="adm-panel">
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>
                Admin Profile
              </h2>
              <div className="adm-profile-card">
                <div className="adm-avatar">{admin?.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{admin?.name}</span>
                  <div style={{ marginTop: 8 }}>
                    <span className="adm-badge" style={{ display: "inline-flex" }}>🛡️ Administrator</span>
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <div className="adm-field">
                    <span className="adm-field-label">Full Name</span>
                    <span className="adm-field-value">{admin?.name || "—"}</span>
                  </div>
                  <div className="adm-field">
                    <span className="adm-field-label">Email Address</span>
                    <span className="adm-field-value">{admin?.email || "—"}</span>
                  </div>
                  <div className="adm-field">
                    <span className="adm-field-label">Phone Number</span>
                    <span className="adm-field-value">{admin?.phone || "—"}</span>
                  </div>
                  <div className="adm-field">
                    <span className="adm-field-label">Role</span>
                    <span className="adm-field-value" style={{ color: "#2563eb" }}>Administrator</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WARDENS */}
          {active === "warden" && (
            <RolePanel
              title="Warden"
              icon="🏠"
              addEndpoint="/warden"
              removeEndpoint="/warden"
              extraFields={[
                { name: "floor", label: "Floor Number", type: "number", placeholder: "e.g. 1" }
              ]}
            />
          )}

          {/* COOKS */}
          {active === "cook" && (
            <RolePanel
              title="Cook"
              icon="🍽️"
              addEndpoint="/cook"
              removeEndpoint="/cook"
            />
          )}

         {/* FLOORS */}
{active === "floors" && <FloorPanel />}

{/* ROOMS */}
{active === "rooms" && <RoomPanel />}

{/* STUDENTS */}
{active === "student" && (
  <RolePanel
    title="Student"
    icon="🎓"
    addEndpoint="/student"
    removeEndpoint="/student"
    listKey="students"
  />
)}

{/* FEES */}
{active === "fees" && <FeesPanel />}

        </div>
      </div>
    </div>
  );
}