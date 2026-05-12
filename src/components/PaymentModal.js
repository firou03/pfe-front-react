import React, { useState, useEffect } from "react";
import axios from "axios";
import { notify } from "../utils/notifications";

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
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .payment-modal {
          animation: slideUp 0.4s ease;
        }
        .payment-input:focus {
          outline: none;
          border-color: #fbbf24 !important;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1) !important;
        }
        .method-btn {
          transition: all 0.3s ease;
        }
        .method-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="payment-modal"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f35 50%, #0d1427 100%)",
          border: "1px solid rgba(251, 191, 36, 0.2)",
          borderRadius: 24,
          padding: "0",
          maxWidth: "500px",
          width: "95%",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
            padding: "28px 32px",
            borderBottom: "2px solid rgba(251, 191, 36, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                backdropFilter: "blur(10px)",
              }}
            >
              💳
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#fff" }}>Paiement Sécurisé</h2>
              <p style={{ fontSize: 11, margin: 0, marginTop: 2, color: "rgba(255, 255, 255, 0.7)" }}>
                Complétez votre demande de transport
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {/* Price Summary Card */}
          {price && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(249, 115, 22, 0.05) 100%)",
                border: "1.5px solid rgba(251, 191, 36, 0.3)",
                borderRadius: 16,
                padding: "24px",
                marginBottom: 28,
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(251, 191, 36, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Poids du colis
                  </span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", marginTop: 6 }}>
                    {price.weight} <span style={{ fontSize: 14, fontWeight: 600 }}>kg</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(251, 191, 36, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Tarif
                  </span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", marginTop: 6 }}>
                    {price.amount} <span style={{ fontSize: 14, fontWeight: 600 }}>DT</span>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(251, 191, 36, 0.2)", paddingTop: 12 }}>
                <p style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.4)", margin: 0, lineHeight: 1.6 }}>
                  📌 <strong>Tarification:</strong> 7 DT jusqu'à 10 kg + 1 DT par kg supplémentaire
                </p>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 14, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Méthode de paiement
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {["card", "transfer", "cash"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className="method-btn"
                  style={{
                    flex: 1,
                    padding: "14px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: paymentMethod === method ? "2px solid #fbbf24" : "2px solid rgba(251, 191, 36, 0.15)",
                    background: paymentMethod === method ? "rgba(251, 191, 36, 0.15)" : "rgba(255, 255, 255, 0.02)",
                    color: paymentMethod === method ? "#fbbf24" : "rgba(255, 255, 255, 0.5)",
                    transition: "all 0.3s ease",
                    boxShadow: paymentMethod === method ? "0 0 12px rgba(251, 191, 36, 0.2)" : "none",
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>
                    {method === "card" ? "💳" : method === "transfer" ? "🏦" : "💵"}
                  </div>
                  {method === "card" ? "Carte" : method === "transfer" ? "Virement" : "Espèces"}
                </button>
              ))}
            </div>
          </div>

          {/* Card Fields */}
          {paymentMethod === "card" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 10, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Numéro de carte
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={16}
                  className="payment-input"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 10,
                    border: "1.5px solid rgba(251, 191, 36, 0.2)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "monospace",
                    transition: "all 0.3s ease",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 10, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Titulaire de la carte
                </label>
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="payment-input"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 10,
                    border: "1.5px solid rgba(251, 191, 36, 0.2)",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#fff",
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1.5px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 24,
                fontSize: 12,
                color: "#fca5a5",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 16 }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleClose}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: "1.5px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.04)",
                color: "rgba(255, 255, 255, 0.6)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.08)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.04)")}
            >
              Annuler
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              style={{
                flex: 1.5,
                padding: "14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
                background: loading ? "rgba(251, 191, 36, 0.4)" : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: loading ? "rgba(0, 0, 0, 0.4)" : "#000",
                boxShadow: loading ? "none" : "0 8px 20px rgba(251, 191, 36, 0.3)",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.boxShadow = "0 12px 30px rgba(251, 191, 36, 0.4)")}
              onMouseLeave={(e) => !loading && (e.target.style.boxShadow = "0 8px 20px rgba(251, 191, 36, 0.3)")}
            >
              {loading ? "⏳ Traitement du paiement..." : paymentMethod === "cash" ? "💵 Payer à la livraison" : `💳 Payer ${price?.amount || "-"} DT`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
