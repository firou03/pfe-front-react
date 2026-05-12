import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const Icon = ({ d, size = 16, color = "#fff", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  dashboard: "M3 12a9 9 0 110 18 9 9 0 010-18z",
  users: "M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 13H4.458c-1.119 0-2.02.905-1.98 2.024.087 2.755 1.899 5.228 4.514 5.858m0-13.986h7.541c1.12 0 2.021.905 1.981 2.024-.087 2.755-1.899 5.228-4.513 5.858m6.5-13.986c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm-3 8.99c.93 0 1.78.384 2.38 1",
  inbox: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

const glass = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
};

const MENU = [
  { path: "/admin/dashboard", label: "Dashboard", icon: ICONS.dashboard },
  { path: "/admin/users", label: "Utilisateurs", icon: ICONS.users },
  { path: "/admin/requests", label: "Expéditions", icon: ICONS.inbox },
  { path: "/admin/reviews", label: "Avis clients", icon: ICONS.star },
  { path: "/admin/stats", label: "Statistiques", icon: ICONS.chart },
];

export default function AdminSidebar() {
  const location = useLocation();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <>
      <style>{`
        .admin-nav-link { transition: background 0.2s; }
        .admin-nav-link:hover { background: rgba(255,255,255,0.09) !important; }
      `}</style>

      <aside
        className="flex-shrink-0"
        style={{
          width: 240,
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
          maxHeight: "100vh",
          overflowY: "auto",
          background: "#0f172a",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: "28px 16px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Logo — même principe que ClientDashboard */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingLeft: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            }}
          >
            <Icon d={ICONS.truck} size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>TransportApp</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Admin Portal</div>
          </div>
        </div>

        {/* Navigation — actif = surbrillance bleue comme le client */}
        <nav style={{ flex: 1 }}>
          {MENU.map(({ path, label, icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="admin-nav-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 12,
                  marginBottom: 4,
                  textDecoration: "none",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  background: active ? "rgba(59,130,246,0.18)" : "transparent",
                  border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                }}
              >
                <Icon d={icon} size={16} color={active ? "#60a5fa" : "rgba(255,255,255,0.4)"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Carte utilisateur — identique au dashboard client */}
        <div
          style={{
            ...glass,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            {(currentUser?.name || currentUser?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentUser?.name || "Administrateur"}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentUser?.email || ""}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          <Icon d={ICONS.logout} size={16} color="#f87171" />
          Déconnexion
        </button>

        <Link
          to="/"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}
        >
          ← Retour au site
        </Link>
      </aside>
    </>
  );
}
