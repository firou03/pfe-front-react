import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMesRequests, deliverTransportRequest } from "service/restApiTransport";
import { createConversation, sendMessage } from "service/restApiChat";
import RatingModal from "components/RatingModal";
import AppPageLayout from "components/dashboard/AppPageLayout";
import StatusBadge from "components/dashboard/StatusBadge";
import { ICONS } from "components/dashboard/icons";
import { DashIcon } from "components/dashboard/icons";

export default function MesRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [ratingModal, setRatingModal] = useState({ isOpen: false, request: null });

  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const fetchRequests = () => {
    getMesRequests()
      .then((res) => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDeliver = async (id) => {
    try {
      await deliverTransportRequest(id);

      const mission = requests.find((r) => r._id === id);
      if (mission && mission.client?._id) {
        try {
          const convRes = await createConversation(mission.client._id, id);
          const convId = convRes.data?._id;
          if (convId) {
            await sendMessage(convId, {
              content:
                "✅ Votre colis a été livré avec succès. Merci de nous avoir fait confiance !",
            });
          }
        } catch (chatErr) {
          console.error("Erreur notification chat:", chatErr);
        }
      }

      const deliveredRequest = requests.find((r) => r._id === id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      alert("Mission marquée comme livrée ! 📦✅");

      if (deliveredRequest) {
        setRatingModal({
          isOpen: true,
          request: deliveredRequest,
        });
      }
    } catch {
      alert("Erreur lors de la mise à jour du statut ❌");
    }
  };

  const filtered =
    filter === "all"
      ? requests.filter((r) => r.status !== "delivered")
      : requests.filter(
          (r) =>
            r.status !== "delivered" &&
            r.isSensitive === (filter === "fragile" ? "oui" : "non")
        );

  const activeRequests = requests.filter((r) => r.status !== "delivered");
  const stats = [
    { label: "Total acceptées", value: activeRequests.length },
    {
      label: "Non sensibles",
      value: activeRequests.filter((r) => r.isSensitive !== "oui").length,
    },
    {
      label: "Fragiles",
      value: activeRequests.filter((r) => r.isSensitive === "oui").length,
    },
  ];

  const headerActions = (
    <Link to="/requests" className="dash-btn-primary">
      <DashIcon d={ICONS.list} size={15} />
      Voir les demandes dispo.
    </Link>
  );

  return (
    <>
      <AppPageLayout
        sectionLabel="Transporteur"
        title="Mes demandes en cours"
        subtitle="Livraisons actives"
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
            <h2 className="dash-panel-title">Liste des demandes</h2>
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
              <p>Aucune demande trouvée</p>
              <Link to="/requests" className="dash-btn-primary" style={{ marginTop: 16 }}>
                Voir les demandes disponibles
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
                  <th>Statut / Actions</th>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StatusBadge status="accepted" />
                        <button
                          type="button"
                          className="dash-btn-primary"
                          style={{ padding: "4px 10px", fontSize: 11 }}
                          onClick={() => handleDeliver(r._id)}
                        >
                          LIVRER
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AppPageLayout>

      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, request: null })}
        userId={currentUser._id}
        targetUserId={
          ratingModal.request?.client?._id || ratingModal.request?.transporteur?._id
        }
        requestId={ratingModal.request?._id}
        targetUserName={
          ratingModal.request?.client?.name || ratingModal.request?.transporteur?.name
        }
      />
    </>
  );
}
