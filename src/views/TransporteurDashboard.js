import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getPendingRequests, getMesRequests, acceptTransportRequest, deliverTransportRequest } from "service/restApiTransport";
import { createConversation, sendMessage } from "service/restApiChat";
import NotificationBell from "components/NotificationBell";

const Icon = ({ d, size = 16, color = "#fff", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const D = {
  truck:  "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  clock:  "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  check:  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  list:   "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  map:    "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  chat:   "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user:   "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  dash:   "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  star:   "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 500, H = 180, bw = 38;
  const gap = (W - data.length * bw) / (data.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: "100%" }}>
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const bh = Math.max((d.v / max) * H, 4);
        const x = gap + i * (bw + gap), y = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={4} fill={d.v > 0 ? "url(#vg)" : "rgba(255,255,255,0.05)"} />
            <text x={x + bw / 2} y={H + 14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.3)">{d.l}</text>
            {d.v > 0 && <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.6)" fontWeight="700">{d.v}</text>}
          </g>
        );
      })}
    </svg>
  );
}

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

export default function TransporteurDashboard() {
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    isMounted.current = true;
    Promise.all([
      getPendingRequests().catch(() => ({ data: [] })),
      getMesRequests().catch(() => ({ data: [] })),
    ]).then(([p, a]) => {
      if (!isMounted.current) return;
      setPending(p.data || []);
      setAccepted(a.data || []);
      setLoading(false);
    });
    return () => { isMounted.current = false; };
  }, []);

  const handleAccept = async (id, clientId) => {
    try {
      await acceptTransportRequest(id);
      try {
        const convRes = await createConversation(clientId, id);
        const convId = convRes.data?._id;
        if (convId) {
          await sendMessage(convId, { content: "Bonjour, j'ai accepté votre demande de transport. Nous pouvons discuter des détails ici." });
        }
      } catch (chatErr) {
        console.error("Erreur création conversation via API:", chatErr.message);
      }
      setPending(prev => prev.filter(r => r._id !== id));
      const found = pending.find(r => r._id === id);
      if (found) setAccepted(prev => [{ ...found, status: "accepted" }, ...prev]);
      alert("Demande acceptée ! ✅");
    } catch { alert("Erreur lors de l'acceptation ❌"); }
  };
  
  const handleDeliver = async (id) => {
    try {
      await deliverTransportRequest(id);
      
      // Notify client via chat if possible
      const mission = accepted.find(r => r._id === id);
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

      setAccepted(prev => prev.map(r => r._id === id ? { ...r, status: "delivered" } : r));
      alert("Mission marquée comme livrée ! 📦✅");
    } catch {
      alert("Erreur lors de la mise à jour du statut ❌");
    }
  };

  const kpis = [
    { label: "Attente",  value: pending.length,  icon: D.clock, grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Acceptées",   value: accepted.length, icon: D.check, grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Total",       value: pending.length + accepted.length, icon: D.truck, grad: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
    { label: "Note",        value: "4.8 ★",         icon: D.star,  grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
  ];

  const chartData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const date = d.toISOString().split("T")[0];
      days.push({
        l: d.toLocaleDateString("fr-FR", { weekday: "short" }),
        v: accepted.filter(r => r.createdAt?.split("T")[0] === date || r.updatedAt?.split("T")[0] === date).length,
      });
    }
    return days;
  })();

  const navItems = [
    { label: "Dashboard", to: "/dashboard/transporteur", icon: D.dash, active: true },
    { label: "Demandes",  to: "/requests",               icon: D.list, active: false },
    { label: "Mes demandes", to: "/mes-requests",        icon: D.check, active: false },
    { label: "Historique", to: "/historique",            icon: D.clock, active: false },
    { label: "Messagerie",to: "/chat",                   icon: D.chat, active: false },
    { label: "Profil",    to: "/profile/transporteur",   icon: D.user, active: false },
  ];

  const quickActions = [
    { label: "Disponibles", to: "/requests",       icon: D.list,  grad: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
    { label: "Acceptées",   to: "/mes-requests",   icon: D.check, grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Historique",  to: "/historique",     icon: D.clock, grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Messagerie",  to: "/chat",           icon: D.chat,  grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", fontFamily:"'Inter',sans-serif", color:"#fff", display:"flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Sidebar - Enhanced */}
      <aside style={{ width:240, background:"rgba(255,255,255,0.02)", borderRight:"1px solid rgba(255,255,255,0.05)", padding:"30px 20px", display:"flex", flexDirection:"column", position:"fixed", height:"100vh", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40, paddingLeft:4 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
            <Icon d={D.truck} size={18} />
          </div>
          <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.5px" }}>T-Portal</span>
        </div>

        {navItems.map(n => (
          <Link key={n.to} to={n.to} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, marginBottom:4, textDecoration:"none", fontSize:14, fontWeight:500, color:n.active?"#fff":"rgba(255,255,255,0.4)", background:n.active?"rgba(124,58,237,0.15)":"transparent", transition:"all 0.2s" }}>
            <Icon d={n.icon} size={16} color={n.active?"#a78bfa":"rgba(255,255,255,0.3)"} />
            {n.label}
          </Link>
        ))}
        
        <div style={{ padding:"12px 16px", background:"rgba(255,255,255,0.03)", borderRadius:16, display:"flex", alignItems:"center", gap:10, border:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>{user?.name?.[0] || "U"}</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name || "User"}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>Transporteur</div>
          </div>
        </div>
      </aside>

      <main style={{ flex:1, marginLeft:240, padding:"30px 40px" }}>
        <header style={{ marginBottom:30, display:"flex", justifyContent:"space-between", alignItems:"center", position: "relative", zIndex: 100 }}>
          <div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:2, letterSpacing:1 }}>Dashboard</div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Bonjour, {user?.name?.split(" ")[0] || "T"}</h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 100 }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", zIndex: 9999 }}>
              <NotificationBell />
            </div>
            
            <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", padding:"8px 16px", borderRadius:10, cursor:"pointer", color:"#f87171", fontSize:13, fontWeight:600, transition:"all 0.2s" }}>
              <Icon d={D.logout} size={14} color="#f87171" />
              Déconnexion
            </button>
          </div>
        </header>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ ...glass, padding:"12px" }}>
              <div style={{ width:24, height:24, borderRadius:6, background:k.grad, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                <Icon d={k.icon} size={12} />
              </div>
              <div style={{ fontSize:16, fontWeight:800 }}>{loading ? "—" : k.value}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Pending List */}
            <div style={{ ...glass, padding:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <h2 style={{ fontSize:13, margin:0 }}>Demandes en attente</h2>
                <Link to="/requests" style={{ fontSize:10, color:"#a78bfa", textDecoration:"none" }}>Voir tout</Link>
              </div>
              {loading ? (
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>Chargement...</div>
              ) : pending.length === 0 ? (
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center", padding:20 }}>Aucune demande</div>
              ) : (
                pending.slice(0, 4).map(r => (
                  <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>{r.pickupLocation} → {r.deliveryLocation}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{r.weight}kg · {r.date ? new Date(r.date).toLocaleDateString() : ""}</div>
                    </div>
                    <button onClick={() => handleAccept(r._id, r.client?._id)} style={{ padding:"4px 10px", borderRadius:6, border:"none", background:"#22c55e", color:"#fff", fontSize:10, fontWeight:700, cursor:"pointer" }}>Accepter</button>
                  </div>
                ))
              )}
            </div>

            {/* Accepted List */}
            <div style={{ ...glass, padding:"16px" }}>
              <h2 style={{ fontSize:13, margin:"0 0 12px" }}>Mes missions</h2>
              {loading ? null : accepted.length === 0 ? (
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center", padding:10 }}>Rien à afficher</div>
              ) : (
                accepted.slice(0, 3).map(r => (
                  <div key={r._id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background: r.status === "delivered" ? "#3b82f6" : "#22c55e" }} />
                      <div style={{ fontSize:11 }}>
                        <div style={{ fontWeight:600 }}>{r.pickupLocation} → {r.deliveryLocation}</div>
                        <div style={{ fontSize:9, color: r.status === "delivered" ? "#60a5fa" : "rgba(255,255,255,0.3)" }}>
                          {r.status === "delivered" ? "Livrée" : "En cours"}
                        </div>
                      </div>
                    </div>
                    {r.status !== "delivered" && (
                      <button 
                        onClick={() => handleDeliver(r._id)} 
                        style={{ padding:"4px 8px", borderRadius:6, border:"1px solid #22c55e", background:"transparent", color:"#22c55e", fontSize:9, fontWeight:700, cursor:"pointer", transition:"0.2s" }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "#22c55e"; e.currentTarget.style.color = "#fff"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#22c55e"; }}
                      >
                        Livré
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions moved here */}
            <div style={{ ...glass, padding:"16px" }}>
              <h2 style={{ fontSize:12, margin:"0 0 10px" }}>Actions rapides</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
                {quickActions.map(a => (
                  <Link key={a.label} to={a.to} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, padding:"12px 8px", borderRadius:10, background:a.grad, textDecoration:"none", color:"#fff", textAlign:"center" }}>
                    <Icon d={a.icon} size={16} />
                    <span style={{ fontSize:10, fontWeight:700 }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity focus */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ ...glass, padding:"24px", flex:1, display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Activité de transport</h2>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>7 derniers jours</div>
              </div>
              <div style={{ flex:1, display:"flex", alignItems:"center" }}>
                <BarChart data={chartData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
