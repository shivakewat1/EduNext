import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";
import logoname from "../assets/logoname.png";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  ShieldCheck, Zap, LayoutDashboard, AlertCircle,
  GraduationCap, BookOpen, Users
} from "lucide-react";

function Field({ label, type: initialType, value, onChange, placeholder, icon: Icon }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = initialType === "password";
  const type = isPassword ? (show ? "text" : "password") : initialType;

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: T.text, display: "block", marginBottom: 7, letterSpacing: "0.02em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon size={15} color={focused ? T.primary : T.textMuted} strokeWidth={2} />
        </div>
        <input
          type={type} required value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "12px 14px 12px 38px",
            fontSize: 13, border: `1.5px solid ${focused ? T.primary : T.border}`,
            borderRadius: 10, outline: "none", background: focused ? T.white : T.bg,
            color: T.text, boxSizing: "border-box", transition: "all 0.2s",
            boxShadow: focused ? `0 0 0 3px ${T.primaryLight}` : "none",
            paddingRight: isPassword ? 42 : 14,
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(p => !p)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 2,
            color: T.textMuted, display: "flex"
          }}>
            {show ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const { login, userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && userProfile) {
      navigate(userProfile.role === "teacher" ? "/teacher" : "/student", { replace: true });
    }
  }, [currentUser, userProfile, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const code = err?.code;
      if (["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"].includes(code)) {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Login failed. Check your credentials.");
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }`}</style>

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, background: T.gradientHero, color: "#fff",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px 52px", minHeight: "100vh", position: "relative", overflow: "hidden"
      }} className="login-left">
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <img src={logoname} alt="EduConnect" style={{ height: 22, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </div>

        {/* Center content */}
        <div style={{ position: "relative" }}>
          <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.15)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, border: "1px solid rgba(255,255,255,0.2)" }}>
            <BookOpen size={30} color="#fff" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 14px", lineHeight: 1.2 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: 15, opacity: 0.82, lineHeight: 1.75, margin: "0 0 36px", maxWidth: 340 }}>
            Log in to access your personalized dashboard, assignments, and courses.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: ShieldCheck,    text: "Secure Firebase authentication" },
              { icon: Users,          text: "Role-based access for teachers & students" },
              { icon: LayoutDashboard,text: "Personalized dashboard on login" },
              { icon: Zap,            text: "Real-time assignments & grading" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color="#fff" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 13, opacity: 0.88 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p style={{ fontSize: 12, opacity: 0.5, position: "relative" }}>
          © 2026 EduConnect · Built for modern education
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div style={{
        flex: 1, background: T.bg, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px 52px", minHeight: "100vh"
      }}>
        <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.35s ease" }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Account Access
            </span>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: T.text, margin: "8px 0 6px", lineHeight: 1.2 }}>
              Log In
            </h1>
            <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: T.primary, fontWeight: 700, textDecoration: "none" }}>Sign up free</Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: 13, padding: "11px 14px", borderRadius: 10, marginBottom: 22, border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={15} strokeWidth={2} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" icon={Lock} />

            <button type="submit" disabled={loading} style={{
              marginTop: 6, background: loading ? T.border : T.gradientCard,
              color: loading ? T.textMuted : "#fff", border: "none",
              padding: "14px 0", borderRadius: 12, fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s", boxShadow: loading ? "none" : "0 4px 14px rgba(79,70,229,0.35)"
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
            >
              {loading
                ? <><span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Logging in...</>
                : <>Log In <ArrowRight size={16} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 12, color: T.textMuted }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <Link to="/signup" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "13px 0", borderRadius: 12, border: `1.5px solid ${T.border}`,
            background: T.white, color: T.text, fontWeight: 600, fontSize: 13,
            textDecoration: "none", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
          >
            Create a new account
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .login-left { display: none !important; } }
      `}</style>
    </div>
  );
}
