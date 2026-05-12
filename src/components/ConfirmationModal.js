import React, { useState, useEffect } from "react";
import { confirmRequest, refuseRequest } from "../service/restApiTransport";

export default function ConfirmationModal({ request, onClose, onConfirm, onRefuse }) {
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    if (!request?.expiresAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(request.expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining({ hours, minutes });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [request]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmRequest(request._id);
      setCompleted(true);
      setTimeout(() => {
        onConfirm();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error confirming request:", error);
      alert(error?.response?.data?.message || "Erreur lors de la confirmation");
      setLoading(false);
    }
  };

  const handleRefuse = async () => {
    setLoading(true);
    try {
      await refuseRequest(request._id);
      setRefused(true);
      setTimeout(() => {
        onRefuse();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error refusing request:", error);
      alert(error?.response?.data?.message || "Erreur lors du refus");
      setLoading(false);
    }
  };

  if (!request) return null;

  const timerColor = timeRemaining && timeRemaining.hours < 2 ? "#f09595" : "#EF9F27";

  return (
    <div
      style={{
        minHeight: 400,
        backgroundColor: "#0a0c11",
        borderRadius: 16,
        padding: 24,
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", margin: 0 }}>
          Confirmer la livraison ?
        </h2>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: loading ? "not-allowed" : "pointer",
            color: "#ffffff",
            opacity: loading ? 0.5 : 1,
          }}
        >
          ✕
        </button>
      </div>

      {completed ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#22c55e", margin: "0 0 8px 0" }}>
            Livraison confirmée !
          </h3>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            Le transporteur a été notifié.
          </p>
        </div>
      ) : refused ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f09595", margin: "0 0 8px 0" }}>
            Demande annulée
          </h3>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            Le transporteur a été informé.
          </p>
        </div>
      ) : (
        <>
          {/* Request Info Card */}
          <div
            style={{
              backgroundColor: "#0f1117",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            {request.transporteur && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px 0", textTransform: "uppercase" }}>
                  Transporteur
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>
                  {request.transporteur.name} ({request.transporteur.email})
                </p>
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px 0", textTransform: "uppercase" }}>
                Trajet
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>
                {request.pickupLocation} → {request.deliveryLocation}
              </p>
            </div>

            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px 0", textTransform: "uppercase" }}>
                  Poids
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>
                  {request.weight} kg
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px 0", textTransform: "uppercase" }}>
                  Date
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>
                  {new Date(request.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {request.isSensitive === "oui" && (
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#f87171",
                  textTransform: "uppercase",
                }}
              >
                ⚠️ Sensible / Fragile
              </div>
            )}
          </div>

          {/* Timer */}
          {timeRemaining && (
            <div
              style={{
                textAlign: "center",
                backgroundColor: "rgba(239, 159, 39, 0.08)",
                border: "1px solid rgba(239, 159, 39, 0.2)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: 13, color: timerColor, fontWeight: 700, margin: 0 }}>
                ⏱ Il vous reste {timeRemaining.hours}h {timeRemaining.minutes}m pour confirmer
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleRefuse}
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: "rgba(226, 75, 74, 0.15)",
                border: "1px solid rgba(226, 75, 74, 0.3)",
                borderRadius: 10,
                color: "#f09595",
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? "⏳ Traitement..." : "Refuser"}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: "rgba(99, 153, 34, 0.8)",
                border: "none",
                borderRadius: 10,
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {loading ? "⏳ Traitement..." : "Confirmer la livraison"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
