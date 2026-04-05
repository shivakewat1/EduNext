import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";
import { Sparkles, CheckCircle, Zap, GraduationCap } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await signup(name, email, password, role);
      // After signup Firebase auth state updates → AuthContext loads profile → redirect
      navigate(role === "teacher" ? "/teacher" : "/student", { replace: true });
    } catch (err) {
      const code = err?.code;
      if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message || "Failed to create account.");
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
            borderRadius: 20, padding: 48, color: "#fff", height: 440,
            display: "flex", flexDirection: "column", justifyContent: "center"
          }}>
            <Sparkles size={52} color="rgba(255,255,255,0.9)" strokeWidth={1.2} style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 12px" }}>Join EduConnect</h2>
            <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7, margin: 0 }}>
              Create your account and start managing assignments, courses, and progress — all in one place.
            </p>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: CheckCircle, text: "Free to get started" },
                { icon: GraduationCap, text: "Teacher & Student roles" },
                { icon: Zap, text: "Instant dashboard access" },
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
            Get Started
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.text, margin: "10px 0 6px" }}>Create Account</h1>
          <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: T.primary, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
          </p>

          {error && (
            <div style={{
              background: "#fde8e8", color: "#c62828", fontSize: 13,
              padding: "10px 14px", borderRadius: T.radiusSm, marginBottom: 20,
              border: "1px solid #f5c6c6"
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="Full Name" type="text" value={name} onChange={setName} placeholder="Jane Doe" />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" />

            {/* Role selector */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "block", marginBottom: 8 }}>
                I am a...
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {["student", "teacher"].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)} style={{
                    flex: 1, padding: "11px 0", borderRadius: 10,
                    border: `1.5px solid ${role === r ? T.primary : T.border}`,
                    background: role === r ? T.gradientCard : T.white,
                    color: role === r ? "#fff" : T.textMuted,
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    textTransform: "capitalize", transition: "all 0.2s"
                  }}>{r === "student" ? "🎓 Student" : "👨‍🏫 Teacher"}</button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              background: T.gradientCard, color: "#fff", border: "none",
              padding: "13px 0", borderRadius: 12, fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4
            }}>
              {loading ? "Creating account..." : "Sign Up →"}
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
