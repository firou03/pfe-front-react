import React, { useState, useEffect } from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import AppPageLayout from "components/dashboard/AppPageLayout";
import StatusBadge from "components/dashboard/StatusBadge";
import { getClientRequestsForDashboard } from "../../service/restApiTransport";

export default function MesDemandesClient() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getClientRequestsForDashboard();
      setRequests(res.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setRequests(
      requests.map((r) =>
        r._id === selectedRequest._id ? { ...r, status: "confirmed" } : r
      )
    );
    setShowConfirmationModal(false);
    setSelectedRequest(null);
  };

  const handleRefuse = async () => {
    setRequests(
      requests.map((r) =>
        r._id === selectedRequest._id ? { ...r, status: "cancelled" } : r
      )
    );
    setShowConfirmationModal(false);
    setSelectedRequest(null);
  };

  const subtitleDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <AppPageLayout sectionLabel="Client" title="Mes demandes" subtitle={subtitleDate}>
        <div className="dash-panel" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="dash-empty">Chargement...</div>
          ) : requests.length === 0 ? (
            <div className="dash-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              Aucune demande pour le moment
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Trajet</th>
                    <th>Date</th>
                    <th>Poids</th>
                    <th>Sensible</th>
                    <th>Transporteur</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <div className="dash-route">
                          {request.pickupLocation} → {request.deliveryLocation}
                        </div>
                      </td>
                      <td>
                        <span className="dash-date">
                          {new Date(request.date).toLocaleDateString("fr-FR")}
                        </span>
                      </td>
                      <td>{request.weight} kg</td>
                      <td>{request.isSensitive === "oui" ? "✓ Oui" : "Non"}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{request.transporteur?.name || "—"}</div>
                        <div className="dash-date">{request.transporteur?.email || ""}</div>
                      </td>
                      <td>
                        <StatusBadge status={request.status} />
                      </td>
                      <td>
                        {request.status === "accepted_by_transporter" ? (
                          <button
                            type="button"
                            className="dash-btn-primary"
                            style={{ fontSize: 11, padding: "6px 14px" }}
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowConfirmationModal(true);
                            }}
                          >
                            Confirmer
                          </button>
                        ) : (
                          <span style={{ color: "var(--dash-text-muted)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppPageLayout>

      {showConfirmationModal && selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div style={{ backgroundColor: "#0a0c11", borderRadius: 16, maxWidth: 500, width: "100%" }}>
            <ConfirmationModal
              request={selectedRequest}
              onClose={() => {
                setShowConfirmationModal(false);
                setSelectedRequest(null);
              }}
              onConfirm={handleConfirm}
              onRefuse={handleRefuse}
            />
          </div>
        </div>
      )}
    </>
  );
}
