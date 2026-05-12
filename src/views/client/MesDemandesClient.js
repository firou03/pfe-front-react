import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal";
import NotificationBell from "../../components/NotificationBell";
import { getClientRequestsForDashboard } from "../../service/restApiTransport";

const Icon = ({ d, size = 20, color = "#fff", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  package:  "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  truck:    "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  check:    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  plus:     "M12 4v16m8-8H4",
  map:      "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  chat:     "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user:     "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  logout:   "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  back:     "M15 19l-7-7 7-7",
};

export default function MesDemandesClient() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "En attente", color: "#60a5fa", bgColor: "rgba(96, 165, 250, 0.1)" },
      accepted_by_transporter: {
        label: "À confirmer",
        color: "#EF9F27",
        bgColor: "rgba(239, 159, 39, 0.1)",
        pulsing: true,
      },
      confirmed: { label: "Confirmée", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.1)" },
      cancelled: { label: "Annulée", color: "#f09595", bgColor: "rgba(240, 149, 149, 0.1)" },
      expired: { label: "Expirée", color: "#9ca3af", bgColor: "rgba(156, 163, 175, 0.1)" },
      delivered: { label: "Livrée", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.1)" },
    };

    const badge = badges[status] || badges.pending;

    return (
      <span
        style={{
          display: "inline-block",
          backgroundColor: badge.bgColor,
          color: badge.color,
          padding: "6px 12px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          position: "relative",
        }}
      >
        {badge.pulsing && (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              backgroundColor: badge.color,
              borderRadius: "50%",
              marginRight: 6,
              animation: "pulse 2s infinite",
            }}
          />
        )}
        {badge.label}
      </span>
    );
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-fadeup { animation: fadeUp 0.5s ease forwards; }
        .row-hover:hover { background: rgba(255,255,255,0.04) !important; }
        .row-hover { transition: background 0.15s; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0a0f1e 0%,#0f172a 40%,#0d1b2e 100%)",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}>

        {/* ── Sidebar ── */}
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "28px 16px",
          display: "flex", flexDirection: "column",
          zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingLeft: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            }}>
              <Icon d={ICONS.truck} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>TransportApp</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Client Portal</div>
            </div>
          </div>

          {/* Nav items */}
          {[
            { label: "Dashboard",       to: "/dashboard/client",   icon: ICONS.package, active: false  },
            { label: "Nouvelle demande",to: "/client",             icon: ICONS.plus,    active: false },
            { label: "Mes demandes",    to: "/client-requests",    icon: ICONS.check,   active: true  },
            { label: "Tracking",        to: "/tracking",           icon: ICONS.map,     active: false },
            { label: "Messagerie",      to: "/chat",               icon: ICONS.chat,    active: false },
            { label: "Mon Profil",      to: "/profile/client",     icon: ICONS.user,    active: false },
          ].map(({ label, to, icon, active }) => (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 12, marginBottom: 4,
              textDecoration: "none", color: active ? "#fff" : "rgba(255,255,255,0.5)",
              background: active ? "rgba(59,130,246,0.18)" : "transparent",
              border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
              fontWeight: active ? 600 : 400, fontSize: 13,
              transition: "all 0.2s",
            }}>
              <Icon d={icon} size={16} color={active ? "#60a5fa" : "rgba(255,255,255,0.4)"} />
              {label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          {/* User card at bottom */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            position: "relative"
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
            }}>
              {(currentUser?.name || currentUser?.email || "C").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow:"ellipsis" }}>
                {currentUser?.name || "Client"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow:"ellipsis" }}>
                {currentUser?.email || ""}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ marginLeft: 240, padding: "32px 36px", minHeight: "100vh", overflow: "visible" }}>

          {/* Top bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36,
            position: "relative", zIndex: 100,
          }} className="dash-fadeup">
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>
                Mes demandes
              </h1>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 100 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", zIndex: 9999 }}>
                <NotificationBell />
              </div>

              <button 
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171", cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
              >
                <Icon d={ICONS.logout} size={16} color="#f87171" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            overflow: "hidden",
            animation: "fadeUp 0.5s ease 0.2s both"
          }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.4)" }}>
                Chargement...
              </div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.4)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                Aucune demande pour le moment
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr 1fr 1.2fr",
                  gap: 16,
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trajet</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Poids</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sensible</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Transporteur</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Statut</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</span>
                </div>

                {/* Table Rows */}
                {requests.map((request) => (
                  <div
                    key={request._id}
                    className="row-hover"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr 1fr 1.2fr",
                      gap: 16,
                      padding: "14px 24px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      alignItems: "center",
                    }}
                  >
                    {/* Trajet */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>
                        {request.pickupLocation} → {request.deliveryLocation}
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      {new Date(request.date).toLocaleDateString("fr-FR")}
                    </div>

                    {/* Poids */}
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      {request.weight} kg
                    </div>

                    {/* Sensible */}
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      {request.isSensitive === "oui" ? "✓ Oui" : "Non"}
                    </div>

                    {/* Transporteur */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
                        {request.transporteur?.name || "-"}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        {request.transporteur?.email || ""}
                      </div>
                    </div>

                    {/* Statut */}
                    <div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Actions */}
                    <div>
                      {request.status === "accepted_by_transporter" && (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowConfirmationModal(true);
                          }}
                          style={{
                            backgroundColor: "rgba(239, 159, 39, 0.15)",
                            color: "#EF9F27",
                            border: "1px solid rgba(239, 159, 39, 0.3)",
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            textTransform: "uppercase",
                            transition: "all 0.2s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 159, 39, 0.25)";
                            e.currentTarget.style.borderColor = "rgba(239, 159, 39, 0.5)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 159, 39, 0.15)";
                            e.currentTarget.style.borderColor = "rgba(239, 159, 39, 0.3)";
                          }}
                        >
                          Confirmer
                        </button>
                      )}
                      {!["accepted_by_transporter"].includes(request.status) && (
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>-</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
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
