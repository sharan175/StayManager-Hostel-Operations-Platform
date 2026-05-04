import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 




const ROOMS = [
  {
    id: 1,
    type: "Sharing",
    price: "₹10,000/mo",
    features: ["Bunk Bed", "Shared Space", "Fan", "Common Washroom"],
    badge: "Budget",
    color: "#6366f1",
    img: "🏠",
  },
];

const FEES = [
  { label: "Registration Fee", amount: "₹500", note: "One-time, non-refundable" },
  { label: "Security Deposit", amount: "₹5,000", note: "Refundable on checkout" },
  { label: "Room Charge", amount: "₹6,730/mo", note: "Cost per month (sharing)" },
  { label: "Mess Charges", amount: "₹2,800/mo", note: "3 meals + evening snacks" },
  { label: "Electricity", amount: "₹300/mo", note: "Per head, fixed" },
  { label: "Laundry", amount: "₹200/mo", note: "Weekly pickup & drop" },
  { label: "Internet", amount: "₹150/mo", note: "High-speed 100 Mbps WiFi" },
];

const SLIDES = [
  {
    headline: "Your Home Away From Home",
    sub: "Premium student living in the heart of Bengaluru",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)",
    accent: "#60a5fa",
  },
  {
    headline: "Built for Focused Minds",
    sub: "Quiet study zones, fast WiFi, and 24×7 security",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #4338ca 100%)",
    accent: "#a5b4fc",
  },
  {
    headline: "Community & Comfort",
    sub: "Join 300+ students living, learning & thriving together",
    bg: "linear-gradient(135deg, #0f0f1a 0%, #0c2340 60%, #0369a1 100%)",
    accent: "#38bdf8",
  },
];

const NAV_LINKS = ["Rooms", "Fees", "Contact"];

