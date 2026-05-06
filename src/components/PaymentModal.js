import React, { useState, useEffect } from "react";
import axios from "axios";

const PaymentModal = ({ isOpen, onClose, requestId, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (isOpen && requestId) {
      const fetchPrice = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/payments/price/${requestId}`);
          setPrice(res.data);
          setError("");
        } catch (err) {
          setError("Erreur lors du calcul du prix");
          console.error(err);
        }
      };
      fetchPrice();
    }
  }, [isOpen, requestId, API_URL]);

  const handlePayment = async () => {
    if (paymentMethod === "card" && (!cardNumber || !holderName)) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/payments/create`,
        {
          requestId,
          cardNumber: paymentMethod === "card" ? cardNumber : null,
          holderName: paymentMethod === "card" ? holderName : null,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      notify.success(`Paiement réussi! Transaction ID: ${res.data.transactionId}`);
      onPaymentSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors du paiement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCardNumber("");
    setHolderName("");
    setPaymentMethod("card");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg,#1a1f3a 0%,#16213e 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "32px",
          maxWidth: "450px",
          width: "90%",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#fff" }}>💳 Paiement requis</h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
          Confirmez le paiement pour accepter cette demande
        </p>

        {price && (
          <div
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: 12,
              padding: "16px",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Poids:</span>
              <span style={{ fontWeight: 600, color: "#fff" }}>{price.weight} kg</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Montant:</span>
              <span style={{ fontWeight: 700, color: "#7c3aed", fontSize: 18 }}>
                {price.amount} {price.currency}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8, marginBottom: 0 }}>
              💰 Tarif: ≤10kg = 7 DT | +1 DT/kg supplémentaire
            </p>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>
            Méthode de paiement
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            {["card", "transfer", "cash"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: paymentMethod === method ? "2px solid #7c3aed" : "1px solid rgba(255,255,255,0.2)",
                  background:
                    paymentMethod === method ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                  color: paymentMethod === method ? "#a78bfa" : "rgba(255,255,255,0.6)",
                  transition: "all 0.2s",
                }}
              >
                {method === "card" ? "💳 Carte" : method === "transfer" ? "🏦 Virement" : "💵 Espèces"}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === "card" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#e2e8f0" }}>
                Numéro de carte
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={16}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#e2e8f0" }}>
                Titulaire
              </label>
              <input
                type="text"
                placeholder="Nom du titulaire"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: 13,
                }}
              />
            </div>
          </>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              padding: "12px",
              marginBottom: 20,
              fontSize: 12,
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.6)",
              transition: "all 0.2s",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            {loading ? "⏳ Traitement..." : `💳 Payer ${price?.amount || "-"} DT`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
