import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";
import logo from "../assets/logo.png";
import logoname from "../assets/logoname.png";

export default function NavBar() {

  const [hov, setHov] = useState(null);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLink = (key, label, to) => (
    <Link
      to={to}
      onMouseEnter={() => setHov(key)}
      onMouseLeave={() => setHov(null)}
      style={{
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        color: hov === key ? T.primary : T.text,
        borderBottom: hov === key
          ? `2px solid ${T.primary}`
          : "2px solid transparent",
        paddingBottom: 2,
        transition: "all 0.2s"
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{
      background: T.white,
      borderBottom: `1px solid ${T.border}`,
      boxShadow: T.shadow,
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: T.maxWidth,
        margin: "0 auto",
        padding: `0 ${T.px}`,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        
        {/* BRAND (LOGO) */}
        <Link to="/" style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <img
            src={logo}
            alt="logo"
            style={{
              height: 40,
              width: "auto",
              objectFit: "contain"
            }}
          />
          <img
            src={logoname}
            alt="EduConnect"
            style={{
              height: 20,
              width: "auto",
              objectFit: "contain"
            }}
          />
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {navLink("home", "Home", "/")}
          
          {currentUser && userProfile ? (
            <>
              {/* Authenticated User Links */}
              {userProfile.role === "student" && navLink("dashboard", "My Dashboard", "/student")}
              {userProfile.role === "teacher" && navLink("dashboard", "My Dashboard", "/teacher")}
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, color: T.textMuted }}>
                  {userProfile.name}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.white,
                    textDecoration: "none",
                    background: "#ff6b6b",
                    padding: "9px 22px",
                    borderRadius: 24,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ff5252"}
                  onMouseLeave={e => e.currentTarget.style.background = "#ff6b6b"}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest Links */}
              {navLink("login", "Login", "/login")}

              <Link to="/signup"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.white,
                  textDecoration: "none",
                  background: T.primary,
                  padding: "9px 22px",
                  borderRadius: 24,
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.primaryDark}
                onMouseLeave={e => e.currentTarget.style.background = T.primary}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}