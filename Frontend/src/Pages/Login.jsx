import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";
import { GraduationCap, ShieldCheck, Zap } from "lucide-react";

export default function Login() {
  const { login, userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect after login based on role
  useEffect(() => {
    if (currentUser && userProfile) {
      navigate(userProfile.role === "teacher" ? "/teacher" : "/student", { replace: true });
    }
  }, [currentUser, userProfile, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // redirect handled by useEffect above
    } catch (err) {
      const code = err?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Check your credentials.");
      }
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI', sans-serif",
      display: "flex", alignItems: "center", padding: `40px ${T.px}`
    }}>
      <div style={{ maxWidth: T.maxWidth, margin: "0 auto", width: "100%", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>

        {/* Left panel */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{
            background: T.gradientHero,
            borderRadius: 20, padding: 48, color: "#fff", height: 400,
            display: "flex", flexDirection: "column", justifyContent: "center"
          }}>
            <GraduationCap size={52} color="rgba(255,255,255,0.9)" strokeWidth={1.2} style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 12px" }}>Welcome Back</h2>
            <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7, margin: 0 }}>
              Log in to access your personalized dashboard, assignments, and courses.
            </p>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: ShieldCheck, text: "Secure login" },
                { icon: Zap, text: "Role-based access" },
                { icon: GraduationCap, text: "Real-time updates" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.9 }}>
                  <Icon size={16} color="#fff" strokeWidth={2} />
                  <span style={{ fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, minWidth: 300, maxWidth: 440 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Account Access
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.text, margin: "10px 0 6px" }}>Log In</h1>
          <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: T.primary, fontWeight: 600, textDecoration: "none" }}>Sign up</Link>
          </p>

          {error && (
            <div style={{
              background: "#fde8e8", color: "#c62828", fontSize: 13,
              padding: "10px 14px", borderRadius: T.radiusSm, marginBottom: 20,
              border: "1px solid #f5c6c6"
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            <button type="submit" disabled={loading} style={{
              background: T.gradientCard, color: "#fff", border: "none",
              padding: "13px 0", borderRadius: 12, fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4
            }}>
              {loading ? "Logging in..." : "Log In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type} required value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 14px", fontSize: 13,
          border: `1.5px solid ${focused ? T.primary : T.border}`,
          borderRadius: T.radiusSm, outline: "none", background: T.white,
          color: T.text, boxSizing: "border-box", transition: "border-color 0.2s"
        }}
      />
    </div>
  );
}
