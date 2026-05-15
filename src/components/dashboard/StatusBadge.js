import React from "react";

const STATUS_MAP = {
  pending: { label: "En attente", className: "pending" },
  accepted: { label: "Acceptée", className: "accepted" },
  accepted_by_transporter: { label: "À confirmer", className: "awaiting", pulse: true },
  confirmed: { label: "Confirmée", className: "confirmed" },
  delivered: { label: "Livrée", className: "delivered" },
  cancelled: { label: "Annulée", className: "cancelled" },
  expired: { label: "Expirée", className: "expired" },
};

export default function StatusBadge({ status }) {
  const key = status || "pending";
  const s = STATUS_MAP[key] || STATUS_MAP.pending;

  return (
    <span className={`dash-badge ${s.className}`}>
      <span className={`dash-badge-dot${s.pulse ? " dash-badge-dot-pulse" : ""}`} />
      {s.label}
    </span>
  );
}
