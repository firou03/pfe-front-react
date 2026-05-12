import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const ICONS = {
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  users: "M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 13H4.458c-1.119 0-2.02.905-1.98 2.024.087 2.755 1.899 5.228 4.514 5.858m0-13.986h7.541c1.12 0 2.021.905 1.981 2.024-.087 2.755-1.899 5.228-4.513 5.858",
  inbox: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

const Icon = ({ d, size = 20, color = "#fff", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function StatusBadge({ status }) {
  const map = {
    pending: { label: "En attente", bg: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
    accepted: { label: "Acceptée", bg: "rgba(34,197,94,0.15)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    delivered: { label: "Livrée", bg: "rgba(99,102,241,0.15)", color: "#818cf8", border: "rgba(99,102,241,0.3)" },
    cancelled: { label: "Annulée", bg: "rgba(239,68,68,0.15)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

/** Même idée que ActivityChart du ClientDashboard, données issues de l’API admin. */
function WeeklyActivityChart({ weekly = [] }) {
  const data =
    weekly.length > 0
      ? weekly.map((w) => ({ l: w.day || "?", v: w.count ?? 0 }))
      : Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return { l: d.toLocaleDateString("fr-FR", { weekday: "short" }), v: 0 };
        });
  const max = Math.max(...data.map((x) => x.v), 1);
  const W = 400;
  const H = 120;
  const BAR_W = 32;
  const GAP = (W - data.length * BAR_W) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} style={{ width: "100%", maxWidth: W }}>
      {data.map((row, i) => {
        const barH = Math.max((row.v / max) * H, 4);
        const x = GAP + i * (BAR_W + GAP);
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={6} fill={row.v > 0 ? "url(#adminGrad)" : "rgba(255,255,255,0.06)"} />
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.4)">
              {row.l}
            </text>
            {row.v > 0 && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.7)" fontWeight="600">
                {row.v}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.65" />
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

const QUICK_ACTIONS = [
  { label: "Utilisateurs", to: "/admin/users", icon: ICONS.users, grad: "linear-gradient(135deg,#e879f9,#c084fc)" },
  { label: "Expéditions", to: "/admin/requests", icon: ICONS.inbox, grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
  { label: "Avis", to: "/admin/reviews", icon: ICONS.star, grad: "linear-gradient(135deg,#fbbf24,#d97706)" },
  { label: "Statistiques", to: "/admin/stats", icon: ICONS.chart, grad: "linear-gradient(135deg,#34d399,#059669)" },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState(null);
  const mounted = useRef(true);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(`${API_BASE}/api/admin/dashboard-stats`, { headers })
      .then((res) => {
        if (!mounted.current) return;
        setDash(res.data?.data || {});
      })
      .catch(() => {
        if (mounted.current) setDash({});
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  const total = dash?.totalRequests ?? 0;
  const pending = dash?.pendingRequests ?? 0;
  const accepted = dash?.acceptedRequests ?? 0;
  const delivered = dash?.deliveredRequests ?? 0;
  const revenue = typeof dash?.totalRevenue === "number" ? dash.totalRevenue : 0;

  const kpis = [
    { label: "Total demandes", value: total, icon: ICONS.package, grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { label: "En attente", value: pending, icon: ICONS.clock, grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Acceptées", value: accepted, icon: ICONS.truck, grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Livrées", value: delivered, icon: ICONS.check, grad: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
  ];

  const recent = Array.isArray(dash?.recentRequests) ? dash.recentRequests.slice(0, 6) : [];
  const weekly = Array.isArray(dash?.weeklyRequests) ? dash.weeklyRequests : [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-dash-fadeup { animation: fadeUp 0.5s ease forwards; }
        .admin-kpi-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }
        .admin-kpi-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .admin-action-btn:hover { transform: translateY(-3px); filter: brightness(1.1); box-shadow: 0 12px 24px rgba(0,0,0,0.35) !important; }
        .admin-action-btn { transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease; }
        .admin-row-hover:hover { background: rgba(255,255,255,0.04) !important; }
        .admin-row-hover { transition: background 0.15s; }
        .admin-dash-bleed {
          margin: -2rem 0 0 0;
          padding: 2rem 0 3rem;
          max-width: 100%;
        }
        .admin-kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
        @media (max-width: 1100px) {
          .admin-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 520px) {
          .admin-kpi-grid { grid-template-columns: 1fr !important; }
        }
        .admin-bottom-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; }
        @media (max-width: 1024px) {
          .admin-bottom-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        className="admin-dash-bleed"
        style={{
          minHeight: "calc(100vh - 4rem)",
          background: "linear-gradient(135deg,#0a0f1e 0%,#0f172a 40%,#0d1b2e 100%)",
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <div className="admin-dash-fadeup" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>
              Bonjour, {currentUser?.name?.split(" ")?.[0] || "Admin"} 👋
            </h1>
           
          </div>
          <Link
            to="/admin/stats"
            className="admin-action-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
            }}
          >
            <Icon d={ICONS.chart} size={15} color="#fff" />
            Voir les statistiques
          </Link>
        </div>

        <div className="admin-kpi-grid" style={{ marginBottom: 36 }}>
          {kpis.map((k, i) => (
            <div
              key={k.label}
              className="admin-kpi-card"
              style={{
                ...glass,
                padding: "22px 24px",
                animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: k.grad,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <Icon d={k.icon} size={20} color="#fff" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{loading ? "—" : k.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 5, fontWeight: 500 }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ ...glass, padding: "18px 22px", marginBottom: 28, animation: "fadeUp 0.45s ease 0.2s both" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Revenu plateforme (transporteurs)</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {loading ? "—" : `${revenue.toFixed(2)} DT`}
          </div>
        </div>

        <div className="admin-bottom-grid">
          <div style={{ ...glass, padding: "24px 28px", animation: "fadeUp 0.5s ease 0.28s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>Demandes récentes</h2>
              <Link to="/admin/requests" style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", textDecoration: "none" }}>
                Tout voir →
              </Link>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>Chargement...</div>
            ) : recent.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>Aucune demande</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recent.map((r, i) => (
                  <div key={r._id || i} className="admin-row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 8px", borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {r.pickupLocation || "—"} → {r.deliveryLocation || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : ""}
                      </div>
                    </div>
                    <StatusBadge status={r.status || "pending"} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ ...glass, padding: "22px 24px", animation: "fadeUp 0.5s ease 0.32s both" }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Activité (7 jours)</h2>
              <WeeklyActivityChart weekly={weekly} />
            </div>
            <div style={{ ...glass, padding: "22px 24px", animation: "fadeUp 0.5s ease 0.38s both" }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Actions rapides</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.label} to={a.to} className="admin-action-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 10px", borderRadius: 14, background: a.grad, textDecoration: "none", color: "#fff", fontSize: 11, fontWeight: 600 }}>
                    <Icon d={a.icon} size={20} />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
