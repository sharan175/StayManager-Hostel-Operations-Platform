import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
const DEFAULT_DISH_IMG = "https://placehold.co/400x300/f1f5f9/94a3b8?text=No+Image";

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
  { id: "food",       label: "Food",       icon: FoodIcon,       wip: false },
];

// ─── Profile Panel ────────────────────────────────────────────────────────────
function ProfilePanel({ user, allocation }) {
  if (!user) return <div style={loadingStyle}>Loading profile…</div>;

  const fields = [
    { label: "Full Name",  value: user.name },
    { label: "Phone",      value: user.phone || "—" },
    { label: "Room",  value: allocation?.rooms ? `Room ${allocation.rooms}` : "Not allocated" },
    { label: "Floor", value: allocation?.floor ? `Floor ${allocation.floor}` : "—" },
    { label: "Fees Paid",  value: allocation?.fees_paid ? "✅ Paid" : "❌ Unpaid" },
  ];

  return (
    <div className="sd-panel">
      <h2 style={panelTitle}>My Profile</h2>
      <p style={panelSub}>Your account and room details</p>

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
              {c.image_url && (
                <div style={{ width: 100, flexShrink: 0, background: "#f8faff" }}>
                  <img
                    src={`${API}${c.image_url}`}
                    alt={c.title}
                    onError={e => { e.target.src = DEFAULT_DISH_IMG; }}
                    style={{ width: "100%", height: "100%", minHeight: 90, objectFit: "cover" }}
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

// ─── Food Panel ───────────────────────────────────────────────────────────────
function FoodPanel() {
  const [menus, setMenus]               = useState([]); // grouped menus
  const [loading, setLoading]           = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null); // { menu_id, meal, dishes[] }
  const [selecting, setSelecting]       = useState(false); // loading state for dish selection
  const [selectedDishes, setSelectedDishes] = useState({}); // { menu_id: dish_id } — already chosen
  const [msg, setMsg]                   = useState({ text: "", ok: true, menuId: null });

  // Fetch all available food (showfood endpoint)
  const fetchFood = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/food/showfood`, { credentials: "include" });
      const data = await res.json();

      if (!data.success || !data.data) {
        setMenus([]);
        return;
      }

      // Group dishes by menu_id
      const grouped = {};
      for (const row of data.data) {
        if (!grouped[row.menu_id]) {
          grouped[row.menu_id] = {
            menu_id: row.menu_id,
            meal: row.meal,
            dishes: [],
          };
        }
        grouped[row.menu_id].dishes.push({
          dish_id:   row.dish_id,
          dish_name: row.dish_name,
          is_nonveg: row.is_nonveg,
          photo_url: row.photo_url,
        });
      }
      setMenus(Object.values(grouped));
    } catch {
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFood(); }, []);

  const mealLabel = (meal) => {
    const m = meal?.toLowerCase();
    if (m === "breakfast") return { emoji: "🌅", label: "Breakfast", bg: "#fffbeb", accent: "#d97706" };
    if (m === "lunch")     return { emoji: "☀️", label: "Lunch",     bg: "#f0fdf4", accent: "#16a34a" };
    if (m === "dinner")    return { emoji: "🌙", label: "Dinner",    bg: "#eff6ff", accent: "#2563eb" };
    return { emoji: "🍽️", label: meal, bg: "#f8fafc", accent: "#6366f1" };
  };

  const openMenu = (menu) => {
    setSelectedMenu(menu);
    setMsg({ text: "", ok: true, menuId: null });
  };

  const closeMenu = () => {
    setSelectedMenu(null);
    setMsg({ text: "", ok: true, menuId: null });
  };

  const handleSelectDish = async (menu_id, dish_id) => {
    if (selectedDishes[menu_id]) return; // already selected
    try {
      setSelecting(true);
      setMsg({ text: "", ok: true, menuId: null });

      const res  = await fetch(`${API}/food/select-dish`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_id: menu_id, dish_id }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Already selected — treat as success
        setSelectedDishes(prev => ({ ...prev, [menu_id]: dish_id }));
        setMsg({ text: "Already selected for this meal.", ok: true, menuId: menu_id });
        return;
      }
      if (!res.ok) throw new Error(data.message || "Could not select dish");

      setSelectedDishes(prev => ({ ...prev, [menu_id]: dish_id }));
      setMsg({ text: "Dish selected successfully! 🎉", ok: true, menuId: menu_id });
    } catch (err) {
      setMsg({ text: err.message, ok: false, menuId: menu_id });
    } finally {
      setSelecting(false);
    }
  };

  // ── Dish modal / detail view ────────────────────────────────────────────────
  if (selectedMenu) {
    const { menu_id, meal, dishes } = selectedMenu;
    const { emoji, label, bg, accent } = mealLabel(meal);
    const chosenDishId = selectedDishes[menu_id];

    return (
      <div className="sd-panel">
        {/* Back header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            onClick={closeMenu}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "7px 13px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}
          >
            ← Back
          </button>
          <div>
            <h2 style={{ ...panelTitle, marginBottom: 0 }}>{emoji} {label}</h2>
            <p style={{ ...panelSub, marginBottom: 0 }}>Pick your dish for this meal</p>
          </div>
        </div>

        {/* Feedback */}
        {msg.text && msg.menuId === menu_id && (
          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: msg.ok ? "#16a34a" : "#dc2626", background: msg.ok ? "#f0fdf4" : "#fef2f2", borderRadius: 10, padding: "10px 16px", marginBottom: 16 }}>
            {msg.ok ? "✅" : "⚠️"} {msg.text}
          </div>
        )}

        {/* Already selected banner */}
        {chosenDishId && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: "0.82rem", color: "#166534", fontWeight: 600 }}>
            ✅ You've selected your dish for this meal. Your selection is highlighted below.
          </div>
        )}

        {/* Dishes grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {dishes.map((dish) => {
            const isChosen  = chosenDishId === dish.dish_id;
            const isLocked  = !!chosenDishId && !isChosen; // another dish was chosen

            return (
              <div
                key={dish.dish_id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: isChosen ? `2px solid ${accent}` : "1.5px solid #f1f5f9",
                  boxShadow: isChosen ? `0 4px 20px ${accent}28` : "0 2px 10px rgba(15,23,42,0.06)",
                  overflow: "hidden",
                  opacity: isLocked ? 0.5 : 1,
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Dish image */}
                <div style={{ width: "100%", height: 140, background: "#f8fafc", overflow: "hidden", position: "relative" }}>
                  <img
                    src={dish.photo_url || DEFAULT_DISH_IMG}
                    alt={dish.dish_name}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_DISH_IMG;
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Veg/Non-veg badge */}
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: dish.is_nonveg ? "#fef2f2" : "#f0fdf4",
                    color: dish.is_nonveg ? "#dc2626" : "#16a34a",
                    borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 800,
                    border: `1px solid ${dish.is_nonveg ? "#fecaca" : "#bbf7d0"}`,
                  }}>
                    {dish.is_nonveg ? "🔴 Non-veg" : "🟢 Veg"}
                  </div>
                  {isChosen && (
                    <div style={{
                      position: "absolute", top: 8, left: 8,
                      background: accent, color: "#fff",
                      borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 800,
                    }}>
                      ✓ Selected
                    </div>
                  )}
                </div>

                {/* Dish info */}
                <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", lineHeight: 1.3 }}>{dish.dish_name}</div>
                  <button
                    disabled={isLocked || isChosen || selecting}
                    onClick={() => handleSelectDish(menu_id, dish.dish_id)}
                    style={{
                      marginTop: "auto",
                      padding: "8px 0",
                      borderRadius: 9,
                      border: "none",
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: (isLocked || isChosen || selecting) ? "not-allowed" : "pointer",
                      background: isChosen
                        ? `${accent}18`
                        : isLocked
                          ? "#f1f5f9"
                          : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                      color: isChosen ? accent : isLocked ? "#94a3b8" : "#fff",
                      transition: "all 0.2s",
                    }}
                  >
                    {isChosen ? "✓ Selected" : isLocked ? "Unavailable" : selecting ? "Selecting…" : "Select Dish"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Menu list view ──────────────────────────────────────────────────────────
  return (
    <div className="sd-panel">
      <h2 style={panelTitle}>🍽️ Today's Menu</h2>
      <p style={panelSub}>Choose your meal and pick a dish</p>

      {loading && (
        <div style={loadingStyle}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>⏳</div>
          Loading menu…
        </div>
      )}

      {!loading && menus.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 24px", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🍽️</div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#475569", marginBottom: 6 }}>No Menu Available</div>
          <div style={{ fontSize: "0.82rem" }}>Check back later — today's menu will appear here.</div>
        </div>
      )}

      {!loading && menus.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {menus.map((menu) => {
            const { emoji, label, bg, accent } = mealLabel(menu.meal);
            const isSelected = !!selectedDishes[menu.menu_id];

            return (
              <button
                key={menu.menu_id}
                onClick={() => openMenu(menu)}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  border: isSelected ? `2px solid ${accent}` : "1.5px solid #f1f5f9",
                  boxShadow: isSelected ? `0 4px 20px ${accent}22` : "0 2px 14px rgba(15,23,42,0.07)",
                  padding: "20px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans',sans-serif",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}28`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isSelected ? `0 4px 20px ${accent}22` : "0 2px 14px rgba(15,23,42,0.07)"; }}
              >
                {/* Decorative blob */}
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: bg, opacity: 0.8 }} />

                <div style={{ fontSize: "2rem", marginBottom: 10 }}>{emoji}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: 14 }}>
                  {menu.dishes.length} dish{menu.dishes.length !== 1 ? "es" : ""} available
                </div>

                {/* Dish name preview chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {menu.dishes.slice(0, 3).map(d => (
                    <span key={d.dish_id} style={{ background: bg, color: accent, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>
                      {d.dish_name}
                    </span>
                  ))}
                  {menu.dishes.length > 3 && (
                    <span style={{ background: "#f1f5f9", color: "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700 }}>
                      +{menu.dishes.length - 3} more
                    </span>
                  )}
                </div>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: isSelected ? `${accent}14` : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  color: isSelected ? accent : "#fff",
                  borderRadius: 10, padding: "7px 16px",
                  fontSize: "0.78rem", fontWeight: 700,
                  border: isSelected ? `1px solid ${accent}44` : "none",
                }}>
                  {isSelected ? "✓ Selection made" : "View dishes →"}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate                      = useNavigate();
  const [active, setActive]           = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser]               = useState(null);
  const [allocation, setAllocation]   = useState(null);

  useEffect(() => {
    fetch(`${API}/auth/user`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});

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

      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`sd-sidebar${sidebarOpen ? " open" : ""}`}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1rem" }}>S</div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>UniStay</span>
          </div>
          {user && <div style={{ marginTop: 10, fontSize: "0.75rem", color: "#64748b" }}>👋 {user.name?.split(" ")[0]}</div>}
        </div>

        <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(({ id, label, icon: Icon }) => {
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
              </button>
            );
          })}
        </nav>

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
        <div className="mobile-topbar">
          <style>{`.mobile-topbar { display: none; } @media(max-width:768px){ .mobile-topbar{ display:flex !important; align-items:center; justify-content:space-between; margin-bottom:20px; } }`}</style>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: "1.1rem" }}
          >☰</button>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>UniStay</span>
          <div style={{ width: 40 }} />
        </div>

        {active === "profile"    && <ProfilePanel user={user} allocation={allocation} />}
        {active === "complaints" && <ComplaintsPanel />}
        {active === "food"       && <FoodPanel />}
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