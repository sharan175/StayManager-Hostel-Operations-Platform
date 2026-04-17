import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const guard = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/user", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.user) {
          
          navigate("/");
          return;
        }

        if (data.user.name && data.user.phone) {
          
          navigate("/");
          return;
        }

        setChecking(false); 
      } catch (err) {
        navigate("/");
      }
    };
    guard();
  }, []);
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };
   

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Basic frontend validation matching backend requirements
    if (!form.name || !form.phone || !form.password) {
      setError("Name, phone, and password are required");
      return;
    }

    if (form.phone.length < 10) {
      setError("Enter a valid phone number");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(form),
      });

     
      if (res.ok || res.redirected) {
        setSuccess("Profile saved! Redirecting…");
        setTimeout(() => navigate("/"), 1000);
        return;
      }

      // Backend returns JSON error objects
      const data = await res.json();
      setError(data.message || data.error || "Something went wrong");
    } catch (err) {
      // fetch throws on network failure
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };
 if (checking) return null;
  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-card {
          background: #fff;
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.35);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cp-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 7px;
        }

        .cp-input {
          width: 100%;
          padding: 13px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-family: "'DM Sans', sans-serif";
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #f8faff;
        }
        .cp-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
          background: #fff;
        }
        .cp-input::placeholder { color: #cbd5e1; }

        .cp-input-wrap {
          position: relative;
        }
        .cp-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 1rem;
          color: #94a3b8;
          user-select: none;
        }

        .cp-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: "'DM Sans', sans-serif";
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 4px;
        }
        .cp-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .cp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .error-box {
          background: #fef2f2;
          color: #dc2626;
          border: 1.5px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .success-box {
          background: #f0fdf4;
          color: #16a34a;
          border: 1.5px solid #bbf7d0;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .step-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="cp-card">

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: "linear-gradient(135deg,#2563eb,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "1.3rem", fontWeight: 800,
          }}>S</div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#0f172a" }}>
            UniStay
          </span>
        </div>

        <div className="step-badge">
          <span>✦</span> One last step
        </div>

        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "1.6rem", fontWeight: 800,
          color: "#0f172a", marginBottom: 6,
          letterSpacing: "-0.02em",
        }}>
          Complete your profile
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: 32, lineHeight: 1.6 }}>
          Just a few details and you're all set to book your room.
        </p>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 }}>

          <div>
            <label className="cp-label">Full Name</label>
            <input
              className="cp-input"
              name="name"
              type="text"
              placeholder="e.g. Sharan Kumar"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="cp-label">Phone Number</label>
            <input
              className="cp-input"
              name="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="cp-label">Set a Password</label>
            <div className="cp-input-wrap">
              <input
                className="cp-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 42 }}
              />
              <span className="cp-eye" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

        </div>

        {/* Feedback */}
        {error   && <div className="error-box"   style={{ marginBottom: 16 }}>⚠️ {error}</div>}
        {success && <div className="success-box" style={{ marginBottom: 16 }}>✅ {success}</div>}

        <button className="cp-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving…" : "Save & Continue →"}
        </button>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: "0.8rem", color: "#94a3b8" }}>
          Your details are stored securely and never shared.
        </p>
      </div>
    </div>
  );
}