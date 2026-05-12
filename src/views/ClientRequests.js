import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getClientRequestsForDashboard } from "service/restApiTransport";
import RatingModal from "components/RatingModal";

const Ic = ({ d, size = 16, color = "rgba(255,255,255,0.35)", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const D = {
  dash: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  plus: "M12 4v16m8-8H4",
  map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  list: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
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
  { label: "Nouvelle demande", to: "/client", icon: D.plus, active: false },
  { label: "Mes demandes", to: "/client-requests", icon: D.list, active: true },
  { label: "Tracking", to: "/tracking", icon: D.map, active: false },
  { label: "Messagerie", to: "/chat", icon: D.chat, active: false },
  { label: "Mon Profil", to: "/profile/client", icon: D.user, active: false },
];

export default function ClientRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [ratingModal, setRatingModal] = useState({ isOpen: false, request: null });

  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  const fetchRequests = () => {
    getClientRequestsForDashboard()
      .then(res => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filters = [
    { key: "all", label: "Toutes" },
    { key: "pending", label: "En attente" },
    { key: "accepted", label: "Acceptées" },
    { key: "delivered", label: "Livrées" },
  ];

  const filtered = requests.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
        {/* Sidebar */}
        <aside style={{ width: 260, padding: "30px 20px", borderRight: "1px solid rgba(255,255,255,0.08)", overflowY: "auto" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 30 }}>🚚 Transport+</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {navItems.map((item) => (
              <Link key={item.label} to={item.to} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                  background: item.active ? "rgba(59,130,246,0.15)" : "transparent",
                  color: item.active ? "#60a5fa" : "rgba(255,255,255,0.6)",
                  fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.2s", border: item.active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                }}>
                  <Ic d={item.icon} size={18} color={item.active ? "#60a5fa" : "rgba(255,255,255,0.4)"} />
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "40px 50px", overflowY: "auto" }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Mes demandes</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Suivi de vos demandes de transport</p>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: 30, display: "flex", gap: 10 }}>
            {filters.map(f => (
              <button key={f.key} className="fil" onClick={() => setFilter(f.key)} style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: "pointer", border: "1px solid",
                background: filter === f.key ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                borderColor: filter === f.key ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)",
                color: filter === f.key ? "#a78bfa" : "rgba(255,255,255,0.45)",
              }}>{f.label}</button>
            ))}
          </div>

          {/* Requests Table */}
          <div style={{ ...glass, overflow: "hidden" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "60px 0", fontSize: 13 }}>Chargement...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Aucune demande trouvée</div>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 70px 110px 150px 130px", gap: 8, padding: "0 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Départ", "Livraison", "Date", "Poids", "Sensible", "Transporteur", "Statut / Actions"].map(h => (
                    <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {filtered.map((r) => (
                  <div key={r._id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 70px 110px 150px 130px", gap: 8, padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                    {/* Départ */}
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.pickupLocation || "—"}</div>
                    </div>

                    {/* Livraison */}
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.deliveryLocation || "—"}</div>
                    </div>

                    {/* Date */}
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{r.date || "—"}</span>

                    {/* Poids */}
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{r.weight || "—"}kg</span>

                    {/* Sensible */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600,
                      padding: "2px 8px", borderRadius: 20, width: "fit-content",
                      background: r.isSensitive === "oui" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                      color: r.isSensitive === "oui" ? "#f87171" : "#4ade80",
                      border: `1px solid ${r.isSensitive === "oui" ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: r.isSensitive === "oui" ? "#f87171" : "#4ade80", display: "inline-block" }} />
                      {r.isSensitive === "oui" ? "Fragile" : "Normal"}
                    </span>

                    {/* Transporteur */}
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.transporteur?.name || "—"}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.transporteur?.email || ""}</div>
                    </div>

                    {/* Status / Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600,
                        padding: "2px 10px", borderRadius: 20, width: "fit-content",
                        background: r.status === "delivered" ? "rgba(59,130,246,0.12)" : r.status === "accepted" ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)",
                        color: r.status === "delivered" ? "#60a5fa" : r.status === "accepted" ? "#4ade80" : "#fbbf24",
                        border: `1px solid ${r.status === "delivered" ? "rgba(59,130,246,0.25)" : r.status === "accepted" ? "rgba(34,197,94,0.25)" : "rgba(251,191,36,0.25)"}`,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: r.status === "delivered" ? "#60a5fa" : r.status === "accepted" ? "#4ade80" : "#fbbf24", display: "inline-block" }} />
                        {r.status === "delivered" ? "Livrée" : r.status === "accepted" ? "Acceptée" : "En attente"}
                      </span>

                      {r.status === "delivered" && (
                        <button onClick={() => setRatingModal({ isOpen: true, request: r })} style={{
                          padding: "4px 8px", borderRadius: 8, fontSize: 9, fontWeight: 800, cursor: "pointer",
                          background: "#fbbf24", color: "#000", border: "none", boxShadow: "0 2px 6px rgba(251,191,36,0.3)"
                        }}>
                          ⭐ ÉVALUER
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </main>
      </div>

      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, request: null })}
        userId={currentUser._id}
        targetUserId={ratingModal.request?.transporteur?._id}
        requestId={ratingModal.request?._id}
        targetUserName={ratingModal.request?.transporteur?.name}
      />
    </>
  );
}
