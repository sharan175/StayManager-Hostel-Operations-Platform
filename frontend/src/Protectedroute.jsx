import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function ProtectedRoute({
  allowedRoles = [],
  children,
  redirectTo = "/",
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "allowed" | "denied"

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:3000/auth/user", {
          credentials: "include",
        });
        const data = await res.json();

        if (cancelled) return;

        if (!data.user) {
          
          setStatus("denied");
          navigate(redirectTo, { replace: true });
          return;
        }

        if (allowedRoles.length && !allowedRoles.includes(data.user.role)) {
         
          setStatus("denied");
          const role = data.user.role;
          if (role === "admin")   navigate("/admin",   { replace: true });
          else if (role === "warden") navigate("/warden", { replace: true });
          else if (role === "cook")   navigate("/cook",   { replace: true });
          else                        navigate(redirectTo, { replace: true });
          return;
        }

        setStatus("allowed");
      } catch {
        if (!cancelled) {
          setStatus("denied");
          navigate(redirectTo, { replace: true });
        }
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") {
    // Minimal full-page spinner so there's no flash of protected content
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        color: "#64748b",
        fontSize: "0.95rem",
      }}>
        Checking access…
      </div>
    );
  }

  // "denied" branch already redirected above; render nothing while React navigates
  if (status === "denied") return null;

  return children;
}