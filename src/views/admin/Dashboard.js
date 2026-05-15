import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PageHeader from "components/dashboard/PageHeader";
import StatCard from "components/dashboard/StatCard";
import StatusBadge from "components/dashboard/StatusBadge";
import QuickActionsPanel from "components/dashboard/QuickActionsPanel";

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
            <rect x={x} y={y} width={BAR_W} height={barH} rx={6} fill={row.v > 0 ? "url(#adminGrad)" : "var(--dash-chart-bar-empty)"} />
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle" fontSize={10} className="dash-chart-label">
              {row.l}
            </text>
            {row.v > 0 && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" fontSize={10} fill="var(--dash-text-secondary)" fontWeight="600">
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

const SEM = {
  request: { color: "var(--semantic-request)", bg: "var(--semantic-request-bg)" },
  delivery: { color: "var(--semantic-delivery)", bg: "var(--semantic-delivery-bg)" },
  tracking: { color: "var(--semantic-tracking)", bg: "var(--semantic-tracking-bg)" },
  warning: { color: "var(--semantic-warning)", bg: "var(--semantic-warning-bg)" },
};

const QUICK_ACTIONS = [
  { title: "Utilisateurs", subtitle: "Gerer les comptes", to: "/admin/users", icon: ICONS.users, iconColor: SEM.request.color, iconBg: SEM.request.bg },
  { title: "Expeditions", subtitle: "Toutes les demandes", to: "/admin/requests", icon: ICONS.package, iconColor: SEM.tracking.color, iconBg: SEM.tracking.bg },
  { title: "Avis clients", subtitle: "Moderation", to: "/admin/reviews", icon: ICONS.star, iconColor: SEM.warning.color, iconBg: SEM.warning.bg },
  { title: "Statistiques", subtitle: "Analyses detaillees", to: "/admin/stats", icon: ICONS.chart, iconColor: SEM.delivery.color, iconBg: SEM.delivery.bg },
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
    { label: "Total demandes", value: total, icon: ICONS.package, ...SEM.request },
    { label: "En attente", value: pending, icon: ICONS.clock, ...SEM.warning },
    { label: "Acceptees", value: accepted, icon: ICONS.truck, ...SEM.delivery },
    { label: "Livrees", value: delivered, icon: ICONS.check, ...SEM.tracking },
  ];

  const recent = Array.isArray(dash?.recentRequests) ? dash.recentRequests.slice(0, 6) : [];
  const weekly = Array.isArray(dash?.weeklyRequests) ? dash.weeklyRequests : [];

  const headerActions = (
    <Link to="/admin/stats" className="dash-btn-primary">
      <Icon d={ICONS.chart} size={15} color="#fff" />
      Statistiques
    </Link>
  );

  return (
    <>
      <PageHeader
        sectionLabel="Administration"
        title={`Bonjour, ${currentUser?.name?.split(" ")?.[0] || "Admin"}`}
        subtitle="Vue d'ensemble de la plateforme"
        actions={headerActions}
      />

      <div className="dash-stats-grid">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon}
            iconColor={k.color}
            iconBg={k.bg}
            loading={loading}
          />
        ))}
      </div>

      <div className="dash-panel" style={{ marginBottom: 20 }}>
        <p className="dash-panel-title">Revenus</p>
        <h3 className="dash-panel-heading" style={{ marginBottom: 0 }}>
          {loading ? "-" : `${revenue.toFixed(2)} DT`}
        </h3>
        <p className="dash-page-subtitle">Revenu plateforme (transporteurs)</p>
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 className="dash-panel-heading" style={{ margin: 0 }}>
              Demandes recentes
            </h3>
            <Link to="/admin/requests" className="dash-text-link">
              Tout voir
            </Link>
          </div>
          {loading ? (
            <div className="dash-empty">Chargement...</div>
          ) : recent.length === 0 ? (
            <div className="dash-empty">Aucune demande</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {recent.map((r, i) => (
                <div
                  key={r._id || i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 8px",
                    borderBottom: "1px solid var(--dash-border-subtle)",
                  }}
                >
                  <div>
                    <div className="dash-route">
                      {r.pickupLocation || "-"} → {r.deliveryLocation || "-"}
                    </div>
                    <div className="dash-date">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : ""}
                    </div>
                  </div>
                  <StatusBadge status={r.status || "pending"} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dash-aside">
          <div className="dash-panel">
            <p className="dash-panel-title">Activite</p>
            <h3 className="dash-panel-heading">7 derniers jours</h3>
            <WeeklyActivityChart weekly={weekly} />
          </div>
          <div className="dash-panel">
            <QuickActionsPanel actions={QUICK_ACTIONS} />
          </div>
        </div>
      </div>
    </>
  );
}
