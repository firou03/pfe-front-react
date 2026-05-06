import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { notify } from "utils/notifications";

const Ic = ({ d, size = 16, color = "rgba(255,255,255,0.35)", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const D = {
  dash: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  list: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
};

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const navItems = [
  { label: "Dashboard", to: "/dashboard/client", icon: D.dash, active: false },
  { label: "Nouvelle demande", to: "/client", icon: D.truck, active: false },
  { label: "Mes demandes", to: "/client-requests", icon: D.list, active: false },
  { label: "Paiements", to: "/client-payments", icon: D.dollar, active: true },
  { label: "Tracking", to: "/tracking", icon: D.map, active: false },
  { label: "Messagerie", to: "/chat", icon: D.chat, active: false },
  { label: "Mon Profil", to: "/profile/client", icon: D.user, active: false },
];

export default function ClientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/payments/user/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Payments loaded:", res.data);
        setPayments(res.data || []);
      } catch (err) {
        console.error("Erreur fetching payments:", err.response?.data || err.message);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [API_URL]);

  const handlePayment = async (paymentId, amount) => {
    setProcessingId(paymentId);
    try {
      // Simulate payment processing
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/payments/confirm/${paymentId}`,
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      notify.success(`Paiement de ${amount} DT confirmé!`);
      setPayments(prev => prev.filter(p => p._id !== paymentId));
    } catch (err) {
      notify.error("Erreur lors du paiement");
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingPayments = payments.filter(p => p.status === "pending");
  const completedPayments = payments.filter(p => p.status === "completed");

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp 0.4s ease forwards; }
        .nl:hover { background: rgba(255,255,255,0.09) !important; }
        .nl  { transition: background 0.15s; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0f1e 0%,#100b2e 50%,#0a0f1e 100%)", fontFamily: "'Inter',sans-serif", color: "#fff", display: "flex" }}>

        {/* Sidebar */}
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
          background: "rgba(255,255,255,0.025)", borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "28px 16px", display: "flex", flexDirection: "column", zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingLeft: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#1e40af)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
              <Ic d={D.truck} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>TransportApp</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Client Portal</div>
            </div>
          </div>

          {navItems.map(({ label, to, icon, active }) => (
            <Link key={to} to={to} className="nl" style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
              borderRadius: 12, marginBottom: 4, textDecoration: "none", fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? "#fff" : "rgba(255,255,255,0.45)",
              background: active ? "rgba(59,130,246,0.18)" : "transparent",
              border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
            }}>
              <Ic d={icon} size={16} color={active ? "#60a5fa" : "rgba(255,255,255,0.35)"} />
              {label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          <div style={{ ...glass, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#1e40af)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {(currentUser?.name || currentUser?.email || "C").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.name || "Client"}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.email || ""}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft: 240, flex: 1, padding: "36px 40px", minHeight: "100vh" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }} className="fu">
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Client</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>💳 Paiements</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Gérez vos factures de transport</p>
          </div>

          {/* Pending Payments */}
          <div style={{ ...glass, padding: "24px 28px", marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px 0" }}>⏳ En attente de paiement</h2>

            {loading ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "40px 0", fontSize: 13 }}>Chargement...</div>
            ) : pendingPayments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.3)" }}>
                ✅ Aucun paiement en attente
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {pendingPayments.map(payment => (
                  <div key={payment._id} style={{
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    borderRadius: 12,
                    padding: "20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Transporteur</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{payment.transporteur?.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>{payment.amount} DT</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Poids: {payment.weight}kg</div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, marginTop: 12 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                        📍 {payment.transportRequest?.pickupLocation} → {payment.transportRequest?.deliveryLocation}
                      </div>
                      <button
                        onClick={() => handlePayment(payment._id, payment.amount)}
                        disabled={processingId === payment._id}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: processingId === payment._id ? "not-allowed" : "pointer",
                          border: "none",
                          background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                          color: "#000",
                          opacity: processingId === payment._id ? 0.6 : 1,
                        }}
                      >
                        {processingId === payment._id ? "⏳ Traitement..." : `💳 Payer ${payment.amount} DT`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Payments */}
          {completedPayments.length > 0 && (
            <div style={{ ...glass, padding: "24px 28px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px 0" }}>✅ Paiements complétés</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {completedPayments.map(payment => (
                  <div key={payment._id} style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: 12,
                    padding: "20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Transporteur</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{payment.transporteur?.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#4ade80" }}>{payment.amount} DT</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Poids: {payment.weight}kg</div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, marginTop: 12 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                        Transaction ID: <span style={{ fontFamily: "monospace", fontSize: 10 }}>{payment.transactionId?.slice(-8)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>✓ Payé</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
