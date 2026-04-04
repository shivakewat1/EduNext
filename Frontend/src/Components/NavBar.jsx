import { useState } from "react";
import { Link } from "react-router-dom";
import { T } from "../theme";
import logo from "../assets/logo.png";
import logoname from "../assets/logoname.png";

export default function NavBar() {

  const [hov, setHov] = useState(null);

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
        
        {/* ✅ UPDATED BRAND (LOGO ADDED) */}
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
          {navLink("login", "Login", "/login")}

          <Link to="/signup"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.white,
              textDecoration: "none",
              background: T.primary,
              padding: "9px 22px",
              borderRadius: 24
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.primaryDark}
            onMouseLeave={e => e.currentTarget.style.background = T.primary}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}