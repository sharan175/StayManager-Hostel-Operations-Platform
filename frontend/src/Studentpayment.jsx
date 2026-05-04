import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
const BASE_PRICE = 15000;
const DUMMY_IMG = "https://ui-avatars.com/api/?name=Room&background=eff6ff&color=2563eb&size=120";

function getPrice(capacity) {
  if (capacity === 1) return BASE_PRICE;
  if (capacity === 2) return Math.round(BASE_PRICE * 0.85);
  return Math.round(BASE_PRICE * 0.6);
}

function getPriceLabel(capacity) {
  if (capacity === 1) return "Single occupancy";
  if (capacity === 2) return "Double occupancy (15% off)";
  return "Triple+ occupancy (40% off)";
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Select Floor", "Select Room", "Pay"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: done || active ? "#2563eb" : "#e2e8f0",
                color: done || active ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "0.8rem",
                boxShadow: active ? "0 0 0 4px rgba(37,99,235,0.15)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: active ? 700 : 500, color: active || done ? "#2563eb" : "#94a3b8", whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 60, height: 2, background: done ? "#2563eb" : "#e2e8f0", margin: "0 8px", marginBottom: 22, transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Image card ───────────────────────────────────────────────────────────────
function ImgCard({ src, alt, children, onClick, selected }) {
  const [imgSrc, setImgSrc] = useState(src || DUMMY_IMG);
  useEffect(() => { setImgSrc(src || DUMMY_IMG); }, [src]);

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 14, overflow: "hidden", cursor: "pointer",
        border: selected ? "2.5px solid #2563eb" : "1.5px solid #e2e8f0",
        boxShadow: selected ? "0 0 0 4px rgba(37,99,235,0.12)" : "0 2px 8px rgba(15,23,42,0.06)",
        background: "#fff", transition: "all 0.2s",
        transform: selected ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ height: 140, overflow: "hidden", background: "#f8faff" }}>
        <img
          src={imgSrc}
          alt={alt}
          onError={() => setImgSrc(DUMMY_IMG)}
          style={{ width: "100%", height: "100%", objectFit: imgSrc === DUMMY_IMG ? "contain" : "cover", padding: imgSrc === DUMMY_IMG ? 24 : 0 }}
        />
      </div>
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StudentPayment() {
  const navigate = useNavigate();

  const [step, setStep]                   = useState(0);
  const [floors, setFloors]               = useState([]);
  const [rooms, setRooms]                 = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom]   = useState(null);
  const [months, setMonths]               = useState(1);
  const [loading, setLoading]             = useState(false);
  const [paying, setPaying]               = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState(false);

  // fetch floors on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/floors`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setFloors(d.data || []))
      .catch(() => setError("Failed to load floors"))
      .finally(() => setLoading(false));
  }, []);

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
    setSelectedRoom(null);
    setError("");
    setLoading(true);
    fetch(`${API}/rooms`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const filtered = (d.data || []).filter(r => r.floor_id === floor.id && r.is_available);
        setRooms(filtered);
        setStep(1);
      })
      .catch(() => setError("Failed to load rooms"))
      .finally(() => setLoading(false));
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setError("");
    setStep(2);
  };

  const handlePay = async () => {
    try {
      setPaying(true);
      setError("");
      const amount = getPrice(selectedRoom.capacity) * months;

      const res = await fetch(`${API}/fees/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ room_id: selectedRoom.id, months_paid: months, amount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment failed");

      setSuccess(true);
      setTimeout(() => navigate("/student"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const pricePerMonth = selectedRoom ? getPrice(selectedRoom.capacity) : 0;
  const totalAmount   = pricePerMonth * months;

  // ── Success ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, textAlign: "center", padding: "56px 32px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🎉</div>
          <h2 style={{ ...headingStyle, fontSize: "1.3rem", marginBottom: 8 }}>Payment Successful!</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ ...headingStyle, fontSize: "1.35rem" }}>🏠 Hostel Room Booking</h1>
          <p style={{ color: "#64748b", fontSize: "0.83rem", marginTop: 4 }}>Complete your booking to access the dashboard</p>
        </div>

        <Steps current={step} />

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: "0.82rem", fontWeight: 600, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: "0.875rem" }}>Loading…</div>
          </div>
        )}

        {/* ── STEP 0: Floor ── */}
        {!loading && step === 0 && (
          <div>
            <p style={sectionLabel}>Choose a Floor</p>
            {floors.length === 0
              ? <p style={{ color: "#94a3b8", textAlign: "center", padding: 24, fontSize: "0.875rem" }}>No floors available.</p>
              : (
                <div style={gridStyle}>
                  {floors.map(f => (
                    <ImgCard
                      key={f.id}
                      src={f.image_url ? `${API}${f.image_url}` : null}
                      alt={f.name}
                      selected={selectedFloor?.id === f.id}
                      onClick={() => handleFloorSelect(f)}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>Floor {f.floor_number}</div>
                      <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>{f.name}</div>
                    </ImgCard>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── STEP 1: Room ── */}
        {!loading && step === 1 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <button onClick={() => setStep(0)} style={backBtn}>← Back</button>
              <p style={{ ...sectionLabel, margin: 0 }}>
                Floor {selectedFloor?.floor_number} — {selectedFloor?.name}
              </p>
            </div>
            {rooms.length === 0
              ? <p style={{ color: "#94a3b8", textAlign: "center", padding: 24, fontSize: "0.875rem" }}>No available rooms on this floor.</p>
              : (
                <div style={gridStyle}>
                  {rooms.map(r => (
                    <ImgCard
                      key={r.id}
                      src={r.image_url ? `${API}${r.image_url}` : null}
                      alt={`Room ${r.room_number}`}
                      selected={selectedRoom?.id === r.id}
                      onClick={() => handleRoomSelect(r)}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>Room {r.room_number}</div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                        Capacity: {r.capacity} · Occupied: {r.occupied_count}
                      </div>
                      <div style={{ marginTop: 6, display: "inline-block", background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "3px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                        ₹{getPrice(r.capacity).toLocaleString("en-IN")}/mo
                      </div>
                    </ImgCard>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── STEP 2: Payment ── */}
        {step === 2 && selectedRoom && (
          <div>
            <button onClick={() => setStep(1)} style={{ ...backBtn, marginBottom: 20 }}>← Back</button>

            {/* Summary box */}
            <div style={{ background: "#f8faff", borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: "1px solid #e2e8f0" }}>
              <p style={sectionLabel}>Booking Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <Row label="Floor"    value={`Floor ${selectedFloor.floor_number} — ${selectedFloor.name}`} />
                <Row label="Room"     value={`Room ${selectedRoom.room_number}`} />
                <Row label="Capacity" value={`${selectedRoom.capacity} person(s)`} />
                <Row label="Pricing"  value={getPriceLabel(selectedRoom.capacity)} />
                <Row label="Rate"     value={`₹${pricePerMonth.toLocaleString("en-IN")} / month`} />
              </div>
            </div>

            {/* Month selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 10 }}>
                Duration
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 6, 12].map(m => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    style={{
                      padding: "8px 16px", borderRadius: 10, border: "1.5px solid",
                      borderColor: months === m ? "#2563eb" : "#e2e8f0",
                      background: months === m ? "#eff6ff" : "#fff",
                      color: months === m ? "#2563eb" : "#64748b",
                      fontWeight: months === m ? 700 : 500,
                      fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {m} {m === 1 ? "mo" : "mos"}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ background: "linear-gradient(135deg, #2563eb, #6366f1)", borderRadius: 14, padding: "20px 22px", marginBottom: 24, color: "#fff" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: 4 }}>Total Amount</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.02em" }}>
                ₹{totalAmount.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: "0.72rem", opacity: 0.72, marginTop: 4 }}>
                ₹{pricePerMonth.toLocaleString("en-IN")} × {months} {months === 1 ? "month" : "months"}
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={paying}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                background: paying ? "#e2e8f0" : "linear-gradient(135deg, #2563eb, #6366f1)",
                color: paying ? "#94a3b8" : "#fff",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1rem",
                cursor: paying ? "not-allowed" : "pointer", transition: "opacity 0.2s",
              }}
              onMouseEnter={e => { if (!paying) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              {paying ? "Processing…" : `💳 Pay ₹${totalAmount.toLocaleString("en-IN")}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.82rem" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ color: "#0f172a", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const pageStyle = {
  minHeight: "100vh",
  background: "#f8faff",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "32px 16px",
  fontFamily: "'DM Sans', sans-serif",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
  padding: "32px 28px",
  width: "100%",
  maxWidth: 640,
};

const headingStyle = {
  fontFamily: "'Sora', sans-serif",
  fontWeight: 800,
  color: "#0f172a",
  margin: 0,
};

const sectionLabel = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 12,
  marginTop: 0,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
  gap: 14,
};

const backBtn = {
  background: "none",
  border: "1.5px solid #e2e8f0",
  borderRadius: 8,
  padding: "6px 14px",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#64748b",
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};