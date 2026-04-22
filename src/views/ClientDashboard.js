import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getClientRequests } from "service/restApiTransport";

/* ─────────────────────────────────────────────
   Tiny SVG icons
───────────────────────────────────────────── */
const Icon = ({ d, size = 20, color = "#fff", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  package:  "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  truck:    "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  check:    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  pin:      "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  chat:     "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  map:      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  user:     "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  plus:     "M12 4v16m8-8H4",
  logout:   "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

/* ─────────────────────────────────────────────
   Bar Chart (SVG, no library)
───────────────────────────────────────────── */
function ActivityChart({ requests }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
      date: d.toISOString().split("T")[0],
    });
  }
  const counts = days.map(({ date }) =>
    requests.filter((r) => r.createdAt?.split("T")[0] === date).length
  );
  const max = Math.max(...counts, 1);
  const W = 400, H = 120, BAR_W = 32, GAP = (W - days.length * BAR_W) / (days.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: "100%", maxWidth: W }}>
      {counts.map((c, i) => {
        const barH = Math.max((c / max) * H, 4);
        const x = GAP + i * (BAR_W + GAP);
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={6}
              fill={c > 0 ? "url(#grad)" : "rgba(255,255,255,0.06)"} />
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle"
              fontSize={10} fill="rgba(255,255,255,0.4)">{days[i].label}</text>
            {c > 0 && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle"
                fontSize={10} fill="rgba(255,255,255,0.7)" fontWeight="600">{c}</text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Status badge helper
───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    pending:   { label: "En attente",  bg: "rgba(251,191,36,0.15)", color: "#fbbf24",  border: "rgba(251,191,36,0.3)"  },
    accepted:  { label: "Acceptée",    bg: "rgba(34,197,94,0.15)",  color: "#4ade80",  border: "rgba(34,197,94,0.3)"   },
    delivered: { label: "Livrée",      bg: "rgba(99,102,241,0.15)", color: "#818cf8",  border: "rgba(99,102,241,0.3)"  },
    cancelled: { label: "Annulée",     bg: "rgba(239,68,68,0.15)",  color: "#f87171",  border: "rgba(239,68,68,0.3)"   },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const isMounted = useRef(true);

  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    setMounted(true);
    const load = async () => {
      try {
        const res = await getClientRequests();
        if (isMounted.current) setRequests(res.data || []);
      } catch {
        // fallback to localStorage
        const local = JSON.parse(localStorage.getItem("clientRequests") || "[]");
        if (isMounted.current) setRequests(local);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    load();
    return () => { isMounted.current = false; };
  }, []);

  // KPI derivations
  const total     = requests.length;
  const pending   = requests.filter(r => !r.status || r.status === "pending").length;
  const accepted  = requests.filter(r => r.status === "accepted").length;
  const delivered = requests.filter(r => r.status === "delivered").length;

  const kpis = [
    { label: "Total demandes", value: total,    icon: ICONS.package, grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { label: "En attente",     value: pending,  icon: ICONS.clock,   grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Acceptées",      value: accepted, icon: ICONS.truck,   grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Livrées",        value: delivered,icon: ICONS.check,   grad: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
  ];

  const recentRequests = [...requests].slice(0, 6);

  const quickActions = [
    { label: "Nouvelle demande", to: "/client",   icon: ICONS.plus,   grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { label: "Tracking colis",   to: "/tracking", icon: ICONS.map,    grad: "linear-gradient(135deg,#1e293b,#334155)" },
    { label: "Messagerie",       to: "/chat",     icon: ICONS.chat,   grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Mon Profil",       to: "/profile/client", icon: ICONS.user, grad: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  ];

  /* ── Shared card style ── */
  const glass = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };

  return (
    <>
      {/* Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70%  { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        .dash-fadeup { animation: fadeUp 0.5s ease forwards; }
        .kpi-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }
        .kpi-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 12px 24px rgba(0,0,0,0.35) !important; }
        .action-btn { transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease; }
        .nav-link:hover { background: rgba(255,255,255,0.12) !important; }
        .nav-link { transition: background 0.2s; }
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
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingLeft: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            }}>
              <Icon d={ICONS.truck} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>TransportApp</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Client Portal</div>
            </div>
          </div>

          {/* Nav items */}
          {[
            { label: "Dashboard",       to: "/dashboard/client",   icon: ICONS.package, active: true  },
            { label: "Nouvelle demande",to: "/client",             icon: ICONS.plus,    active: false },
            { label: "Tracking",        to: "/tracking",           icon: ICONS.map,     active: false },
            { label: "Messagerie",      to: "/chat",               icon: ICONS.chat,    active: false },
            { label: "Mon Profil",      to: "/profile/client",     icon: ICONS.user,    active: false },
          ].map(({ label, to, icon, active }) => (
            <Link key={to} to={to} className="nav-link" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 12, marginBottom: 4,
              textDecoration: "none", color: active ? "#fff" : "rgba(255,255,255,0.5)",
              background: active ? "rgba(59,130,246,0.18)" : "transparent",
              border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
              fontWeight: active ? 600 : 400, fontSize: 13,
            }}>
              <Icon d={icon} size={16} color={active ? "#60a5fa" : "rgba(255,255,255,0.4)"} />
              {label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          {/* User card at bottom */}
          <div style={{
            ...glass, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {(currentUser?.name || currentUser?.email || "C").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser?.name || "Client"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser?.email || ""}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ marginLeft: 240, padding: "32px 36px", minHeight: "100vh" }}>

          {/* Top bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36,
          }} className="dash-fadeup">
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>
                Bonjour, {currentUser?.name?.split(" ")[0] || "Client"} 👋
              </h1>
            </div>
            <Link to="/client" style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
            }} className="action-btn">
              <Icon d={ICONS.plus} size={15} color="#fff" />
              Nouvelle demande
            </Link>
          </div>

          {/* ── KPI Cards ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 32,
          }}>
            {kpis.map((k, i) => (
              <div key={i} className="kpi-card" style={{
                ...glass, padding: "22px 24px",
                animation: `fadeUp 0.5s ease ${i * 0.07}s both`,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: k.grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}>
                  <Icon d={k.icon} size={19} color="#fff" />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  {loading ? "—" : k.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 5, fontWeight: 500 }}>
                  {k.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Bottom grid: Recent requests + Chart + Quick Actions ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

            {/* Recent requests table */}
            <div style={{ ...glass, padding: "24px 28px", animation: "fadeUp 0.5s ease 0.3s both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Mes demandes récentes</h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Vos {Math.min(6, requests.length)} dernières demandes</p>
                </div>
                <Link to="/client" style={{
                  fontSize: 11, fontWeight: 600, color: "#60a5fa",
                  textDecoration: "none",
                  background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                  padding: "5px 12px", borderRadius: 8,
                }}>Nouvelle +</Link>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px 0", fontSize: 13 }}>
                  Chargement...
                </div>
              ) : recentRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Aucune demande encore</div>
                  <Link to="/client" style={{
                    display: "inline-block", marginTop: 16, padding: "8px 20px", borderRadius: 10,
                    background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff",
                    textDecoration: "none", fontSize: 12, fontWeight: 600,
                  }}>Créer ma première demande</Link>
                </div>
              ) : (
                <div>
                  {/* Table header */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 90px 70px 100px",
                    padding: "0 0 10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    {["Départ", "Livraison", "Date", "Poids", "Statut"].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  {recentRequests.map((r, i) => (
                    <div key={r._id || i} className="row-hover" style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr 90px 70px 100px",
                      padding: "13px 0",
                      borderBottom: i < recentRequests.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      borderRadius: 8,
                    }}>
                      <span style={{ fontSize: 12, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8 }}>
                        {r.pickupLocation || "—"}
                      </span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8 }}>
                        {r.deliveryLocation || "—"}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        {r.date ? new Date(r.date).toLocaleDateString("fr-FR") : "—"}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        {r.weight ? `${r.weight} kg` : "—"}
                      </span>
                      <StatusBadge status={r.status || "pending"} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Activity chart */}
              <div style={{ ...glass, padding: "22px 24px", animation: "fadeUp 0.5s ease 0.35s both" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Activité (7 jours)</h2>
                <ActivityChart requests={requests} />
              </div>

              {/* Quick actions */}
              <div style={{ ...glass, padding: "22px 24px", animation: "fadeUp 0.5s ease 0.4s both" }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Actions rapides</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {quickActions.map(({ label, to, icon, grad }) => (
                    <Link key={to} to={to} className="action-btn" style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 8, padding: "16px 10px", borderRadius: 14,
                      background: grad, color: "#fff", textDecoration: "none",
                      fontSize: 11, fontWeight: 600, textAlign: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                      minHeight: 80,
                    }}>
                      <Icon d={icon} size={20} color="#fff" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
