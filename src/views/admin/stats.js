import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PageHeader from "components/dashboard/PageHeader";

const Icon = ({ d, size = 20, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  check: "M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  users: "M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 13H4.458c-1.119 0-2.02.905-1.98 2.024.087 2.755 1.899 5.228 4.514 5.858m0-13.986h7.541c1.12 0 2.021.905 1.981 2.024-.087 2.755-1.899 5.228-4.513 5.858",
  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v.01M12 4c-4.418 0-8 1.79-8 4v8c0 2.21 3.582 4 8 4s8-1.79 8-4V8c0-2.21-3.582-4-8-4z",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
};

const API_BASE = "http://localhost:5000";

function BarChart({ data = [], color = "#e879f9" }) {
  const max = Math.max(...data.map(d => d.v || 0), 1);
  const W = 560, H = 120, BAR_W = 40;
  const n = data.length;
  const GAP = n > 1 ? (W - n * BAR_W) / (n + 1) : (W - BAR_W) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = Math.max(((d.v || 0) / max) * H, 2);
        const x = GAP + i * (BAR_W + GAP);
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={H - 2} width={BAR_W} height={2} rx={1} fill="rgba(255,255,255,0.08)" />
            <rect x={x} y={y} width={BAR_W} height={barH} rx={6} fill={(d.v || 0) > 0 ? "url(#barGrad)" : "rgba(255,255,255,0.04)"} />
            <text x={x + BAR_W / 2} y={H + 20} textAnchor="middle" className="dash-chart-label">{d.l}</text>
            {(d.v || 0) > 0 && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" fontSize={10} fill="var(--dash-text-secondary)" fontWeight="700">{d.v}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ segments = [] }) {
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0) || 1;
  const R = 60, CX = 80, CY = 80;
  let angle = -Math.PI / 2;

  const arcs = segments.map(seg => {
    const pct = (seg.value || 0) / total;
    const sweep = pct * 2 * Math.PI;
    const x1 = CX + R * Math.cos(angle);
    const y1 = CY + R * Math.sin(angle);
    angle += sweep;
    const x2 = CX + R * Math.cos(angle);
    const y2 = CY + R * Math.sin(angle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    return { ...seg, pct, d: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
      <svg width={160} height={160}>
        <circle cx={CX} cy={CY} r={R} fill="rgba(255,255,255,0.03)" />
        {arcs.map((arc, i) => (
          <path key={i} d={arc.d} fill={arc.color} opacity={0.85} />
        ))}
        <circle cx={CX} cy={CY} r={R * 0.55} fill="var(--dash-bg)" />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize={14} fill="var(--dash-text)" fontWeight="700">{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span className="dash-date" style={{ fontSize: 12 }}>{seg.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: seg.color, marginLeft: "auto" }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ total: 0, clients: 0, transporteurs: 0 });
  const [reviews, setReviews] = useState({ total: 0, avgRating: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [dashRes, usersRes, reviewsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/api/admin/dashboard-stats`, { headers }),
        axios.get(`${API_BASE}/users/getAllUsers`, { headers }),
        axios.get(`${API_BASE}/api/reviews/all`, { headers })
          .catch(() => axios.get(`${API_BASE}/api/reviews`, { headers })),
      ]);

      if (!isMounted.current) return;

      // Dashboard stats
      const dashData = dashRes.status === "fulfilled" ? (dashRes.value.data?.data || {}) : {};
      setStats({
        total: dashData.totalRequests || 0,
        pending: dashData.pendingRequests || 0,
        accepted: dashData.acceptedRequests || 0,
        delivered: dashData.deliveredRequests || 0,
        cancelled: dashData.cancelledRequests || 0,
        revenue: dashData.totalRevenue || 0,
      });

      // Weekly chart data from backend or fallback
      const weekly = dashData.weeklyRequests || [];
      if (weekly.length > 0) {
        setWeeklyData(weekly.map(w => ({ l: w.day || w.date || "?", v: w.count || 0 })));
      } else {
        // Generate last 7 days labels with 0 (real data unavailable)
        setWeeklyData(
          Array.from({ length: 7 }, (_, i) => ({
            l: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("fr-FR", { weekday: "short" }),
            v: 0,
          }))
        );
      }

      // Users
      if (usersRes.status === "fulfilled") {
        const allUsers = usersRes.value.data?.data || [];
        const clients = allUsers.filter(u => u.role === "client").length;
        const transporteurs = allUsers.filter(u => u.role === "transporteur").length;
        setUsers({ total: allUsers.length, clients, transporteurs });
      }

      // Reviews
      if (reviewsRes.status === "fulfilled") {
        const allReviews = reviewsRes.value.data?.data || reviewsRes.value.data?.reviews || reviewsRes.value.data || [];
        const arr = Array.isArray(allReviews) ? allReviews : [];
        const avg = arr.length > 0
          ? arr.reduce((s, r) => s + (r.rating || 0), 0) / arr.length
          : 0;
        setReviews({ total: arr.length, avgRating: avg.toFixed(1) });
      }
    } catch (err) {
      console.error("Stats error:", err);
      if (isMounted.current) setError("Erreur lors du chargement des statistiques.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchAll();
    return () => { isMounted.current = false; };
  }, []); // eslint-disable-line

  const kpiCards = stats ? [
    { label: "Demandes totales", value: stats.total, icon: ICONS.truck, color: "#3b82f6", grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { label: "En attente", value: stats.pending, icon: ICONS.clock, color: "#f59e0b", grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Acceptées", value: stats.accepted, icon: ICONS.check, color: "#22c55e", grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Livrées", value: stats.delivered, icon: ICONS.truck, color: "#8b5cf6", grad: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
    { label: "Revenu total", value: `${stats.revenue.toFixed(2)} DT`, icon: ICONS.dollar, color: "#ec4899", grad: "linear-gradient(135deg,#ec4899,#be185d)" },
    { label: "Utilisateurs", value: users.total, icon: ICONS.users, color: "#e879f9", grad: "linear-gradient(135deg,#e879f9,#c084fc)" },
    { label: "Avis reçus", value: reviews.total, icon: ICONS.star, color: "#fbbf24", grad: "linear-gradient(135deg,#fbbf24,#d97706)" },
    { label: "Note moyenne", value: `${reviews.avgRating}★`, icon: ICONS.chart, color: "#34d399", grad: "linear-gradient(135deg,#34d399,#059669)" },
  ] : [];

  const donutSegments = stats ? [
    { label: "En attente", value: stats.pending, color: "#f59e0b" },
    { label: "Acceptées", value: stats.accepted, color: "#22c55e" },
    { label: "Livrées", value: stats.delivered, color: "#8b5cf6" },
    { label: "Annulées", value: stats.cancelled || 0, color: "#ef4444" },
  ] : [];

  const completionRate = stats && stats.total > 0
    ? ((stats.delivered / stats.total) * 100).toFixed(1)
    : "0";

  const avgRevenue = stats && stats.total > 0
    ? (stats.revenue / stats.total).toFixed(2)
    : "0";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        .stats-page {
          font-family: 'Inter', sans-serif;
          color: var(--dash-text);
          width: 100%;
          max-width: none;
          box-sizing: border-box;
          padding: 0 0 32px;
        }
        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .stats-header h1 {
          margin: 0;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          line-height: 1.2;
          word-break: break-word;
        }
        .stats-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (min-width: 1400px) {
          .stats-kpi-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .stats-charts-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (min-width: 1024px) {
          .stats-charts-row { grid-template-columns: 1fr 1fr; }
        }
        .stats-bottom-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .stats-bottom-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      <PageHeader
        sectionLabel="Administration"
        title="Statistiques"
        subtitle="Analyses détaillées du système de transport"
        actions={
          <button type="button" className="dash-btn-primary" onClick={fetchAll}>
            <Icon d={ICONS.refresh} size={14} /> Actualiser
          </button>
        }
      />
      <div className="stats-page">

      {error && (
        <div className="dash-alert-error">⚠️ {error}</div>
      )}

      {loading ? (
        <div className="dash-empty" style={{ padding: "60px 20px" }}>
          <div style={{ fontSize: 40 }}>📊</div>
          <div style={{ marginTop: 12, fontSize: 14 }}>Chargement des statistiques...</div>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="stats-kpi-grid">
            {kpiCards.map((k, i) => (
              <div key={i} className="dash-panel" style={{ marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: k.grad, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon d={k.icon} size={18} color="#fff" />
                </div>
                <div className="dash-stat-value" style={{ marginBottom: 4 }}>{k.value}</div>
                <div className="dash-mini-stat-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="stats-charts-row">
            {/* Weekly bar chart */}
            <div className="dash-panel">
              <h3 className="dash-panel-heading">Activité (7 derniers jours)</h3>
              <BarChart data={weeklyData} color="#e879f9" />
              {weeklyData.every(d => d.v === 0) && (
                <p className="dash-date" style={{ textAlign: "center", marginTop: 8 }}>
                  Données hebdomadaires non disponibles via le backend.
                </p>
              )}
            </div>

            {/* Donut chart */}
            <div className="dash-panel">
              <h3 className="dash-panel-heading">Répartition des demandes</h3>
              {stats && stats.total > 0 ? (
                <DonutChart segments={donutSegments.filter(s => s.value > 0)} />
              ) : (
                <div className="dash-empty" style={{ padding: "30px 0" }}>
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>

          {/* Progress bars + Key Info */}
          <div className="stats-bottom-row">
            {/* Progress bars */}
            <div className="dash-panel">
              <h3 className="dash-panel-heading">Répartition par statut</h3>
              {stats && stats.total > 0 ? (
                donutSegments.map((s, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="dash-date" style={{ fontSize: 12 }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>
                        {s.value} ({stats.total > 0 ? ((s.value / stats.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: "var(--dash-chart-bar-empty)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${stats.total > 0 ? (s.value / stats.total) * 100 : 0}%`,
                        background: s.color,
                        borderRadius: 4,
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="dash-empty" style={{ fontSize: 13, padding: 0 }}>Aucune demande enregistrée.</p>
              )}

              {/* Users breakdown */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--dash-border-subtle)" }}>
                <p className="dash-panel-title" style={{ marginBottom: 12 }}>Utilisateurs</p>
                {[
                  { label: "Clients", value: users.clients, color: "#3b82f6" },
                  { label: "Transporteurs", value: users.transporteurs, color: "#a855f7" },
                ].map((u, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="dash-date" style={{ fontSize: 12 }}>{u.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: u.color }}>
                        {u.value} ({users.total > 0 ? ((u.value / users.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--dash-chart-bar-empty)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${users.total > 0 ? (u.value / users.total) * 100 : 0}%`, background: u.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key metrics */}
            <div className="dash-panel">
              <h3 className="dash-panel-heading">Indicateurs clés</h3>
              {[
                { label: "Taux de complétion", value: `${completionRate}%`, color: "#22c55e", desc: "Demandes livrées / total" },
                { label: "Demandes actives", value: stats ? stats.pending + stats.accepted : 0, color: "#3b82f6", desc: "En attente + acceptées" },
                { label: "Revenu moyen/demande", value: `${avgRevenue} DT`, color: "#ec4899", desc: "Revenu total / nb demandes" },
                { label: "Clients enregistrés", value: users.clients, color: "#e879f9", desc: "Rôle = client" },
                { label: "Transporteurs actifs", value: users.transporteurs, color: "#a855f7", desc: "Rôle = transporteur" },
                { label: "Note moyenne avis", value: `${reviews.avgRating} / 5`, color: "#fbbf24", desc: `Sur ${reviews.total} avis` },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 0", borderBottom: i < 5 ? "1px solid var(--dash-border-subtle)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="dash-route" style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                    <div className="dash-date" style={{ marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}
