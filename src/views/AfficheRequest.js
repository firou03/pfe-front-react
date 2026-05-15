import React, { useState, useEffect } from "react";
import { getPendingRequests, acceptTransportRequest } from "service/restApiTransport";
import { createConversation, sendMessage } from "service/restApiChat";
import AppPageLayout from "components/dashboard/AppPageLayout";
import { ICONS } from "components/dashboard/icons";
import { DashIcon } from "components/dashboard/icons";

export default function AfficheRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await getPendingRequests();
      setRequests(res.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id, clientId) => {
    setAccepting(id);
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
        console.error("Erreur création conversation via API:", chatErr.message);
      }

      setRequests((prev) => prev.filter((r) => r._id !== id));
      alert("Demande acceptée ! Conversation démarrée. ✅");
    } catch {
      alert("Erreur lors de l'acceptation ❌");
    } finally {
      setAccepting(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette demande ?")) {
      setRequests((prev) => prev.filter((r) => r._id !== id));
    }
  };

  const stats = [
    { label: "En attente", value: requests.length },
    {
      label: "Fragiles",
      value: requests.filter((r) => r.isSensitive === "oui").length,
    },
    {
      label: "Standards",
      value: requests.filter((r) => r.isSensitive !== "oui").length,
    },
  ];

  const headerActions = (
    <button type="button" className="dash-btn-primary" onClick={fetchRequests}>
      <DashIcon d={ICONS.clock} size={15} />
      Actualiser
    </button>
  );

  return (
    <AppPageLayout
      sectionLabel="Transporteur"
      title="Demandes en attente"
      subtitle="Acceptez les demandes de transport disponibles"
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
          <h2 className="dash-panel-title">Liste des demandes disponibles</h2>
          {!loading && requests.length > 0 && (
            <span className="dash-date">{requests.length} demande(s)</span>
          )}
        </div>

        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : requests.length === 0 ? (
          <div className="dash-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p>Aucune demande en attente pour le moment</p>
            <button
              type="button"
              className="dash-btn-primary"
              style={{ marginTop: 16 }}
              onClick={fetchRequests}
            >
              Actualiser
            </button>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Départ</th>
                <th>Livraison</th>
                <th>Date</th>
                <th>Poids</th>
                <th>Type</th>
                <th>Client</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
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
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="dash-btn-primary"
                        style={{ padding: "5px 12px", fontSize: 11 }}
                        onClick={() => handleAccept(r._id, r.client?._id)}
                        disabled={accepting === r._id}
                      >
                        {accepting === r._id ? "..." : "✓ Accepter"}
                      </button>
                      <button
                        type="button"
                        className="dash-filter-pill"
                        style={{ color: "var(--semantic-warning)" }}
                        onClick={() => handleDelete(r._id)}
                        aria-label="Supprimer"
                      >
                        <DashIcon
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          size={12}
                        />
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
  );
}
