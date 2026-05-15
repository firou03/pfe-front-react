import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppPageLayout from "components/dashboard/AppPageLayout";
import { notify } from "utils/notifications";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ClientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/api/payments/user/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPayments(res.data || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async (paymentId, amount) => {
    setProcessingId(paymentId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/payments/confirm/${paymentId}`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notify.success(`Paiement de ${amount} DT confirmé !`);
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
    } catch {
      notify.error("Erreur lors du paiement");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "pending"),
    [payments]
  );
  const completedPayments = useMemo(
    () => payments.filter((p) => p.status === "completed"),
    [payments]
  );

  return (
    <AppPageLayout
      sectionLabel="Client"
      title="Paiements"
      subtitle="Gérez vos factures de transport"
    >
      <div className="dash-panel" style={{ marginBottom: 20 }}>
        <h3 className="dash-panel-heading">En attente de paiement</h3>
        {loading ? (
          <div className="dash-empty">Chargement…</div>
        ) : pendingPayments.length === 0 ? (
          <div className="dash-empty">Aucun paiement en attente</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {pendingPayments.map((payment) => (
              <div
                key={payment._id}
                className="dash-panel"
                style={{ background: "var(--semantic-warning-bg)", borderColor: "var(--semantic-warning)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <p className="dash-panel-title">Transporteur</p>
                    <p className="dash-route">{payment.transporteur?.name || "—"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p className="dash-route" style={{ color: "var(--semantic-warning)" }}>
                      {payment.amount} DT
                    </p>
                    <p className="dash-date">Poids : {payment.weight} kg</p>
                  </div>
                </div>
                <p className="dash-date" style={{ marginBottom: 12 }}>
                  {payment.transportRequest?.pickupLocation} →{" "}
                  {payment.transportRequest?.deliveryLocation}
                </p>
                <button
                  type="button"
                  className="auth-btn"
                  disabled={processingId === payment._id}
                  onClick={() => handlePayment(payment._id, payment.amount)}
                >
                  {processingId === payment._id ? "Traitement…" : `Payer ${payment.amount} DT`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedPayments.length > 0 && (
        <div className="dash-panel">
          <h3 className="dash-panel-heading">Paiements complétés</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {completedPayments.map((payment) => (
              <div key={payment._id} className="dash-panel" style={{ background: "var(--semantic-delivery-bg)" }}>
                <p className="dash-route">{payment.transporteur?.name}</p>
                <p className="dash-route" style={{ color: "var(--semantic-delivery)" }}>
                  {payment.amount} DT — Payé
                </p>
                <p className="dash-date">
                  Transaction : {payment.transactionId?.slice(-8) || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppPageLayout>
  );
}
