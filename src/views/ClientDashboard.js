import React, { useEffect, useMemo, useRef, useState } from "react";
import AppPageLayout from "components/dashboard/AppPageLayout";
import QuickActionsPanel from "components/dashboard/QuickActionsPanel";
import RecentRequestsTable from "components/dashboard/RecentRequestsTable";
import StatCard from "components/dashboard/StatCard";
import WeeklyActivityChart from "components/dashboard/WeeklyActivityChart";
import { ICONS } from "components/dashboard/icons";
import { getClientRequestsForDashboard } from "service/restApiTransport";
import { buildWeeklyChartData, computeMonthlyTrend } from "utils/dashboardHelpers";

const SEM = {
  request: { color: "var(--semantic-request)", bg: "var(--semantic-request-bg)" },
  delivery: { color: "var(--semantic-delivery)", bg: "var(--semantic-delivery-bg)" },
  tracking: { color: "var(--semantic-tracking)", bg: "var(--semantic-tracking-bg)" },
  warning: { color: "var(--semantic-warning)", bg: "var(--semantic-warning-bg)" },
};

export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const load = async () => {
      try {
        const res = await getClientRequestsForDashboard();
        if (isMounted.current) setRequests(res.data || []);
      } catch {
        const local = JSON.parse(localStorage.getItem("clientRequests") || "[]");
        if (isMounted.current) setRequests(local);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const total = requests.length;
  const pending = requests.filter((r) => !r.status || r.status === "pending").length;
  const accepted = requests.filter((r) => r.status === "accepted").length;
  const delivered = requests.filter((r) => r.status === "delivered").length;

  const stats = [
    {
      label: "Total demandes",
      value: total,
      icon: ICONS.package,
      ...SEM.request,
      trend: computeMonthlyTrend(requests),
    },
    {
      label: "En attente",
      value: pending,
      icon: ICONS.clock,
      ...SEM.warning,
      trend: computeMonthlyTrend(requests, (r) => !r.status || r.status === "pending"),
    },
    {
      label: "Acceptées",
      value: accepted,
      icon: ICONS.check,
      ...SEM.delivery,
      trend: computeMonthlyTrend(requests, (r) => r.status === "accepted"),
    },
    {
      label: "Livrées",
      value: delivered,
      icon: ICONS.truck,
      ...SEM.tracking,
      trend: computeMonthlyTrend(requests, (r) => r.status === "delivered"),
    },
  ];

  const quickActions = [
    {
      title: "Nouvelle demande",
      subtitle: pending > 0 ? `${pending} en attente de traitement` : "Créer une livraison",
      to: "/client",
      icon: ICONS.plus,
      iconColor: SEM.request.color,
      iconBg: SEM.request.bg,
    },
    {
      title: "Mes demandes",
      subtitle: `${total} demande${total !== 1 ? "s" : ""} au total`,
      to: "/client-requests",
      icon: ICONS.list,
      iconColor: SEM.request.color,
      iconBg: SEM.request.bg,
    },
    {
      title: "Suivi colis",
      subtitle: "Localiser un envoi",
      to: "/tracking",
      icon: ICONS.map,
      iconColor: SEM.tracking.color,
      iconBg: SEM.tracking.bg,
    },
    {
      title: "Messagerie",
      subtitle: "Contacter les transporteurs",
      to: "/chat",
      icon: ICONS.chat,
      iconColor: "var(--dash-text-muted)",
      iconBg: "var(--dash-hover)",
    },
  ];

  const chartData = buildWeeklyChartData(requests);
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 8);

  return (
    <AppPageLayout
      user={currentUser}
      primaryAction={{ label: "Nouvelle demande", to: "/client", icon: ICONS.plus }}
    >
      <div className="dash-stats-grid">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconColor={s.color}
            iconBg={s.bg}
            trend={s.trend}
            loading={loading}
          />
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <p className="dash-panel-title">Activité</p>
          <h2 className="dash-panel-heading">Demandes récentes</h2>
          <RecentRequestsTable
            requests={recentRequests}
            loading={loading}
            emptyMessage="Aucune demande pour le moment"
          />
        </div>

        <div className="dash-aside">
          <div className="dash-panel">
            <p className="dash-panel-title">Statistiques</p>
            <h3 className="dash-panel-heading">Activité hebdomadaire</h3>
            <WeeklyActivityChart data={chartData} />
          </div>
          <div className="dash-panel">
            <QuickActionsPanel actions={quickActions} />
          </div>
        </div>
      </div>
    </AppPageLayout>
  );
}
