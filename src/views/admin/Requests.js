import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PageHeader from "components/dashboard/PageHeader";

const Icon = ({ d, size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

const API_BASE = "http://localhost:5000";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Try admin endpoint first, fallback to general requests
      const res = await axios
        .get(`${API_BASE}/api/transport-requests/all`, { headers })
        .catch(() =>
          axios
            .get(`${API_BASE}/api/transport-requests`, { headers })
            .catch(() =>
              axios.get(`${API_BASE}/api/admin/dashboard-stats`, { headers })
                .then(r => ({
                  data: { data: r.data?.data?.recentRequests || [] }
                }))
            )
        );

      const allRequests =
        res.data?.data ||
        res.data?.requests ||
        res.data ||
        [];

      const list = Array.isArray(allRequests) ? allRequests : [];
      if (isMounted.current) {
        setRequests(list);
        setFilteredRequests(list);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      if (isMounted.current) setError("Impossible de charger les demandes.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchRequests();
    return () => { isMounted.current = false; };
  }, []); // eslint-disable-line

  useEffect(() => {
    let filtered = requests;
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    setFilteredRequests(filtered);
  }, [requests, statusFilter]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending": return { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", label: "En attente" };
      case "accepted": return { bg: "rgba(34,211,153,0.15)", color: "#34d399", label: "Acceptée" };
      case "delivered": return { bg: "rgba(96,165,250,0.15)", color: "#60a5fa", label: "Livrée" };
      case "cancelled": return { bg: "rgba(239,68,68,0.15)", color: "#f87171", label: "Annulée" };
      default: return { bg: "rgba(107,114,128,0.15)", color: "#9ca3af", label: status || "Inconnu" };
    }
  };

  const STATUSES = ["all", "pending", "accepted", "delivered", "cancelled"];
  const STATUS_LABELS = { all: "Tous", pending: "En attente", accepted: "Acceptées", delivered: "Livrées", cancelled: "Annulées" };

  return (
    <>
      <PageHeader
        sectionLabel="Administration"
        title="Gestion des demandes"
        subtitle={
          loading
            ? "Chargement..."
            : `${filteredRequests.length} demande${filteredRequests.length !== 1 ? "s" : ""}`
        }
        actions={
          <button type="button" className="dash-btn-primary" onClick={fetchRequests}>
            <Icon d={ICONS.refresh} size={14} /> Actualiser
          </button>
        }
      />

      {error && (
        <div className="dash-alert-error">⚠️ {error}</div>
      )}

      {/* Filters */}
      <div className="dash-panel" style={{ marginBottom: 20 }}>
        <div className="dash-filters">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`dash-filter-pill${statusFilter === s ? " active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_LABELS[s]}
              {s !== "all" && (
                <span className="dash-filter-count">
                  {requests.filter((r) => r.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="dash-panel">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {["ID", "Client", "Transporteur", "Montant", "Poids", "Départ → Arrivée", "Statut"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 8px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: 24 }}>⏳</div>
                  <div style={{ marginTop: 8 }}>Chargement des demandes...</div>
                </td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: 40 }}>📦</div>
                  <div style={{ marginTop: 8 }}>Aucune demande{statusFilter !== "all" ? ` avec le statut "${STATUS_LABELS[statusFilter]}"` : ""}</div>
                </td></tr>
              ) : (
                filteredRequests.map((req) => {
                  const si = getStatusInfo(req.status);
                  return (
                    <tr key={req._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#e879f9", fontFamily: "monospace" }}>
                        {req._id?.substring(0, 8) || "—"}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                        {req.client?.name || req.clientId?.name || "—"}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                        {req.transporteur?.name || req.transporteurId?.name || (
                          <span style={{ color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Non assigné</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 700, color: "#22c55e" }}>
                        {req.price != null ? `${req.price} DT` : "—"}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                        {req.weight != null ? `${req.weight} kg` : "—"}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 11, color: "rgba(255,255,255,0.55)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {req.pickupAddress || req.departure || "—"} → {req.deliveryAddress || req.destination || "—"}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: si.bg, color: si.color, whiteSpace: "nowrap" }}>
                          {si.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredRequests.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
            Affichage de {filteredRequests.length} sur {requests.length} demande(s)
          </div>
        )}
      </div>
    </>
  );
}