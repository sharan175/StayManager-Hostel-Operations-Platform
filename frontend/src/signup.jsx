export default function SignUp() {
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

        .signup-card {
          background: #fff;
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.35);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #fff;
          font-family: "'DM Sans', sans-serif";
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          margin-top: 8px;
        }
        .google-btn:hover {
          border-color: #4285F4;
          box-shadow: 0 4px 18px rgba(66, 133, 244, 0.18);
          background: #f8fbff;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: 0.875rem;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
        }
        .feature-item:last-child { border-bottom: none; }
        .feature-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #6366f1);
          flex-shrink: 0;
        }
      `}</style>

      <div className="signup-card">
        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
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

        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "1.6rem", fontWeight: 800,
          color: "#0f172a", marginTop: 20, marginBottom: 6,
          letterSpacing: "-0.02em",
        }}>
          Create your account
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: 28 }}>
          Join 300+ students already living at UniStay
        </p>

        {/* What you get */}
        <div style={{
          background: "#f8faff", borderRadius: 12,
          padding: "16px 18px", marginBottom: 28,
        }}>
          {[
            "Instant room booking & availability",
            "Secure payment portal",
            "24×7 maintenance requests",
          ].map(f => (
            <div className="feature-item" key={f}>
              <div className="feature-dot" />
              {f}
            </div>
          ))}
        </div>

        {/* Google Sign Up Button */}
        <button
          className="google-btn"
          onClick={() => window.location.href = "http://localhost:3000/auth/google"}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width="20" height="20"
          />
          <span>Sign up with Google</span>
        </button>

        <div className="divider">or</div>

        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
          Already have an account?{" "}
          <a href="/" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={e => e.target.style.textDecoration = "underline"}
            onMouseLeave={e => e.target.style.textDecoration = "none"}
          >
            Log in
          </a>
        </p>

        <p style={{
          marginTop: 24, fontSize: "0.75rem",
          color: "#94a3b8", textAlign: "center", lineHeight: 1.6,
        }}>
          By signing up, you agree to UniStay's{" "}
          <span style={{ color: "#2563eb", cursor: "pointer" }}>Terms of Service</span>{" "}
          and{" "}
          <span style={{ color: "#2563eb", cursor: "pointer" }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}