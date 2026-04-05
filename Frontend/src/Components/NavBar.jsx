import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";
import logo from "../assets/logo.png";
import logoname from "../assets/logoname.png";
import {
  Home, LayoutDashboard, LogIn, UserPlus, LogOut,
  GraduationCap, BookOpen, Menu, X, ChevronDown
} from "lucide-react";

export default function NavBar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarHov, setAvatarHov] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  async function handleLogout() {
    try { await logout(); navigate("/login", { replace: true }); }
    catch (e) { console.error(e); }
  }

  const dashboardPath = userProfile?.role === "teacher" ? "/teacher" : "/student";
  const dashboardIcon = userProfile?.role === "teacher" ? BookOpen : GraduationCap;
  const DashIcon = dashboardIcon;

  // Avatar initials
  const initials = userProfile?.name
    ? userProfile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const linkStyle = (path) => ({
    display: "flex", alignItems: "center", gap: 7,
    fontSize: 13, fontWeight: 600, textDecoration: "none",
    color: isActive(path) ? T.primary : T.text,
    padding: "6px 12px", borderRadius: 8,
    background: isActive(path) ? T.primaryLight : "transparent",
    transition: "all 0.18s",
    position: "relative",
  });

  return (
    <>
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link:hover {
          background: ${T.bg} !important;
          color: ${T.primary} !important;
        }
        .nav-link:hover svg { color: ${T.primary} !important; }
        .mobile-link:hover { background: ${T.primaryLight} !important; color: ${T.primary} !important; }
      `}</style>

      <nav style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? T.border : "transparent"}`,
        boxShadow: scrolled ? "0 4px 24px rgba(79,70,229,0.10)" : "none",
        position: "sticky", top: 0, zIndex: 200,
        transition: "box-shadow 0.3s, border-color 0.3s"
      }}>
        <div style={{
          maxWidth: T.maxWidth, margin: "0 auto",
          padding: `0 ${T.px}`, height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>

          {/* ── Brand ── */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logo} alt="logo" style={{ height: 38, width: "auto", objectFit: "contain" }} />
            <img src={logoname} alt="EduConnect" style={{ height: 18, width: "auto", objectFit: "contain" }} />
          </Link>

          {/* ── Desktop Nav ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">

            <Link to="/" className="nav-link" style={linkStyle("/")}>
              <Home size={15} strokeWidth={2} color={isActive("/") ? T.primary : T.textMuted} />
              Home
            </Link>

            {currentUser && userProfile ? (
              <>
                <Link to={dashboardPath} className="nav-link" style={linkStyle(dashboardPath)}>
                  <DashIcon size={15} strokeWidth={2} color={isActive(dashboardPath) ? T.primary : T.textMuted} />
                  Dashboard
                </Link>

                {/* Avatar dropdown */}
                <div style={{ position: "relative", marginLeft: 8 }}>
                  <button
                    onClick={() => setDropOpen(p => !p)}
                    onMouseEnter={() => setAvatarHov(true)}
                    onMouseLeave={() => setAvatarHov(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: avatarHov ? T.bg : "transparent",
                      border: `1.5px solid ${avatarHov || dropOpen ? T.primary : T.border}`,
                      borderRadius: 40, padding: "5px 12px 5px 5px",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    {/* Avatar circle */}
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: T.gradientCard,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0
                    }}>{initials}</div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
                        {userProfile.name?.split(" ")[0]}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: T.textMuted, lineHeight: 1.2, textTransform: "capitalize" }}>
                        {userProfile.role}
                      </p>
                    </div>
                    <ChevronDown size={13} color={T.textMuted} style={{ transition: "transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "none" }} />
                  </button>

                  {/* Dropdown */}
                  {dropOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 10px)", right: 0,
                      background: T.white, borderRadius: 14, minWidth: 200,
                      boxShadow: "0 12px 40px rgba(79,70,229,0.18)",
                      border: `1px solid ${T.border}`, overflow: "hidden",
                      animation: "fadeDown 0.18s ease"
                    }}>
                      {/* User info header */}
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: T.gradientCard,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 800, color: "#fff"
                          }}>{initials}</div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: T.text }}>{userProfile.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>{userProfile.email}</p>
                          </div>
                        </div>
                        <span style={{
                          display: "inline-block", marginTop: 8,
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 20,
                          background: userProfile.role === "teacher" ? "#ede9fe" : T.primaryLight,
                          color: userProfile.role === "teacher" ? "#7c3aed" : T.primary
                        }}>{userProfile.role}</span>
                      </div>

                      {/* Menu items */}
                      <div style={{ padding: "6px 0" }}>
                        <Link to={dashboardPath} onClick={() => setDropOpen(false)} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 16px", textDecoration: "none",
                          fontSize: 13, color: T.text, fontWeight: 500,
                          transition: "background 0.15s"
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = T.bg}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <LayoutDashboard size={15} color={T.primary} strokeWidth={2} />
                          My Dashboard
                        </Link>

                        <div style={{ height: 1, background: T.border, margin: "4px 0" }} />

                        <button onClick={handleLogout} style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 16px", background: "none", border: "none",
                          fontSize: 13, color: "#dc2626", fontWeight: 600,
                          cursor: "pointer", textAlign: "left", transition: "background 0.15s"
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <LogOut size={15} color="#dc2626" strokeWidth={2} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" style={linkStyle("/login")}>
                  <LogIn size={15} strokeWidth={2} color={isActive("/login") ? T.primary : T.textMuted} />
                  Login
                </Link>
                <Link to="/signup" style={{
                  display: "flex", alignItems: "center", gap: 7,
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  textDecoration: "none", background: T.gradientCard,
                  padding: "9px 20px", borderRadius: 24,
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                  transition: "all 0.2s", marginLeft: 4
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(79,70,229,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.3)"; }}
                >
                  <UserPlus size={14} strokeWidth={2.5} />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMobileOpen(p => !p)}
            style={{
              display: "none", background: "none", border: `1.5px solid ${T.border}`,
              borderRadius: 8, padding: 6, cursor: "pointer", color: T.text
            }}
            className="hamburger"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div style={{
            borderTop: `1px solid ${T.border}`,
            background: T.white, padding: "12px 20px 20px",
            animation: "fadeDown 0.2s ease"
          }}>
            {/* User info if logged in */}
            {currentUser && userProfile && (
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: T.bg, borderRadius: 12, marginBottom: 12
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: T.gradientCard,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "#fff"
                }}>{initials}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: T.text }}>{userProfile.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>{userProfile.email}</p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { to: "/", icon: Home, label: "Home" },
                ...(currentUser && userProfile ? [
                  { to: dashboardPath, icon: LayoutDashboard, label: "Dashboard" },
                ] : [
                  { to: "/login", icon: LogIn, label: "Login" },
                  { to: "/signup", icon: UserPlus, label: "Sign Up" },
                ])
              ].map(item => (
                <Link key={item.to} to={item.to} className="mobile-link" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", borderRadius: 10, textDecoration: "none",
                  fontSize: 13, fontWeight: 600,
                  color: isActive(item.to) ? T.primary : T.text,
                  background: isActive(item.to) ? T.primaryLight : "transparent",
                  transition: "all 0.15s"
                }}>
                  <item.icon size={16} strokeWidth={2} color={isActive(item.to) ? T.primary : T.textMuted} />
                  {item.label}
                </Link>
              ))}

              {currentUser && (
                <button onClick={handleLogout} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", borderRadius: 10, border: "none",
                  background: "#fef2f2", fontSize: 13, fontWeight: 700,
                  color: "#dc2626", cursor: "pointer", marginTop: 4, width: "100%"
                }}>
                  <LogOut size={16} strokeWidth={2} color="#dc2626" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Close dropdown on outside click */}
      {dropOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setDropOpen(false)} />
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
