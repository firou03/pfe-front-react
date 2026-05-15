import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMesRequests } from "service/restApiTransport";
import AppPageLayout from "components/dashboard/AppPageLayout";
import StatusBadge from "components/dashboard/StatusBadge";
import { ICONS } from "components/dashboard/icons";
import { DashIcon } from "components/dashboard/icons";

export default function Historique() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRequests = () => {
    getMesRequests()
      .then((res) =>
        setRequests((res.data || []).filter((r) => r.status === "delivered"))
      )
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered =
    filter === "all"
      ? requests
      : requests.filter(
          (r) => r.isSensitive === (filter === "fragile" ? "oui" : "non")
        );

  const stats = [
    { label: "Livraisons complètes", value: requests.length },
    {
      label: "Non sensibles",
      value: requests.filter((r) => r.isSensitive !== "oui").length,
    },
    {
      label: "Fragiles",
      value: requests.filter((r) => r.isSensitive === "oui").length,
    },
  ];

  const headerActions = (
    <Link to="/mes-requests" className="dash-btn-primary">
      <DashIcon d={ICONS.check} size={15} />
      Mes demandes en cours
    </Link>
  );

  return (
    <AppPageLayout
      sectionLabel="Transporteur"
      title="Historique d'activité"
      subtitle="Toutes vos livraisons complétées"
      headerActions={headerActions}
    >
      <div className="dash-mini-stats">
        {stats.map((s) => (
          <div key={s.label} className="dash-mini-stat">
            <div className="dash-mini-stat-value">{loading ? "—" : s.value}</div>
            <div className="dash-mini-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-panel">
        <div className="dash-panel-heading">
          <h2 className="dash-panel-title">Livraisons</h2>
          <div className="dash-filters">
            {[
              { key: "all", label: "Toutes" },
              { key: "normal", label: "Non sensibles" },
              { key: "fragile", label: "Fragiles" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                className={`dash-filter-pill${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="dash-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p>Aucune livraison trouvée</p>
            <Link to="/mes-requests" className="dash-btn-primary" style={{ marginTop: 16 }}>
              Voir mes demandes en cours
            </Link>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Départ</th>
                <th>Livraison</th>
                <th>Date</th>
                <th>Poids</th>
                <th>Sensible</th>
                <th>Client</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td>
                    <span className="dash-route">{r.pickupLocation || "—"}</span>
                  </td>
                  <td>
                    <span className="dash-route">{r.deliveryLocation || "—"}</span>
                  </td>
                  <td>
                    <span className="dash-date">
                      {r.date ? new Date(r.date).toLocaleDateString("fr-FR") : "—"}
                    </span>
                  </td>
                  <td>
                    <span className="dash-date">{r.weight ? `${r.weight} kg` : "—"}</span>
                  </td>
                  <td>
                    <span
                      className={`dash-badge ${
                        r.isSensitive === "oui" ? "cancelled" : "accepted"
                      }`}
                    >
                      <span className="dash-badge-dot" />
                      {r.isSensitive === "oui" ? "Fragile" : "Normal"}
                    </span>
                  </td>
                  <td>
                    <div className="dash-route">{r.client?.name || "—"}</div>
                    <div className="dash-date">{r.client?.email || ""}</div>
                  </td>
                  <td>
                    <StatusBadge status="delivered" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppPageLayout>
  );
}
