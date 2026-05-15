import React, { useEffect, useMemo, useRef, useState } from "react";
import AppPageLayout from "components/dashboard/AppPageLayout";
import QuickActionsPanel from "components/dashboard/QuickActionsPanel";
import RecentRequestsTable from "components/dashboard/RecentRequestsTable";
import StatCard from "components/dashboard/StatCard";
import WeeklyActivityChart from "components/dashboard/WeeklyActivityChart";
import { ICONS } from "components/dashboard/icons";
import {
  acceptTransportRequest,
  deliverTransportRequest,
  getMesRequests,
  getPendingRequests,
} from "service/restApiTransport";
import { createConversation, sendMessage } from "service/restApiChat";
import { buildWeeklyChartData, computeMonthlyTrend } from "utils/dashboardHelpers";

const SEM = {
  request: { color: "var(--semantic-request)", bg: "var(--semantic-request-bg)" },
  delivery: { color: "var(--semantic-delivery)", bg: "var(--semantic-delivery-bg)" },
  tracking: { color: "var(--semantic-tracking)", bg: "var(--semantic-tracking-bg)" },
  warning: { color: "var(--semantic-warning)", bg: "var(--semantic-warning-bg)" },
};

export default function TransporteurDashboard() {
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const loadData = async () => {
    try {
      const [p, a] = await Promise.all([
        getPendingRequests().catch(() => ({ data: [] })),
        getMesRequests().catch(() => ({ data: [] })),
      ]);
      if (!isMounted.current) return;
      setPending(p.data || []);
      setAccepted(a.data || []);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const allRequests = useMemo(() => [...pending, ...accepted], [pending, accepted]);
  const delivered = accepted.filter((r) => r.status === "delivered").length;

  const handleAccept = async (id, clientId) => {
    try {
      await acceptTransportRequest(id);
      try {
        const convRes = await createConversation(clientId, id);
        const convId = convRes.data?._id;
        if (convId) {
          await sendMessage(convId, {
            content:
              "Bonjour, j'ai accepté votre demande de transport. Nous pouvons discuter des détails ici.",
          });
        }
      } catch (chatErr) {
        console.error("Chat:", chatErr.message);
      }
      await loadData();
    } catch {
      alert("Erreur lors de l'acceptation");
    }
  };

  const handleDeliver = async (id) => {
    try {
      await deliverTransportRequest(id);
      const mission = accepted.find((r) => r._id === id);
      if (mission?.client?._id) {
        try {
          const convRes = await createConversation(mission.client._id, id);
          const convId = convRes.data?._id;
          if (convId) {
            await sendMessage(convId, {
              content: "Votre colis a été livré avec succès. Merci de votre confiance !",
            });
          }
        } catch (chatErr) {
          console.error("Chat:", chatErr.message);
        }
      }
      await loadData();
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  const stats = [
    {
      label: "En attente",
      value: pending.length,
      icon: ICONS.clock,
      ...SEM.warning,
      trend: computeMonthlyTrend(pending),
    },
    {
      label: "Mes trajets",
      value: accepted.length,
      icon: ICONS.truck,
      ...SEM.request,
      trend: computeMonthlyTrend(accepted),
    },
    {
      label: "Livrées",
      value: delivered,
      icon: ICONS.check,
      ...SEM.delivery,
      trend: computeMonthlyTrend(accepted, (r) => r.status === "delivered"),
    },
    {
      label: "Note moyenne",
      value: "4.8 ★",
      icon: ICONS.star,
      ...SEM.tracking,
      trend: { label: "Stable ce mois", direction: "neutral" },
    },
  ];

  const quickActions = [
    {
      title: "Demandes disponibles",
      subtitle:
        pending.length > 0
          ? `${pending.length} nouvelle${pending.length > 1 ? "s" : ""} demande${pending.length > 1 ? "s" : ""}`
          : "Aucune pour le moment",
      to: "/requests",
      icon: ICONS.list,
      iconColor: SEM.request.color,
      iconBg: SEM.request.bg,
    },
    {
      title: "Mes trajets",
      subtitle: `${accepted.length} mission${accepted.length !== 1 ? "s" : ""} active${accepted.length !== 1 ? "s" : ""}`,
      to: "/mes-requests",
      icon: ICONS.check,
      iconColor: SEM.delivery.color,
      iconBg: SEM.delivery.bg,
    },
    {
      title: "Historique",
      subtitle: "Consulter les livraisons passées",
      to: "/historique",
      icon: ICONS.clock,
      iconColor: SEM.warning.color,
      iconBg: SEM.warning.bg,
    },
    {
      title: "Messagerie",
      subtitle: "Contacter vos clients",
      to: "/chat",
      icon: ICONS.chat,
      iconColor: "var(--dash-text-muted)",
      iconBg: "var(--dash-hover)",
    },
  ];

  const recentRows = useMemo(() => {
    const rows = [
      ...pending.map((r) => ({ ...r, status: r.status || "pending", _action: "accept" })),
      ...accepted
        .filter((r) => r.status !== "delivered")
        .map((r) => ({ ...r, _action: "deliver" })),
    ];
    return rows.slice(0, 8);
  }, [pending, accepted]);

  const chartData = buildWeeklyChartData(allRequests);

  const renderActions = (r) => {
    if (r._action === "accept") {
      return (
        <button
          type="button"
          className="dash-btn-sm accept"
          onClick={() => handleAccept(r._id, r.client?._id)}
        >
          Accepter
        </button>
      );
    }
    if (r._action === "deliver" && r.status !== "delivered") {
      return (
        <button type="button" className="dash-btn-sm deliver" onClick={() => handleDeliver(r._id)}>
          Livré
        </button>
      );
    }
    return null;
  };

  return (
    <AppPageLayout user={user}>
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
            loading={loading && s.label !== "Note moyenne"}
          />
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <p className="dash-panel-title">Flux</p>
          <h2 className="dash-panel-heading">Demandes récentes</h2>
          <RecentRequestsTable
            requests={recentRows}
            loading={loading}
            emptyMessage="Aucune demande en cours"
            renderActions={renderActions}
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
