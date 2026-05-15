import React from "react";
import StatusBadge from "./StatusBadge";

function formatDate(raw) {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function RecentRequestsTable({
  requests,
  loading,
  emptyMessage = "Aucune demande",
  renderActions,
}) {
  if (loading) {
    return <div className="dash-empty">Chargement…</div>;
  }

  if (!requests.length) {
    return <div className="dash-empty">{emptyMessage}</div>;
  }

  return (
    <table className="dash-table">
      <thead>
        <tr>
          <th>Itinéraire</th>
          <th>Date</th>
          <th>Statut</th>
          {renderActions ? <th style={{ width: 100 }} /> : null}
        </tr>
      </thead>
      <tbody>
        {requests.map((r, i) => (
          <tr key={r._id || i}>
            <td>
              <div className="dash-route">
                {r.pickupLocation || "—"} → {r.deliveryLocation || "—"}
              </div>
            </td>
            <td>
              <span className="dash-date">{formatDate(r.date || r.createdAt)}</span>
            </td>
            <td>
              <StatusBadge status={r.status || "pending"} />
            </td>
            {renderActions ? <td>{renderActions(r)}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
