import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";

const SIDEBAR_ITEMS = [
  { key: "menu",    icon: "🍽️", label: "Meal Menu" },
  { key: "student", icon: "🎓", label: "Students" },
];

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Evening Snacks"];

/* ── Countdown Banner ── */
function CountdownBanner({ menu, onExpire }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!menu) return;
    const tick = () => {
      const diff = new Date(menu.expiry_time) - Date.now();
      if (diff <= 0) { setRemaining(0); onExpire?.(); return; }
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [menu]);

  if (!menu || remaining === null) return null;

  const expired = remaining <= 0;
  const totalSec = Math.floor(remaining / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  const fmt = n => String(n).padStart(2, "0");
  const pct = expired ? 0 : Math.min(
    100,
    (remaining / (new Date(menu.expiry_time) - new Date(menu.date + "T00:00:00"))) * 100
  );

  return (
    <div className={`ck-banner ${expired ? "expired" : ""}`}>
      <div className="ck-banner-inner">
        <div className="ck-banner-left">
          <div className="ck-banner-icon">{expired ? "⏰" : "🔴"}</div>
          <div>
            <div className="ck-banner-meal">{menu.meal}</div>
            <div className="ck-banner-sub">{expired ? "Display has ended" : "Menu is live for students"}</div>
          </div>
        </div>
        {!expired && (
          <div className="ck-timer">
            <span className="ck-timer-digit">{fmt(hh)}</span>
            <span className="ck-timer-sep">:</span>
            <span className="ck-timer-digit">{fmt(mm)}</span>
            <span className="ck-timer-sep">:</span>
            <span className="ck-timer-digit">{fmt(ss)}</span>
          </div>
        )}
        {expired && <div className="ck-expired-badge">Expired</div>}
      </div>
      {!expired && (
        <div className="ck-progress-bar">
          <div className="ck-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

/* ── Dish Card ── */
function DishCard({ dish, onDelete }) {
  return (
    <div className="ck-dish-card">
      {dish.photo_url
        ? <img src={dish.photo_url} alt={dish.dish_name} className="ck-dish-img" />
        : <div className="ck-dish-img-placeholder">🍲</div>
      }
      <div className="ck-dish-info">
        <span className="ck-dish-name">{dish.dish_name}</span>
        <span className={`ck-dish-badge ${dish.is_nonveg ? "nonveg" : "veg"}`}>
          {dish.is_nonveg ? "🔴 Non-Veg" : "🟢 Veg"}
        </span>
        <button className="ck-dish-delete" onClick={() => onDelete(dish.id)}>✕ Remove</button>
      </div>
    </div>
  );
}

/* ── Menu Panel ── */
function MenuPanel({ cook }) {
  const [step, setStep]               = useState("select");
  const [meal, setMeal]               = useState("");
  const [hours, setHours]             = useState(1);
  const [minutes, setMinutes]         = useState(0);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [dishes, setDishes]           = useState([]);
  const [dishForm, setDishForm]       = useState({ dish: "", nonveg: "false" });
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [msg, setMsg]                 = useState({ text: "", ok: true });
  const [loading, setLoading]         = useState(false);
  const fileRef = useRef();

  useEffect(() => { checkActiveMenu(); }, []);

  const checkActiveMenu = async () => {
    try {
      const res = await fetch(`${API}/food/menu/active`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.menu) { setCurrentMenu(data.menu); fetchDishes(data.menu.id); setStep("live"); }
      }
    } catch {}
  };

  const fetchDishes = async (menuId) => {
    try {
      const res = await fetch(`${API}/food/dishes/${menuId}`, { credentials: "include" });
      if (res.ok) { const data = await res.json(); setDishes(data.dishes || []); }
    } catch {}
  };

  const handleCreateMenu = async () => {
    if (!meal) { setMsg({ text: "Please select a meal type", ok: false }); return; }
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 5) { setMsg({ text: "Minimum duration is 5 minutes", ok: false }); return; }
    setLoading(true); setMsg({ text: "", ok: true });
    try {
      const res = await fetch(`${API}/food/menu`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ meal, duration: totalMinutes, unit: "minutes" }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ text: data.error || "Failed to create menu", ok: false }); return; }
      setCurrentMenu(data.data); setDishes([]); setStep("live"); setMsg({ text: "", ok: true });
    } catch { setMsg({ text: "Cannot reach server", ok: false }); }
    finally { setLoading(false); }
  };

  const handleAddDish = async () => {
    if (!dishForm.dish.trim()) { setMsg({ text: "Dish name is required", ok: false }); return; }
    setLoading(true); setMsg({ text: "", ok: true });
    try {
      let photoUrl = null;
      if (photoFile) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        fd.append("menuId", currentMenu.id);
        const uploadRes = await fetch(`${API}/food/dish-photo`, { method: "POST", credentials: "include", body: fd });
        if (uploadRes.ok) { const uploadData = await uploadRes.json(); photoUrl = uploadData.url; }
      }
      const res = await fetch(`${API}/food/dish`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dish: dishForm.dish, nonveg: dishForm.nonveg === "true", meal: currentMenu.meal, menuId: currentMenu.id, photo_url: photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ text: data.error || "Failed to add dish", ok: false }); return; }
      setMsg({ text: `"${dishForm.dish}" added!`, ok: true });
      setDishForm({ dish: "", nonveg: "false" });
      setPhotoFile(null); setPhotoPreview(null);
      fetchDishes(currentMenu.id);
    } catch { setMsg({ text: "Cannot reach server", ok: false }); }
    finally { setLoading(false); }
  };