export default function HostelHome() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [scrolled, setScrolled] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((p) => (p + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

const handleLogin = async () => {
  setError("");
  setSuccess("");

  if (!loginForm.email || !loginForm.password) {
    setError("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginForm),
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {
      setSuccess("Login successful ");

      setTimeout(async () => {
    const role = await fetchUser();
    setShowLogin(false);
    setLoginForm({ email: "", password: "" });
    setSuccess("");
    if (role === "admin") navigate("/admin");
    else if (role === "warden") navigate("/warden");
    else if (role === "cook") navigate("/cook");
    else if (role === "student") navigate("/cook");
}, 800);
    } else {
      setError(data.message);
    }

  } catch (err) {
    console.log(err);
    setError("Something went wrong");
  }
};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

const fetchUser = async () => {
  try {
    const res = await fetch("http://localhost:3000/auth/user", { credentials: "include" });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setIsLoggedIn(true);
      return data.user.role; // add this
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  } catch (err) {
    console.log(err);
  }
};
useEffect(() => {
  fetchUser();
}, []);


 const handleLogout = async () => {
  try {
    await fetch("http://localhost:3000/auth/logout", {
      method: "GET",
      credentials: "include",
    });

    await fetchUser(); 

  } catch (err) {
    console.log(err);
  }
};
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const slide = SLIDES[activeSlide];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8faff", minHeight: "100vh", color: "#0f172a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        .nav-link {
          position: relative;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          padding: 4px 0;
          cursor: pointer;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 2px;
          background: #2563eb;
          transition: width 0.25s;
          border-radius: 2px;
        }
        .nav-link:hover::after { width: 100%; }

        .btn-primary {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 22px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.3); }

        .btn-outline {
          background: transparent;
          color: #2563eb;
          border: 1.5px solid #2563eb;
          border-radius: 10px;
          padding: 9px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover { background: #2563eb; color: #fff; }

        .slide-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }
        .slide-dot.active { width: 24px; border-radius: 4px; background: #fff; }

        .card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 16px rgba(15,23,42,0.07);
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(15,23,42,0.12); }

        .fee-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .fee-row:last-child { border-bottom: none; }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 999;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }

        .input-field {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
          color: #0f172a;
          background-color: #f1f5f9; 
        }
        .input-field:focus { border-color: #2563eb; }

        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .amenity-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #475569;
        }

        .footer-link {
          font-size: 0.88rem;
          cursor: pointer;
          transition: color 0.2s;
          color: #94a3b8;
        }
          .google-btn {
           width: 100%;
           padding: 13px 16px;
           border-radius: 10px;
           border: 1.5px solid #e2e8f0;
           background: #ffffff;
           cursor: pointer;
           font-weight: 600;
           font-size: 0.95rem;
           font-family: 'DM Sans', sans-serif;
           color: #000000;
           display: flex;
           align-items: center;
           justify-content: center;
           position: relative;

           transition: all 0.2s ease;
        }

        .google-btn:hover {
           background: #f8fafc;
        }

        .google-btn img {
           position: absolute;
           left: 16px;
        }
        .footer-link:hover { color: #60a5fa; }
         .error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  animation: slideUp 0.2s ease;
}

.success-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  animation: slideUp 0.2s ease;
}
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .hero-headline { font-size: 2.2rem !important; }
          .section-grid { grid-template-columns: 1fr !important; }
          .fees-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 24px rgba(15,23,42,0.08)" : "none",
        transition: "all 0.35s",
        padding: "0 5%",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.1rem", fontWeight: 800 }}>S</div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: scrolled ? "#0f172a" : "#fff", letterSpacing: "-0.02em" }}>UniStay</span>
          </div>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {NAV_LINKS.map(link => (
              <span key={link} className="nav-link" style={{ color: scrolled ? "#374151" : "rgba(255,255,255,0.85)" }} onClick={() => scrollTo(link.toLowerCase())}>
                {link}
              </span>
            ))}
          </div>

         {/* Auth */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                {/* Role badge */}
                {user?.role === "user" ? (
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 20, padding: "4px 12px" }}>
                    ⚠️ Contact Admin
                  </span>
                ) : (
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 12px" }}>
                    {user?.role === "admin" && "🛡️ Admin"}
                    {user?.role === "warden" && "🏠 Warden"}
                    {user?.role === "cook" && "🍽️ Cook"}
                    {user?.role === "student" && "🎓 Student"}
                  </span>
                )}

                {/* Dashboard button */}
                {user?.role !== "user" && user?.role && (
                  <button
                    className="btn-primary"
                    style={{ padding: "8px 16px", fontSize: "0.88rem" }}
                    onClick={async () => {
  const role = user.role;
  if (role === "admin") navigate("/admin");
  else if (role === "warden") navigate("/warden");
  else if (role === "cook") navigate("/cook");
  else if (role === "student") {
    const feeRes = await fetch("http://localhost:3000/allocatecheck", { credentials: "include" });
    const feeData = await feeRes.json();
    if (feeData.fees_paid) navigate("/student");
    else navigate("/student/pay");
  }
}}
                   >
                    Dashboard →
                  </button>
                )}

                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", borderRadius: 30, padding: "6px 14px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{user?.name?.split(" ")[0]}</span>
                </div>

                <button className="btn-outline" onClick={handleLogout} style={{ padding: "8px 16px" }}>Logout</button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setShowLogin(true)}>Login</button>
            )}
          </div>  {/* ← closes desktop-nav auth div */}

          {/* Mobile Hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: scrolled ? "#0f172a" : "#fff", fontSize: "1.4rem" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {/* Mobile Menu */}
        {/* Mobile Menu */}
{menuOpen && (
  <div className="mobile-menu" style={{ background: "#fff", padding: "16px 5% 20px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 14 }}>
    {NAV_LINKS.map(link => (
      <span key={link} style={{ fontWeight: 600, color: "#374151", cursor: "pointer", fontSize: "0.95rem" }} onClick={() => scrollTo(link.toLowerCase())}>{link}</span>
    ))}

    {isLoggedIn ? (
      <>
        {/* Role badge */}
        <div>
          {user?.role === "user" ? (
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 20, padding: "5px 14px" }}>
              ⚠️ Contact Admin
            </span>
          ) : (
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "5px 14px" }}>
              {user?.role === "admin" && "🛡️ Admin"}
              {user?.role === "warden" && "🏠 Warden"}
              {user?.role === "cook" && "🍽️ Cook"}
              {user?.role === "student" && "🎓 Student"}
            </span>
          )}
        </div>

        {/* Dashboard button */}
        {user?.role !== "user" && user?.role && (
          <button
            className="btn-primary"
            style={{ width: "100%", padding: "10px 16px", fontSize: "0.92rem" }}
            onClick={async () => {
            const role = user.role;
            if (role === "admin") navigate("/admin");
            else if (role === "warden") navigate("/warden");
            else if (role === "cook") navigate("/cook");
            else if (role === "student") {
            const feeRes = await fetch("http://localhost:3000/allocatecheck", { credentials: "include" });
            const feeData = await feeRes.json();
            if (feeData.fees_paid) navigate("/student/dashboard");
            else navigate("/student/pay");
           }
           setMenuOpen(false);
            }}
              >
            Dashboard →
          </button>
        )}

        {/* User name + logout */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8faff", borderRadius: 12, padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#374151" }}>{user?.name?.split(" ")[0]}</span>
          </div>
          <button className="btn-outline" onClick={handleLogout} style={{ padding: "6px 14px", fontSize: "0.82rem" }}>Logout</button>
        </div>
      </>
    ) : (
      <button className="btn-primary" onClick={() => { setShowLogin(true); setMenuOpen(false); }}>Login</button>
    )}
  </div>
)}
      </nav>

      {/* HERO CAROUSEL */}
      <section style={{ position: "relative", height: "100vh", minHeight: 560, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: slide.bg, transition: "background 1.2s ease" }} />
        <div style={{ position: "absolute", top: "10%", right: "8%", width: 340, height: 340, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "5%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: 80, height: 80, borderRadius: "50%", background: slide.accent + "18", transition: "background 1.2s" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 20px", maxWidth: 820 }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 30, padding: "6px 18px", marginBottom: 24, border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ color: slide.accent, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 1.2s" }}>Bengaluru's Finest Student Hostel</span>
          </div>
          <h1 className="hero-headline" style={{ fontFamily: "'Sora', sans-serif", fontSize: "3.5rem", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 18, letterSpacing: "-0.02em" }}>
            {slide.headline}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "1.1rem", marginBottom: 38, lineHeight: 1.75 }}>
            {slide.sub}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: "1rem", padding: "13px 30px" }} onClick={() => scrollTo("rooms")}>
              Explore Rooms
            </button>
            <button onClick={() => scrollTo("contact")} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "12px 28px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}>
              Contact Us
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 44 }}>
            {SLIDES.map((_, i) => (
              <button key={i} className={`slide-dot${i === activeSlide ? " active" : ""}`} onClick={() => setActiveSlide(i)} />
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span>scroll</span>
          <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.2)" }} />
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ background: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.06)" }}>
        <div className="stats-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "30px 20px", gap: 12 }}>
          {[["300+", "Students"], ["4.8★", "Rating"], ["5 min", "Metro access"], ["24/7", "Security"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#2563eb" }}>{val}</div>
              <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 500, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ROOMS SECTION */}
      <section id="rooms" style={{ padding: "90px 5%", background: "#f8faff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Accommodation</span>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: "#0f172a", marginTop: 8, letterSpacing: "-0.02em" }}>Room Details</h2>
            <p style={{ color: "#64748b", marginTop: 12, fontSize: "1rem", maxWidth: 440, margin: "12px auto 0" }}>Choose the room type that fits your lifestyle and budget.</p>
          </div>

          <div className="section-grid" style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            {ROOMS.map(room => (
              <div key={room.id} className="card" style={{ border: `1.5px solid ${room.color}20` }}>
                <div style={{ height: 160, background: `linear-gradient(135deg, ${room.color}15, ${room.color}06)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, borderBottom: `1px solid ${room.color}15` }}>
                  <span style={{ fontSize: "3rem" }}>{room.img}</span>
                  {room.badge && (
                    <span className="badge" style={{ background: `${room.color}20`, color: room.color }}>{room.badge}</span>
                  )}
                </div>
                <div style={{ padding: "26px" }}>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#0f172a", marginBottom: 6 }}>{room.type}</h3>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.55rem", color: room.color, marginBottom: 18 }}>{room.price}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
                    {room.features.map(f => (
                      <span key={f} className="amenity-chip">✓ {f}</span>
                    ))}
                  </div>
                  <button className="btn-primary" style={{ width: "100%", background: room.color, fontSize: "0.9rem" }}
                    onClick={() => !isLoggedIn && setShowLogin(true)}>
                    {isLoggedIn ? "Book Now →" : "Login to Book"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEES SECTION */}
      <section id="fees" style={{ padding: "90px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Pricing</span>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: "#0f172a", marginTop: 8, letterSpacing: "-0.02em" }}>Fee Details</h2>
            <p style={{ color: "#64748b", marginTop: 12, fontSize: "1rem" }}>Transparent pricing — no hidden charges, ever.</p>
          </div>

          <div className="fees-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28, maxWidth: 500, margin: "0 auto" }}>
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: 18, paddingBottom: 14, borderBottom: "2px solid #f1f5f9" }}>Monthly Charges</h3>
              {FEES.slice(2).map(f => (
                <div key={f.label} className="fee-row">
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.92rem" }}>{f.label}</div>
                    <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>{f.note}</div>
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: "#2563eb", fontSize: "1.1rem" }}>{f.amount}</div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" style={{ padding: "90px 5%", background: "#f8faff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Get in Touch</span>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: "#0f172a", marginTop: 8, letterSpacing: "-0.02em" }}>Contact Us</h2>
            <p style={{ color: "#64748b", marginTop: 12, fontSize: "1rem" }}>We'd love to hear from you. Reach out anytime.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 700, margin: "0 auto" }}>
            {[
              { icon: "📍", label: "Address", val: "No. 12, Hostel Road, Yelahanka, Bengaluru – 560064" },
              { icon: "📞", label: "Phone", val: "+91 98765 43210" },
              { icon: "✉️", label: "Email", val: "admissions@unistay.in" },
              { icon: "🕐", label: "Office Hours", val: "Mon–Sat: 9 AM – 6 PM" },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: "18px 22px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: "#1e293b", marginTop: 3, fontSize: "0.92rem" }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "60px 5% 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 52 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.1rem", fontWeight: 800 }}>S</div>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#fff" }}>UniStay</span>
              </div>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.8, maxWidth: 290, color: "#64748b" }}>
                Premium student accommodation designed for academic success and comfortable living in Bengaluru.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                {["📘", "📸", "🐦", "📺"].map((icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 9, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.9rem" }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem", marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase" }}>Quick Links</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Rooms", "Fees", "Contact", "Gallery", "FAQ"].map(l => (
                  <span key={l} className="footer-link" onClick={() => scrollTo(l.toLowerCase())}>{l}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem", marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase" }}>Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.88rem" }}>
                <span>📍 Yelahanka, Bengaluru</span>
                <span>📞 +91 98765 43210</span>
                <span>✉️ admissions@unistay.in</span>
                <span>🕐 Mon–Sat, 9 AM–6 PM</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 26, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: "0.82rem", color: "#475569" }}>© 2025 UniStay. All rights reserved.</p>
            <p style={{ fontSize: "0.82rem", color: "#475569" }}>
              Designed & built with ❤️ by <span style={{ color: "#60a5fa", fontWeight: 700 }}>Sharan</span>
            </p>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 40, width: "100%", maxWidth: 420, margin: "0 20px", animation: "slideUp 0.25s", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.3rem" }}>🏠</div>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#0f172a" }}>Welcome Back</h2>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Log in to your UniStay account</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
              <div>
                <label>Email</label>
                <input
                 className="input-field"
                 placeholder="email"
                 type="email"
                 value={loginForm.email}
                 onChange={e => {setLoginForm(p => ({ ...p, email: e.target.value }));setError("");
                }}
                />

              </div>
              <div>
                
               <label>Password</label>
              <input
              className="input-field"
              type="password"
              placeholder="password"
              value={loginForm.password}
              onChange={e => {
              setLoginForm(p => ({ ...p, password: e.target.value }));setError("");
              }}
              />
              </div>
            </div>
          <button
             className="google-btn"
             onClick={() => window.location.href = "http://localhost:3000/auth/google"}>
             <img
             src="https://www.svgrepo.com/show/475656/google-color.svg"
             alt="Google"
             width="18"
             height="18"
             />
            <span>Sign in with Google</span>
          </button>
<p style={{ textAlign: "center", marginTop: 14, fontSize: "0.85rem", color: "#64748b" }}>
  Don’t have an account?{" "}
  <span
    style={{ color: "#2563eb", fontWeight: 600, cursor: "pointer" }}
    onMouseEnter={e => e.target.style.textDecoration = "underline"}
    onMouseLeave={e => e.target.style.textDecoration = "none"}
    onClick={() => navigate("/signup")}
  >
    Sign up
  </span>
</p> 
             {error && <div className="error-box">⚠️ {error}</div>}
             {success && <div className="success-box">✅ {success}</div>}      
            <button className="btn-primary" style={{ width: "100%", padding: 14, fontSize: "1rem" }} onClick={handleLogin}>
              Login to UniStay
            </button>
            <button onClick={() => setShowLogin(false)} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.88rem", padding: 8, fontFamily: "'DM Sans', sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
