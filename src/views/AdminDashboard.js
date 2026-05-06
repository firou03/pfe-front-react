import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

/* ─────────────────────────────────────────────
   Tiny SVG icons
 ───────────────────────────────────────────── */
const Icon = ({ d, size = 20, color = "#fff", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  users: "M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 13H4.458c-1.119 0-2.02.905-1.98 2.024.087 2.755 1.899 5.228 4.514 5.858m0-13.986h7.541c1.12 0 2.021.905 1.981 2.024-.087 2.755-1.899 5.228-4.513 5.858m6.5-13.986c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm-3 8.99c.93 0 1.78.384 2.38 1",
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  trending: "M13 7H5v12h8V7zm0-2h8v14h-8V5zm4 10l-2-3-3 4-2-2",
  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v.01M12 4c-4.418 0-8 1.79-8 4v8c0 2.21 3.582 4 8 4s8-1.79 8-4V8c0-2.21-3.582-4-8-4z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  settings: "M12 6a1 1 0 00-1-1H9a1 1 0 00-1 1v.01a1 1 0 001 1h2a1 1 0 001-1V6zm0 7a1 1 0 00-1-1H9a1 1 0 00-1 1v.01a1 1 0 001 1h2a1 1 0 001-1v-.01zm6-7a1 1 0 00-1-1h-2a1 1 0 00-1 1v.01a1 1 0 001 1h2a1 1 0 001-1V6zm0 7a1 1 0 00-1-1h-2a1 1 0 00-1 1v.01a1 1 0 001 1h2a1 1 0 001-1v-.01z",
  check: "M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z",
  alert: "M12 9v2m0 4v2m-6-4h12a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2z",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  plus: "M12 4v16m8-8H4",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

/* ─────────────────────────────────────────────
   Bar Chart (SVG)
 ───────────────────────────────────────────── */
function ActivityChart({ data = [] }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 400, H = 120, BAR_W = 32, GAP = (W - data.length * BAR_W) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: "100%", maxWidth: W }}>
      {data.map((d, i) => {
        const barH = Math.max((d.v / max) * H, 4);
        const x = GAP + i * (BAR_W + GAP);
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={6}
              fill={d.v > 0 ? "url(#grad)" : "rgba(255,255,255,0.06)"} />
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle"
              fontSize={10} fill="rgba(255,255,255,0.4)">{d.l}</text>
            {d.v > 0 && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle"
                fontSize={10} fill="rgba(255,255,255,0.7)" fontWeight="600">{d.v}</text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalTransporteurs: 0,
    totalRequests: 0,
    totalRevenue: 0,
    pendingRequests: 0,
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    isMounted.current = true;
    const load = async () => {
      try {
        // Fetch dashboard stats from new admin endpoint
        const statsRes = await axios.get("http://localhost:5000/api/admin/dashboard-stats")
          .catch(() => ({ data: { data: {} } }));

        const dashStats = statsRes.data?.data || {};

        // Fetch all users for user count breakdown
        const usersRes = await axios.get("http://localhost:5000/users/getAllUsers")
          .catch(() => ({ data: { data: [] } }));

        const allUsers = usersRes.data?.data || [];
        const clients = allUsers.filter(u => u.role === "client").length;
        const transporteurs = allUsers.filter(u => u.role === "transporteur").length;

        if (isMounted.current) {
          setStats({
            totalUsers: allUsers.length,
            totalClients: clients,
            totalTransporteurs: transporteurs,
            totalRequests: dashStats.totalRequests || 0,
            totalRevenue: dashStats.totalRevenue || 0,
            pendingRequests: dashStats.pendingRequests || 0,
          });
          setRequests(dashStats.recentRequests || []);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        if (isMounted.current) setError(err.message);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    load();
    return () => { isMounted.current = false; };
  }, []);

  const kpis = [
    { label: "Total Utilisateurs", value: loading ? "—" : stats.totalUsers, icon: ICONS.users, grad: "linear-gradient(135deg,#e879f9,#c084fc)" },
    { label: "Total Demandes", value: loading ? "—" : stats.totalRequests, icon: ICONS.package, grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { label: "Revenu Total", value: loading ? "—" : `${stats.totalRevenue.toFixed(2)} DT`, icon: ICONS.dollar, grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "En attente", value: loading ? "—" : stats.pendingRequests, icon: ICONS.alert, grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
  ];

  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        l: d.toLocaleDateString("fr-FR", { weekday: "short" }),
        v: requests.filter(r => r.createdAt?.split("T")[0] === d.toISOString().split("T")[0]).length,
      });
    }
    return days;
  })();

  const recentRequests = requests.slice(0, 6);

  const quickActions = [
    { label: "Utilisateurs", to: "/admin/users", icon: ICONS.users, grad: "linear-gradient(135deg,#e879f9,#c084fc)" },
    { label: "Demandes", to: "/admin/requests", icon: ICONS.package, grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { label: "Avis", to: "/admin/reviews", icon: ICONS.star, grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Statistiques", to: "/admin/stats", icon: ICONS.chart, grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
  ];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-fadeup { animation: fadeUp 0.5s ease forwards; }
        .kpi-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }
        .kpi-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 12px 24px rgba(0,0,0,0.35) !important; }
        .action-btn { transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease; }
        .row-hover:hover { background: rgba(255,255,255,0.04) !important; }
        .row-hover { transition: background 0.15s; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a0f1e 0%,#0f172a 40%,#0d1b2e 100%)",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}>

        {/* ── Sidebar ── */}
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "28px 16px",
          display: "flex", flexDirection: "column",
          zIndex: 100,
          overflowY: "auto",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingLeft: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#e879f9,#c084fc)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(232,121,249,0.4)",
            }}>
              <Icon d={ICONS.settings} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>TransportApp</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Admin Panel</div>
            </div>
          </div>

          {/* Nav items */}
          {[
            { label: "Dashboard", to: "/dashboard/admin", icon: ICONS.chart, active: true },
            { label: "Utilisateurs", to: "/admin/users", icon: ICONS.users, active: false },
            { label: "Demandes", to: "/admin/requests", icon: ICONS.package, active: false },
            { label: "Avis", to: "/admin/reviews", icon: ICONS.star, active: false },
            { label: "Statistiques", to: "/admin/stats", icon: ICONS.chart, active: false },
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", marginBottom: 6,
              borderRadius: 12, textDecoration: "none", fontSize: 12, fontWeight: 500,
              color: item.active ? "#e879f9" : "rgba(255,255,255,0.5)",
              background: item.active ? "rgba(232,121,249,0.1)" : "transparent",
              transition: "all 0.2s", cursor: "pointer",
            }}>
              <Icon d={item.icon} size={16} color={item.active ? "#e879f9" : "rgba(255,255,255,0.3)"} />
              {item.label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          {/* User Card */}
          <div style={{
            padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 16,
            display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#e879f9,#c084fc)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>
              {currentUser?.name?.[0] || "A"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.name || "Admin"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Administrateur</div>
            </div>
          </div>

          {/* Logout Button */}
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            padding: "10px 12px", marginTop: 12, borderRadius: 10, cursor: "pointer",
            color: "#ef4444", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
          }}>
            <Icon d={ICONS.logout} size={14} color="#ef4444" />
            Déconnexion
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: 240, padding: "30px 40px" }}>
          {/* Header */}
          <header style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2, letterSpacing: 1 }}>
                Dashboard
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
                Bonjour, {currentUser?.name?.split(" ")[0] || "Admin"}
              </h1>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </header>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              padding: 16, borderRadius: 12, marginBottom: 20, color: "#fca5a5",
            }}>
              ⚠️ Erreur: {error}
            </div>
          )}

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 30 }}>
            {kpis.map((k, i) => (
              <div key={i} className="kpi-card" style={{
                ...glass, padding: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: k.grad, display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: 12, boxShadow: `0 4px 12px ${k.grad}33`,
                }}>
                  <Icon d={k.icon} size={20} color="#fff" />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                  {k.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  {k.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
            {/* Activity Chart */}
            <div style={{ ...glass, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Activité (7 derniers jours)</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  Nouvelles demandes par jour
                </p>
              </div>
              <ActivityChart data={chartData} />
            </div>

            {/* Quick Actions */}
            <div style={{ ...glass, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 700 }}>Actions rapides</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {quickActions.map((a, i) => (
                  <Link key={i} to={a.to} style={{
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
                    padding: 12, background: a.grad, borderRadius: 12,
                    cursor: "pointer", transition: "all 0.2s", opacity: 0.9,
                  }} className="action-btn">
                    <Icon d={a.icon} size={16} color="#fff" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div style={{ ...glass, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Demandes récentes</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  Les 6 dernières demandes
                </p>
              </div>
              <Link to="/admin/requests" style={{
                fontSize: 12, fontWeight: 600, color: "#e879f9", textDecoration: "none",
                cursor: "pointer", transition: "opacity 0.2s",
              }}>
                Voir tout →
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                      ID
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                      Client
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                      Transporteur
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                      Montant
                    </th>
                    <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                        Chargement...
                      </td>
                    </tr>
                  ) : recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                        Aucune demande
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req, i) => (
                      <tr key={i} className="row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "12px 0", fontSize: 12, fontWeight: 600, color: "#e879f9" }}>
                          {req._id?.substring(0, 8) || "—"}
                        </td>
                        <td style={{ padding: "12px 0", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                          {req.client?.name || "—"}
                        </td>
                        <td style={{ padding: "12px 0", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                          {req.transporteur?.name || "—"}
                        </td>
                        <td style={{ padding: "12px 0", fontSize: 12, fontWeight: 600, color: "#22c55e" }}>
                          {req.price || 0} DT
                        </td>
                        <td style={{ padding: "12px 0" }}>
                          <span style={{
                            display: "inline-block", padding: "4px 10px", borderRadius: 6,
                            fontSize: 10, fontWeight: 600,
                            background: req.status === "pending" ? "rgba(245,158,11,0.15)" :
                              req.status === "accepted" ? "rgba(52,211,153,0.15)" :
                                req.status === "delivered" ? "rgba(96,165,250,0.15)" :
                                  "rgba(107,114,128,0.15)",
                            color: req.status === "pending" ? "#fbbf24" :
                              req.status === "accepted" ? "#34d399" :
                                req.status === "delivered" ? "#60a5fa" :
                                  "#9ca3af",
                          }}>
                            {req.status === "pending" ? "En attente" :
                              req.status === "accepted" ? "Acceptée" :
                                req.status === "delivered" ? "Livrée" :
                                  "Annulée"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
