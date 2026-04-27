/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import logosite from "../../assets/img/logosite.jpg";

export default function Navbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid #e2e8f0",
        height: 64,
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", width: "100%",
          padding: "0 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* ── Logo + Brand ── */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, overflow: "hidden",
              border: "0.5px solid #e2e8f0", flexShrink: 0,
            }}>
              <img src={logosite} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", lineHeight: 1.2 }}>
                TransportTN
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.2 }}>
                Plateforme de transport
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
          }} className="hidden lg:flex">

            {/* Nav links */}
            {[
              { label: "Accueil",        to: "/" },
              { label: "Comment ça marche", to: "/#how" },
              { label: "À propos",       to: "/#about" },
            ].map((item) => (
              <Link key={item.label} to={item.to} style={{
                padding: "7px 14px", borderRadius: 8,
                fontSize: 13, color: "#475569",
                textDecoration: "none", fontWeight: 400,
                transition: "all 0.15s",
              }}
                onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
              >
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div style={{ width: "0.5px", height: 20, background: "#e2e8f0", margin: "0 8px" }} />

            {/* Social icons */}
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer"
              style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              title="Facebook"
            >
              <i className="fab fa-facebook" style={{ fontSize: 15 }} />
            </a>

            <a href="https://www.twitter.com" target="_blank" rel="noreferrer"
              style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              title="Twitter"
            >
              <i className="fab fa-twitter" style={{ fontSize: 15 }} />
            </a>

            {/* Divider */}
            <div style={{ width: "0.5px", height: 20, background: "#e2e8f0", margin: "0 8px" }} />

            {/* Auth buttons */}
            <Link to="/auth/login" style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: "transparent", border: "0.5px solid #cbd5e1",
              color: "#475569", textDecoration: "none",
            }}>
              Se connecter
            </Link>

            <Link to="/auth/register" style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: "#378ADD", color: "#fff",
              textDecoration: "none", marginLeft: 8,
            }}>
              S'inscrire
            </Link>
          </div>

          {/* ── Mobile burger ── */}
          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            style={{
              display: "none", background: "transparent",
              border: "0.5px solid #e2e8f0", borderRadius: 8,
              width: 36, height: 36, cursor: "pointer",
              alignItems: "center", justifyContent: "center",
            }}
            className="flex lg:hidden"
          >
            {navbarOpen ? (
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "#475569", fill: "none", strokeWidth: "2" }}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: "#475569", fill: "none", strokeWidth: "2" }}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {navbarOpen && (
          <div style={{
            position: "absolute", top: 64, left: 0, right: 0,
            background: "#ffffff", borderBottom: "0.5px solid #e2e8f0",
            padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4,
          }}>
            {[
              { label: "Accueil",           to: "/" },
              { label: "Comment ça marche", to: "/#how" },
              { label: "À propos",          to: "/#about" },
            ].map((item) => (
              <Link key={item.label} to={item.to}
                onClick={() => setNavbarOpen(false)}
                style={{
                  padding: "10px 14px", borderRadius: 8, fontSize: 14,
                  color: "#475569", textDecoration: "none",
                  background: "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}

            <div style={{ height: "0.5px", background: "#e2e8f0", margin: "8px 0" }} />

            <Link to="/auth/login"
              onClick={() => setNavbarOpen(false)}
              style={{
                padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: "#475569", textDecoration: "none",
                border: "0.5px solid #e2e8f0", textAlign: "center",
              }}
            >
              Se connecter
            </Link>

            <Link to="/auth/register"
              onClick={() => setNavbarOpen(false)}
              style={{
                padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                background: "#378ADD", color: "#fff",
                textDecoration: "none", textAlign: "center",
              }}
            >
              S'inscrire
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}