const handleDeleteDish = async (dishId) => {
  if (!window.confirm("Remove this dish?")) return;
  try {
    await fetch(`${API}/food/dish/${dishId}`, { method: "DELETE", credentials: "include" });
    fetchDishes(currentMenu.id);
  } catch { setMsg({ text: "Could not remove dish", ok: false }); }
};
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleExpire = () => { setStep("select"); setCurrentMenu(null); setDishes([]); setMeal(""); };

  const handleEndEarly = async () => {
    if (!window.confirm("End this meal display now?")) return;
    try { await fetch(`${API}/food/menu/${currentMenu.id}/end`, { method: "PATCH", credentials: "include" }); } catch {}
    handleExpire();
  };

  return (
    <div className="ck-panel">
      {currentMenu && step === "live" && <CountdownBanner menu={currentMenu} onExpire={handleExpire} />}

      {/* STEP: SELECT MEAL */}
      {step === "select" && (
        <div className="ck-section">
          <h2 className="ck-section-title">🍽️ Choose Meal Type</h2>
          <p className="ck-section-sub">Select which meal you're preparing for students today.</p>
          <div className="ck-meal-grid">
            {MEAL_OPTIONS.map(m => (
              <button key={m} className={`ck-meal-btn ${meal === m ? "active" : ""}`} onClick={() => setMeal(m)}>
                <span className="ck-meal-icon">
                  {m === "Breakfast" ? "🌅" : m === "Lunch" ? "☀️" : m === "Dinner" ? "🌙" : "🫖"}
                </span>
                <span>{m}</span>
              </button>
            ))}
          </div>
          {meal && (
            <button className="ck-btn-primary" style={{ marginTop: 24 }} onClick={() => setStep("timer")}>
              Set Timer for {meal} →
            </button>
          )}
        </div>
      )}

      {/* STEP: SET TIMER */}
      {step === "timer" && (
        <div className="ck-section">
          <button className="ck-back-btn" onClick={() => setStep("select")}>← Back</button>
          <h2 className="ck-section-title">⏱ Set Display Duration</h2>
          <p className="ck-section-sub">The menu will be visible to students for this duration.</p>
          <div className="ck-timer-setup">
            <div className="ck-time-field">
              <label className="ck-label">Hours</label>
              <div className="ck-stepper">
                <button className="ck-step-btn" onClick={() => setHours(h => Math.max(0, h - 1))}>−</button>
                <span className="ck-step-val">{String(hours).padStart(2, "0")}</span>
                <button className="ck-step-btn" onClick={() => setHours(h => Math.min(23, h + 1))}>+</button>
              </div>
            </div>
            <div className="ck-time-sep">:</div>
            <div className="ck-time-field">
              <label className="ck-label">Minutes</label>
              <div className="ck-stepper">
                <button className="ck-step-btn" onClick={() => setMinutes(m => Math.max(0, m - 5))}>−</button>
                <span className="ck-step-val">{String(minutes).padStart(2, "0")}</span>
                <button className="ck-step-btn" onClick={() => setMinutes(m => Math.min(55, m + 5))}>+</button>
              </div>
            </div>
          </div>
          <div className="ck-duration-preview">
            Menu will display for <strong>{hours > 0 ? `${hours}h ` : ""}{minutes > 0 ? `${minutes}m` : hours === 0 ? "0m" : ""}</strong>
          </div>
          {msg.text && <div className={msg.ok ? "ck-msg-ok" : "ck-msg-err"}>{msg.ok ? "✅" : "⚠️"} {msg.text}</div>}
          <button className="ck-btn-primary" onClick={handleCreateMenu} disabled={loading}>
            {loading ? "Creating…" : `Start ${meal} Menu`}
          </button>
        </div>
      )}

      {/* STEP: LIVE */}
      {step === "live" && currentMenu && (
        <div className="ck-section">
          <div className="ck-live-header">
            <h2 className="ck-section-title" style={{ marginBottom: 0 }}>Add Dishes to {currentMenu.meal}</h2>
            <button className="ck-end-btn" onClick={handleEndEarly}>End Display</button>
          </div>

          <div className="ck-dish-form">
            <div className="ck-form-row">
              <div className="ck-field">
                <label className="ck-label">Dish Name</label>
                <input className="ck-input" placeholder="e.g. Rajma Chawal"
                  value={dishForm.dish} onChange={e => setDishForm(p => ({ ...p, dish: e.target.value }))} />
              </div>
              <div className="ck-field ck-field-type">
                <label className="ck-label">Type</label>
                <select className="ck-input" value={dishForm.nonveg}
                  onChange={e => setDishForm(p => ({ ...p, nonveg: e.target.value }))}>
                  <option value="false">🟢 Veg</option>
                  <option value="true">🔴 Non-Veg</option>
                </select>
              </div>
            </div>
            <div className="ck-field" style={{ marginTop: 14 }}>
              <label className="ck-label">Dish Photo <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
              <div className="ck-upload-row">
                <button className="ck-upload-btn" onClick={() => fileRef.current.click()}>
                  📷 {photoFile ? "Change Photo" : "Upload Photo"}
                </button>
                {photoPreview && <img src={photoPreview} alt="preview" className="ck-photo-preview" />}
                {photoFile && (
                  <button className="ck-remove-photo" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>✕ Remove</button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
            </div>
            {msg.text && <div className={msg.ok ? "ck-msg-ok" : "ck-msg-err"} style={{ marginTop: 12 }}>{msg.ok ? "✅" : "⚠️"} {msg.text}</div>}
            <button className="ck-btn-primary" style={{ marginTop: 16 }} onClick={handleAddDish} disabled={loading}>
              {loading ? "Adding…" : "Add Dish +"}
            </button>
          </div>

          {dishes.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 className="ck-dishes-heading">Today's {currentMenu.meal} Menu ({dishes.length} dishes)</h3>
              <div className="ck-dishes-grid">
                {dishes.map((d, i) => <DishCard key={i} dish={d} onDelete={handleDeleteDish} />)}
              </div>
            </div>
          )}
          {dishes.length === 0 && (
            <div className="ck-empty-dishes">
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🍴</div>
              <p>No dishes added yet. Add your first dish above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════ MAIN COMPONENT ════ */
export default function CookDashboard() {
  const navigate = useNavigate();
  const [cook, setCook]               = useState(null);
  const [active, setActive]           = useState("menu");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); fetchCook(); }, []);

  // Close sidebar on small screens by default
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) setSidebarOpen(false);
    const handler = (e) => { if (e.matches) { setSidebarOpen(false); setMobileOpen(false); } };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const fetchCook = async () => {
    try {
      const res = await fetch(`${API}/auth/user`, { credentials: "include" });
      const data = await res.json();
      if (data.user) setCook(data.user);
      else navigate("/");
    } catch { navigate("/"); }
  };

  const handleLogout = async () => {
    try { await fetch(`${API}/auth/logout`, { method: "GET", credentials: "include" }); } catch {}
    navigate("/");
  };

  const handleNav = (key) => { setActive(key); setMobileOpen(false); };
  const currentItem = SIDEBAR_ITEMS.find(i => i.key === active);

  return (
    <div className="ck-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ─── ROOT ─── */
        .ck-root {
          display: flex;
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow-x: hidden;
        }

        /* ─── SIDEBAR ─── */
        .ck-sidebar {
          width: 220px;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 200;
          overflow: hidden;
        }
        .ck-sidebar.collapsed { width: 60px; }

        .ck-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          min-height: 60px;
          flex-shrink: 0;
        }
        .ck-logo-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.85rem; font-weight: 800;
          flex-shrink: 0;
        }
        .ck-logo-text {
          font-family: 'Sora', sans-serif;
          font-weight: 800; font-size: 0.98rem; color: #fff;
          white-space: nowrap; overflow: hidden;
          transition: opacity 0.2s, width 0.2s;
        }
        .ck-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; cursor: pointer;
          color: #94a3b8; font-size: 0.88rem; font-weight: 500;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .ck-nav-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .ck-nav-item.active { background: rgba(22,163,74,0.18); color: #4ade80; font-weight: 600; }
        .ck-nav-icon { font-size: 1.1rem; flex-shrink: 0; width: 22px; text-align: center; }
        .ck-nav-label { transition: opacity 0.2s; }
        /* WITH this: */
        .ck-sidebar.collapsed:not(.mobile-open) .ck-nav-label,
        .ck-sidebar.collapsed:not(.mobile-open) .ck-logo-text {
         opacity: 0; width: 0; overflow: hidden;
         }

        .ck-toggle-btn {
          background: rgba(255,255,255,0.07); border: none; color: #94a3b8;
          cursor: pointer; width: 26px; height: 26px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; transition: all 0.2s; flex-shrink: 0; margin-left: auto;
        }
        .ck-toggle-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

        /* ─── MAIN ─── */
        .ck-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.3s ease, transform 0.3s ease, margin-left 0.25s;
          /* Desktop: offset by sidebar width */
          margin-left: 220px;
          min-width: 0;
        }
        .ck-main.mounted { opacity: 1; transform: translateY(0); }
        .ck-sidebar.collapsed ~ .ck-main { margin-left: 60px; }

        /* ─── TOPBAR ─── */
        .ck-topbar {
          background: #fff;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid #e2e8f0;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          gap: 12px;
          flex-shrink: 0;
        }
        .ck-topbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .ck-topbar-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem; font-weight: 800; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ck-topbar-sub { font-size: 0.72rem; color: #94a3b8; }
        .ck-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .ck-hamburger {
          display: none;
          background: none; border: none;
          font-size: 1.25rem; cursor: pointer;
          color: #374151; padding: 4px 6px;
          border-radius: 8px; flex-shrink: 0;
          transition: background 0.15s;
        }
        .ck-hamburger:hover { background: #f1f5f9; }

        /* Overlay behind mobile sidebar */
        .ck-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 190;
          backdrop-filter: blur(2px);
        }
        .ck-overlay.visible { display: block; }

        .ck-avatar-pill {
          display: flex; align-items: center; gap: 7px;
          background: #f0fdf4; border-radius: 30px; padding: 5px 11px;
        }
        .ck-avatar-sm {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #15803d);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.72rem; font-weight: 700; flex-shrink: 0;
        }
        .ck-badge {
          background: #f0fdf4; color: #16a34a;
          border: 1px solid #bbf7d0; border-radius: 20px;
          padding: 3px 12px; font-size: 0.74rem; font-weight: 700;
          white-space: nowrap;
        }
        .ck-logout-btn {
          background: none; border: 1.5px solid #e2e8f0; color: #64748b;
          border-radius: 9px; padding: 6px 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.83rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .ck-logout-btn:hover { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

        /* ─── PAGE ─── */
        .ck-page { padding: 28px; flex: 1; }

        /* ─── PANEL ─── */
        .ck-panel { max-width: 800px; display: flex; flex-direction: column; gap: 24px; }

        /* ─── BANNER ─── */
        .ck-banner {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #16a34a; overflow: hidden;
          box-shadow: 0 4px 20px rgba(22,163,74,0.12);
        }
        .ck-banner.expired { border-color: #e5e7eb; box-shadow: none; }
        .ck-banner-inner {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 18px 22px; gap: 12px;
          flex-wrap: wrap;
        }
        .ck-banner-left { display: flex; align-items: center; gap: 12px; }
        .ck-banner-icon { font-size: 1.6rem; flex-shrink: 0; }
        .ck-banner-meal { font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.1rem; color: #0f172a; }
        .ck-banner-sub { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
        .ck-timer {
          display: flex; align-items: center; gap: 4px;
          background: #0f172a; border-radius: 12px;
          padding: 10px 16px; flex-shrink: 0;
        }
        .ck-timer-digit {
          font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800;
          color: #4ade80; letter-spacing: 0.04em;
          min-width: 2ch; text-align: center;
        }
        .ck-timer-sep { color: #4ade80; font-size: 1.3rem; font-weight: 700; margin: 0 2px; }
        .ck-expired-badge {
          background: #f1f5f9; color: #94a3b8;
          border-radius: 20px; padding: 6px 16px;
          font-size: 0.82rem; font-weight: 700;
        }
        .ck-progress-bar { height: 4px; background: #dcfce7; }
        .ck-progress-fill { height: 100%; background: #16a34a; transition: width 1s linear; }

        /* ─── SECTION ─── */
        .ck-section {
          background: #fff; border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .ck-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 6px;
        }
        .ck-section-sub { font-size: 0.85rem; color: #64748b; margin-bottom: 24px; }

        .ck-back-btn {
          background: none; border: none; color: #64748b;
          font-size: 0.85rem; cursor: pointer; padding: 0;
          margin-bottom: 18px; font-family: inherit; font-weight: 600;
          display: flex; align-items: center; gap: 4px;
        }
        .ck-back-btn:hover { color: #0f172a; }

        /* Live header */
        .ck-live-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 24px; gap: 12px;
          flex-wrap: wrap;
        }

        /* ─── MEAL GRID ─── */
        .ck-meal-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .ck-meal-btn {
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
          padding: 20px 14px;
          border: 2px solid #e2e8f0; border-radius: 14px;
          background: #f8faff; cursor: pointer;
          font-family: inherit; font-size: 0.9rem;
          font-weight: 600; color: #374151;
          transition: all 0.18s;
        }
        .ck-meal-btn:hover { border-color: #16a34a; background: #f0fdf4; color: #15803d; }
        .ck-meal-btn.active {
          border-color: #16a34a; background: #f0fdf4;
          color: #15803d; box-shadow: 0 0 0 3px rgba(22,163,74,0.15);
        }
        .ck-meal-icon { font-size: 1.8rem; }

        /* ─── TIMER SETUP ─── */
        .ck-timer-setup {
          display: flex; align-items: flex-end; gap: 12px;
          justify-content: center; margin: 28px 0;
          flex-wrap: wrap;
        }
        .ck-time-field { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ck-time-sep { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .ck-label {
          font-size: 0.75rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .ck-stepper {
          display: flex; align-items: center;
          border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;
        }
        .ck-step-btn {
          background: #f8faff; border: none;
          width: 40px; height: 52px;
          font-size: 1.2rem; cursor: pointer; color: #374151;
          transition: background 0.15s; font-family: inherit;
        }
        .ck-step-btn:hover { background: #e2e8f0; }
        .ck-step-val {
          font-family: 'Sora', sans-serif; font-size: 1.6rem; font-weight: 800;
          color: #0f172a; width: 56px; text-align: center;
          background: #fff; padding: 10px 0;
        }
        .ck-duration-preview {
          text-align: center; font-size: 0.88rem; color: #64748b; margin-bottom: 24px;
        }
        .ck-duration-preview strong { color: #0f172a; }

        /* ─── BUTTONS ─── */
        .ck-btn-primary {
          background: #16a34a; color: #fff; border: none;
          border-radius: 12px; padding: 13px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          cursor: pointer; transition: background 0.18s, transform 0.12s;
          width: 100%;
        }
        .ck-btn-primary:hover { background: #15803d; }
        .ck-btn-primary:active { transform: scale(0.98); }
        .ck-btn-primary:disabled { background: #86efac; cursor: not-allowed; }

        .ck-end-btn {
          background: #fef2f2; color: #dc2626;
          border: 1.5px solid #fecaca; border-radius: 9px;
          padding: 7px 14px; font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.18s;
          font-family: inherit; white-space: nowrap; flex-shrink: 0;
        }
        .ck-end-btn:hover { background: #fee2e2; }

        /* ─── DISH FORM ─── */
        .ck-dish-form {
          background: #f8faff; border-radius: 12px;
          padding: 20px; border: 1.5px solid #e2e8f0;
        }
        .ck-form-row { display: flex; gap: 14px; }
        .ck-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .ck-field-type { flex: 0 0 150px; }
        .ck-input {
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 10px 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; color: #0f172a;
          background: #fff; outline: none;
          transition: border-color 0.18s;
          width: 100%;
        }
        .ck-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }

        .ck-upload-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ck-upload-btn {
          background: #fff; border: 1.5px dashed #d1d5db; border-radius: 10px;
          padding: 9px 16px; font-size: 0.85rem; font-weight: 600; color: #374151;
          cursor: pointer; font-family: inherit; transition: border-color 0.18s;
        }
        .ck-upload-btn:hover { border-color: #16a34a; color: #16a34a; }
        .ck-photo-preview {
          width: 50px; height: 50px; border-radius: 10px;
          object-fit: cover; border: 2px solid #e2e8f0;
        }
        .ck-remove-photo {
          background: none; border: none; color: #94a3b8;
          font-size: 0.8rem; cursor: pointer; font-family: inherit; font-weight: 600;
        }
        .ck-remove-photo:hover { color: #dc2626; }

        /* ─── MESSAGES ─── */
        .ck-msg-ok {
          background: #f0fdf4; color: #16a34a;
          border-radius: 9px; padding: 10px 14px;
          font-size: 0.85rem; font-weight: 600;
        }
        .ck-msg-err {
          background: #fef2f2; color: #dc2626;
          border-radius: 9px; padding: 10px 14px;
          font-size: 0.85rem; font-weight: 600;
        }

        /* ─── DISHES ─── */
        .ck-dishes-heading {
          font-family: 'Sora', sans-serif; font-weight: 700;
          font-size: 0.95rem; color: #0f172a; margin-bottom: 14px;
        }
        .ck-dishes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
        }
        .ck-dish-card {
          background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .ck-dish-img { width: 100%; height: 110px; object-fit: cover; }
        .ck-dish-img-placeholder {
          width: 100%; height: 110px; background: #f1f5f9;
          display: flex; align-items: center; justify-content: center; font-size: 2.5rem;
        }
        .ck-dish-info { padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
        .ck-dish-name { font-weight: 700; font-size: 0.88rem; color: #0f172a; }
        .ck-dish-badge {
          font-size: 0.72rem; font-weight: 700;
          border-radius: 20px; padding: 2px 8px; width: fit-content;
        }
        .ck-dish-badge.veg { background: #f0fdf4; color: #16a34a; }
        .ck-dish-badge.nonveg { background: #fff1f2; color: #e11d48; }
        .ck-dish-delete {
          margin-top: 4px; width: 100%;
          background: #fff1f2; color: #e11d48;
          border: 1px solid #fecdd3;
          border-radius: 6px; padding: 4px 0;
          font-size: 0.72rem; font-weight: 700;
          cursor: pointer;
        }
        .ck-dish-delete:hover { background: #ffe4e6; }
        .ck-empty-dishes {
          text-align: center; padding: 40px 20px;
          color: #94a3b8; font-size: 0.9rem; margin-top: 16px;
        }

        /* ─── COMING SOON ─── */
        .ck-coming {
          text-align: center; padding: 60px 28px;
          max-width: 380px; margin: 0 auto;
        }
        .ck-coming h3 {
          font-family: 'Sora', sans-serif; font-size: 1.2rem;
          font-weight: 800; color: #0f172a; margin-bottom: 10px;
        }
        .ck-coming p { color: #64748b; font-size: 0.87rem; line-height: 1.7; }
        .ck-coming-badge {
          margin-top: 20px; display: inline-block;
          background: #eff6ff; color: #2563eb;
          border-radius: 20px; padding: 5px 16px;
          font-size: 0.74rem; font-weight: 700;
        }

        /* ════════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ════════════════════════════════════════ */

        /* ── Tablet (≤ 900px): collapse sidebar by default ── */
        @media (max-width: 900px) {
          .ck-sidebar.collapsed ~ .ck-main { margin-left: 60px; }
          .ck-dishes-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
        }

        /* ── Mobile drawer (≤ 768px) ── */
        @media (max-width: 768px) {
          /* Sidebar becomes slide-in drawer */
          .ck-sidebar {
            transform: translateX(-100%);
            width: 240px !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.18);
          }
          .ck-sidebar.mobile-open { transform: translateX(0); }

          /* Main stretches full width */
          .ck-main { margin-left: 0 !important; }

          /* Show hamburger, hide desktop toggle */
          .ck-hamburger { display: flex; }
          .desktop-toggle { display: none !important; }

          /* Topbar adjustments */
          .ck-topbar { padding: 0 14px; }
          .ck-badge { display: none; }
          .ck-avatar-name { display: none; }
          .ck-logout-btn { padding: 5px 10px; font-size: 0.78rem; }

          /* Banner: stack timer below text on small screens */
          .ck-banner-inner { padding: 14px 16px; }
          .ck-timer { align-self: stretch; justify-content: center; }
          .ck-timer-digit { font-size: 1.25rem; }

          /* Section */
          .ck-section { padding: 20px 16px; }
          .ck-section-title { font-size: 1rem; }

          /* Live header */
          .ck-live-header { flex-direction: column; align-items: flex-start; }

          /* Page */
          .ck-page { padding: 16px; }

          /* Panel full width */
          .ck-panel { max-width: 100%; }
        }

        /* ── Small mobile (≤ 520px) ── */
        @media (max-width: 520px) {
          .ck-form-row { flex-direction: column; }
          .ck-field-type { flex: 1; }
          .ck-dishes-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .ck-dish-img,
          .ck-dish-img-placeholder { height: 90px; }
          .ck-meal-grid { gap: 10px; }
          .ck-section { padding: 16px 14px; }
          .ck-dish-form { padding: 16px; }
          .ck-topbar-title { font-size: 0.9rem; }
        }

        /* ── Very small phones (≤ 400px) ── */
        @media (max-width: 400px) {
          .ck-meal-grid { gap: 8px; }
          .ck-meal-btn { padding: 14px 8px; font-size: 0.82rem; }
          .ck-meal-icon { font-size: 1.4rem; }
          .ck-step-btn { width: 34px; height: 46px; }
          .ck-step-val { font-size: 1.3rem; width: 44px; }
          .ck-timer-digit { font-size: 1.1rem; }
          .ck-section { padding: 14px 12px; }
          .ck-dish-form { padding: 12px; }
          .ck-dishes-grid { grid-template-columns: 1fr 1fr; }
          .ck-page { padding: 12px; }
          .ck-banner-inner { padding: 12px 14px; }
          .ck-timer { padding: 8px 12px; }
          .ck-logout-btn { display: none; }
        }

        /* ── Large desktops (≥ 1280px): wider panel ── */
        @media (min-width: 1280px) {
          .ck-panel { max-width: 900px; }
          .ck-meal-grid { grid-template-columns: repeat(4, 1fr); }
          .ck-dishes-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
          .ck-page { padding: 36px; }
        }

        /* ── Extra large (≥ 1600px) ── */
        @media (min-width: 1600px) {
          .ck-panel { max-width: 1040px; }
          .ck-section { padding: 36px; }
        }
      `}</style>

      <div className={`ck-overlay ${mobileOpen ? "visible" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* ── SIDEBAR ── */}
      <aside className={`ck-sidebar ${sidebarOpen ? "" : "collapsed"} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="ck-logo">
          <div className="ck-logo-icon">🍳</div>
          <span className="ck-logo-text">UniStay Cook</span>
          <button className="ck-toggle-btn desktop-toggle" onClick={() => setSidebarOpen(p => !p)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <div style={{ flex: 1, padding: "10px 0", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {SIDEBAR_ITEMS.map(item => (
            <div key={item.key} className={`ck-nav-item ${active === item.key ? "active" : ""}`} onClick={() => handleNav(item.key)}>
              <span className="ck-nav-icon">{item.icon}</span>
              <span className="ck-nav-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="ck-nav-item" style={{ color: "#f87171" }} onClick={handleLogout}>
            <span className="ck-nav-icon">🚪</span>
            <span className="ck-nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={`ck-main ${mounted ? "mounted" : ""}`}>
        {/* Topbar */}
        <header className="ck-topbar">
          <div className="ck-topbar-left">
            <button className="ck-hamburger" onClick={() => setMobileOpen(p => !p)}>☰</button>
            <div>
              <div className="ck-topbar-title">{currentItem?.icon} {currentItem?.label}</div>
              <div className="ck-topbar-sub">UniStay Cook Portal</div>
            </div>
          </div>
          <div className="ck-topbar-right">
            <span className="ck-badge">🍳 Cook</span>
            <div className="ck-avatar-pill">
              <div className="ck-avatar-sm">{cook?.name?.charAt(0)?.toUpperCase()}</div>
              <span className="ck-avatar-name" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
                {cook?.name?.split(" ")[0]}
              </span>
            </div>
            <button className="ck-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {/* Page content */}
        <div className="ck-page">
          {active === "menu" && <MenuPanel cook={cook} />}
          {active === "student" && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="ck-coming">
                <div style={{ fontSize: "2.6rem", marginBottom: 12 }}>🎓</div>
                <h3>Student Selection</h3>
                <p>Mark attendance and manage student meal selections from here.</p>
                <div className="ck-coming-badge">Under Construction</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}