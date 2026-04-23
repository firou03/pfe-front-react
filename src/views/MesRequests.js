import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMesRequests, deliverTransportRequest } from "service/restApiTransport";
import { createConversation, sendMessage } from "service/restApiChat";

const Ic = ({ d, size = 16, color = "rgba(255,255,255,0.35)", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const D = {
  dash:  "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  plus:  "M12 4v16m8-8H4",
  map:   "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  chat:  "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user:  "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  list:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  box:   "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
};

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const navItems = [
  { label: "Dashboard",        to: "/dashboard/transporteur", icon: D.dash,  active: false },
  { label: "Demandes dispo.",  to: "/requests",               icon: D.list,  active: false },
  { label: "Mes demandes",     to: "/mes-requests",           icon: D.check, active: true  },
  { label: "Tracking",         to: "/tracking",               icon: D.map,   active: false },
  { label: "Messagerie",       to: "/chat",                   icon: D.chat,  active: false },
  { label: "Mon Profil",       to: "/profile/transporteur",   icon: D.user,  active: false },
];

export default function MesRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  const fetchRequests = () => {
    getMesRequests()
      .then(res => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDeliver = async (id) => {
    try {
      await deliverTransportRequest(id);
      
      // Notify client via chat if possible
      const mission = requests.find(r => r._id === id);
      if (mission && mission.client?._id) {
        try {
          const convRes = await createConversation(mission.client._id, id);
          const convId = convRes.data?._id;
          if (convId) {
            await sendMessage(convId, { content: "✅ Votre colis a été livré avec succès. Merci de nous avoir fait confiance !" });
          }
        } catch (chatErr) {
          console.error("Erreur notification chat:", chatErr);
        }
      }

      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: "delivered" } : r));
      alert("Mission marquée comme livrée ! 📦✅");
    } catch {
      alert("Erreur lors de la mise à jour du statut ❌");
    }
  };

  const filtered = filter === "all" ? requests
    : requests.filter(r => r.isSensitive === (filter === "fragile" ? "oui" : "non"));

  const stats = [
    { label: "Total acceptées", value: requests.length,                                          color: "#60a5fa", bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.25)"  },
    { label: "Non sensibles",   value: requests.filter(r => r.isSensitive !== "oui").length,    color: "#4ade80", bg: "rgba(34,197,94,0.15)",   border: "rgba(34,197,94,0.25)"   },
    { label: "Fragiles",        value: requests.filter(r => r.isSensitive === "oui").length,    color: "#f87171", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.25)"   },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp 0.4s ease forwards; }
        .nl:hover { background: rgba(255,255,255,0.09) !important; }
        .nl  { transition: background 0.15s; }
        .rh:hover { background: rgba(255,255,255,0.04) !important; }
        .rh  { transition: background 0.12s; }
        .fil:hover { background: rgba(255,255,255,0.08) !important; }
        .fil { transition: background 0.15s, border-color 0.15s; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0f1e 0%,#100b2e 50%,#0a0f1e 100%)", fontFamily:"'Inter',sans-serif", color:"#fff", display:"flex" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          position:"fixed", top:0, left:0, bottom:0, width:240,
          background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.07)",
          padding:"28px 16px", display:"flex", flexDirection:"column", zIndex:100,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40, paddingLeft:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(124,58,237,0.4)" }}>
              <Ic d={D.truck} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>TransportApp</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:1 }}>Transporteur Portal</div>
            </div>
          </div>

          {navItems.map(({ label, to, icon, active }) => (
            <Link key={to} to={to} className="nl" style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
              borderRadius:12, marginBottom:4, textDecoration:"none", fontSize:13,
              fontWeight: active ? 600 : 400,
              color: active ? "#fff" : "rgba(255,255,255,0.45)",
              background: active ? "rgba(124,58,237,0.18)" : "transparent",
              border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
            }}>
              <Ic d={icon} size={16} color={active ? "#a78bfa" : "rgba(255,255,255,0.35)"} />
              {label}
            </Link>
          ))}

          <div style={{ flex:1 }} />

          <div style={{ ...glass, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
              {(currentUser?.name || currentUser?.email || "T").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser?.name || "Transporteur"}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser?.email || ""}</div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ marginLeft:240, flex:1, padding:"36px 40px", minHeight:"100vh" }}>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }} className="fu">
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Transporteur</div>
              <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Mes demandes acceptées</h1>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>Toutes les demandes que vous avez prises en charge</p>
            </div>
            <Link to="/requests" style={{
              display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12,
              fontSize:13, fontWeight:600, background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
              color:"#fff", textDecoration:"none", boxShadow:"0 4px 14px rgba(124,58,237,0.4)",
            }}>
              <Ic d={D.list} size={15} color="#fff" />
              Voir les demandes dispo.
            </Link>
          </div>

          {/* ── KPI strip ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ ...glass, padding:"20px 24px", animation:`fadeUp 0.4s ease ${i*0.07}s both`, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:s.bg, border:`1px solid ${s.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:18, fontWeight:800, color:s.color }}>{loading ? "—" : s.value}</span>
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Table card ── */}
          <div style={{ ...glass, padding:"24px 28px", animation:"fadeUp 0.4s ease 0.25s both" }}>

            {/* Table header row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Liste des demandes</h2>
              {/* Filters */}
              <div style={{ display:"flex", gap:8 }}>
                {[
                  { key:"all",     label:"Toutes"       },
                  { key:"normal",  label:"Non sensibles" },
                  { key:"fragile", label:"Fragiles"      },
                ].map(f => (
                  <button key={f.key} className="fil" onClick={() => setFilter(f.key)} style={{
                    padding:"5px 14px", borderRadius:20, fontSize:11, fontWeight:600,
                    cursor:"pointer", border:"1px solid",
                    background: filter === f.key ? "rgba(124,58,237,0.2)"    : "rgba(255,255,255,0.04)",
                    borderColor: filter === f.key ? "rgba(124,58,237,0.4)"   : "rgba(255,255,255,0.1)",
                    color: filter === f.key ? "#a78bfa" : "rgba(255,255,255,0.45)",
                  }}>{f.label}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", padding:"60px 0", fontSize:13 }}>Chargement...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>Aucune demande trouvée</div>
                <Link to="/requests" style={{ display:"inline-block", marginTop:16, padding:"8px 22px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", textDecoration:"none", fontSize:12, fontWeight:600 }}>
                  Voir les demandes disponibles
                </Link>
              </div>
            ) : (
              <>
                {/* Column headers */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 90px 70px 110px 120px 130px", gap:8, padding:"0 12px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  {["Départ","Livraison","Date","Poids","Sensible","Client","Statut / Actions"].map(h => (
                    <span key={h} style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {filtered.map((r, i) => (
                  <div key={r._id || i} className="rh" style={{
                    display:"grid", gridTemplateColumns:"1fr 1fr 90px 70px 110px 120px 100px",
                    gap:8, padding:"13px 12px", borderRadius:10,
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <span style={{ fontSize:12, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.pickupLocation || "—"}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.deliveryLocation || "—"}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{r.date ? new Date(r.date).toLocaleDateString("fr-FR") : "—"}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{r.weight ? `${r.weight} kg` : "—"}</span>

                    {/* Sensitive badge */}
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600,
                      padding:"2px 10px", borderRadius:20, width:"fit-content",
                      background: r.isSensitive === "oui" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                      color: r.isSensitive === "oui" ? "#f87171" : "#4ade80",
                      border: `1px solid ${r.isSensitive === "oui" ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
                    }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background: r.isSensitive === "oui" ? "#f87171" : "#4ade80", display:"inline-block" }} />
                      {r.isSensitive === "oui" ? "Fragile" : "Normal"}
                    </span>

                    {/* Client */}
                    <div style={{ overflow:"hidden" }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.6)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.client?.name || "—"}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.client?.email || ""}</div>
                    </div>

                    {/* Status / Actions */}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600,
                        padding:"2px 10px", borderRadius:20, width:"fit-content",
                        background: r.status === "delivered" ? "rgba(59,130,246,0.12)" : "rgba(34,197,94,0.12)",
                        color: r.status === "delivered" ? "#60a5fa" : "#4ade80",
                        border: `1px solid ${r.status === "delivered" ? "rgba(59,130,246,0.25)" : "rgba(34,197,94,0.25)"}`,
                      }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background: r.status === "delivered" ? "#60a5fa" : "#4ade80", display:"inline-block" }} />
                        {r.status === "delivered" ? "Livrée" : "Acceptée"}
                      </span>
                      
                      {r.status !== "delivered" && (
                        <button onClick={() => handleDeliver(r._id)} style={{
                          padding:"4px 8px", borderRadius:8, fontSize:9, fontWeight:800, cursor:"pointer",
                          background:"#22c55e", color:"#fff", border:"none", boxShadow:"0 2px 6px rgba(34,197,94,0.3)"
                        }}>
                          LIVRER
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
    </>
  );
}