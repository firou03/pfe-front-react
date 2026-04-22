import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getPendingRequests, getMesRequests, acceptTransportRequest } from "service/restApiTransport";

const Icon = ({ d, size = 20, color = "#fff", sw = 1.8 }) => (
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
};

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 340, H = 100, bw = 32;
  const gap = (W - data.length * bw) / (data.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%" }}>
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
            <rect x={x} y={y} width={bw} height={bh} rx={6} fill={d.v > 0 ? "url(#vg)" : "rgba(255,255,255,0.05)"} />
            <text x={x + bw / 2} y={H + 16} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.35)">{d.l}</text>
            {d.v > 0 && <text x={x + bw / 2} y={y - 5} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.6)" fontWeight="700">{d.v}</text>}
          </g>
        );
      })}
    </svg>
  );
}

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
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

  const handleAccept = async (id) => {
    try {
      await acceptTransportRequest(id);
      setPending(prev => prev.filter(r => r._id !== id));
      const found = pending.find(r => r._id === id);
      if (found) setAccepted(prev => [{ ...found, status: "accepted" }, ...prev]);
    } catch { alert("Erreur lors de l'acceptation ❌"); }
  };

  const kpis = [
    { label: "En attente",  value: pending.length,  icon: D.clock, grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: "Acceptées",   value: accepted.length, icon: D.check, grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Total",       value: pending.length + accepted.length, icon: D.truck, grad: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
    { label: "Note moy.",   value: "4.8 ★",         icon: D.star,  grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
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
    { label: "Dashboard",       to: "/dashboard/transporteur", icon: D.dash, active: true },
    { label: "Demandes",        to: "/requests",               icon: D.list, active: false },
    { label: "Mes demandes",    to: "/mes-requests",           icon: D.check,active: false },
    { label: "Tracking",        to: "/tracking",               icon: D.map,  active: false },
    { label: "Messagerie",      to: "/chat",                   icon: D.chat, active: false },
    { label: "Mon Profil",      to: "/profile/transporteur",   icon: D.user, active: false },
  ];

  const quickActions = [
    { label: "Demandes dispo.", to: "/requests",       icon: D.list,  grad: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
    { label: "Mes demandes",    to: "/mes-requests",   icon: D.check, grad: "linear-gradient(135deg,#22c55e,#15803d)" },
    { label: "Tracking",        to: "/tracking",       icon: D.map,   grad: "linear-gradient(135deg,#1e293b,#334155)" },
    { label: "Messagerie",      to: "/chat",           icon: D.chat,  grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fu  { animation: fadeUp 0.45s ease forwards; }
        .kpi:hover { transform:translateY(-4px) scale(1.02); }
        .kpi { transition: transform 0.22s ease; }
        .act:hover { transform:translateY(-3px); filter:brightness(1.1); }
        .act { transition: transform 0.2s, filter 0.2s; }
        .nl:hover  { background: rgba(255,255,255,0.1) !important; }
        .nl  { transition: background 0.15s; }
        .rh:hover  { background: rgba(255,255,255,0.04) !important; }
        .rh  { transition: background 0.12s; }
        .acc-btn:hover { background: rgba(34,197,94,0.25) !important; }
        .acc-btn { transition: background 0.15s; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0f1e 0%,#100b2e 50%,#0a0f1e 100%)", fontFamily:"'Inter',sans-serif", color:"#fff" }}>

        {/* Sidebar */}
        <aside style={{
          position:"fixed", top:0, left:0, bottom:0, width:240,
          background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.07)",
          padding:"28px 16px", display:"flex", flexDirection:"column", zIndex:100,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40, paddingLeft:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(124,58,237,0.45)" }}>
              <Icon d={D.truck} size={18} />
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>TransportApp</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:1 }}>Transporteur Portal</div>
            </div>
          </div>

          {navItems.map(({ label, to, icon, active }) => (
            <Link key={to} to={to} className="nl" style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, marginBottom:4,
              textDecoration:"none", fontSize:13, fontWeight: active ? 600 : 400,
              color: active ? "#fff" : "rgba(255,255,255,0.45)",
              background: active ? "rgba(124,58,237,0.18)" : "transparent",
              border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
            }}>
              <Icon d={icon} size={16} color={active ? "#a78bfa" : "rgba(255,255,255,0.35)"} />
              {label}
            </Link>
          ))}

          <div style={{ flex:1 }} />

          <div style={{ ...glass, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
              {(user?.name || user?.email || "T").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name || "Transporteur"}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.email || ""}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft:240, padding:"32px 36px", minHeight:"100vh" }}>

          {/* Top bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:36 }} className="fu">
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
                {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
              </div>
              <h1 style={{ fontSize:26, fontWeight:800, margin:0 }}>
                Bonjour, {user?.name?.split(" ")[0] || "Transporteur"} 🚚
              </h1>
            </div>
            <Link to="/requests" className="act" style={{
              display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12,
              fontSize:13, fontWeight:600, background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
              color:"#fff", textDecoration:"none", boxShadow:"0 4px 14px rgba(124,58,237,0.45)",
            }}>
              <Icon d={D.list} size={15} />
              Voir les demandes
            </Link>
          </div>

          {/* KPI row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:28 }}>
            {kpis.map((k, i) => (
              <div key={i} className="kpi" style={{ ...glass, padding:"22px 24px", animation:`fadeUp 0.45s ease ${i*0.07}s both` }}>
                <div style={{ width:42, height:42, borderRadius:12, background:k.grad, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, boxShadow:"0 4px 10px rgba(0,0,0,0.3)" }}>
                  <Icon d={k.icon} size={19} />
                </div>
                <div style={{ fontSize:28, fontWeight:800, lineHeight:1 }}>{loading ? "—" : k.value}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:5, fontWeight:500 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Bottom grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>

            {/* Pending requests panel */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ ...glass, padding:"24px 28px", animation:"fadeUp 0.45s ease 0.3s both" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div>
                    <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Demandes en attente</h2>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginTop:3 }}>{pending.length} demande(s) disponible(s)</p>
                  </div>
                  <Link to="/requests" style={{ fontSize:11, fontWeight:600, color:"#a78bfa", textDecoration:"none", background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", padding:"5px 12px", borderRadius:8 }}>Toutes →</Link>
                </div>

                {loading ? (
                  <div style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", padding:"40px 0", fontSize:13 }}>Chargement...</div>
                ) : pending.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 0" }}>
                    <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
                    <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>Aucune demande en attente</div>
                  </div>
                ) : (
                  pending.slice(0, 5).map((r, i) => (
                    <div key={r._id || i} className="rh" style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"12px 10px", borderRadius:12,
                      borderBottom: i < Math.min(4, pending.length - 1) ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {r.pickupLocation} → {r.deliveryLocation}
                        </div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", display:"flex", gap:12 }}>
                          <span>📅 {r.date ? new Date(r.date).toLocaleDateString("fr-FR") : "—"}</span>
                          <span>⚖️ {r.weight ? `${r.weight} kg` : "—"}</span>
                          {r.isSensitive === "oui" && <span style={{ color:"#fca5a5" }}>⚠️ Fragile</span>}
                        </div>
                      </div>
                      <button className="acc-btn" onClick={() => handleAccept(r._id)} style={{
                        marginLeft:12, padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:700,
                        background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)",
                        color:"#4ade80", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
                      }}>
                        ✓ Accepter
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Accepted requests */}
              <div style={{ ...glass, padding:"24px 28px", animation:"fadeUp 0.45s ease 0.4s both" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <h2 style={{ fontSize:15, fontWeight:700, margin:0 }}>Mes demandes acceptées</h2>
                  <Link to="/mes-requests" style={{ fontSize:11, fontWeight:600, color:"#4ade80", textDecoration:"none", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", padding:"5px 12px", borderRadius:8 }}>Toutes →</Link>
                </div>
                {loading ? (
                  <div style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", padding:"24px 0", fontSize:13 }}>Chargement...</div>
                ) : accepted.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"24px 0" }}>
                    <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>Aucune demande acceptée</div>
                  </div>
                ) : (
                  accepted.slice(0, 4).map((r, i) => (
                    <div key={r._id || i} className="rh" style={{
                      display:"flex", alignItems:"center", gap:12, padding:"10px 8px", borderRadius:10,
                      borderBottom: i < Math.min(3, accepted.length - 1) ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {r.pickupLocation} → {r.deliveryLocation}
                        </div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>
                          {r.client?.name || r.client?.email || "Client"} · {r.weight ? `${r.weight} kg` : ""}
                        </div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:600, color:"#4ade80", background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.25)", padding:"2px 8px", borderRadius:20, flexShrink:0 }}>Acceptée</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Chart */}
              <div style={{ ...glass, padding:"22px 24px", animation:"fadeUp 0.45s ease 0.35s both" }}>
                <h2 style={{ fontSize:14, fontWeight:700, margin:"0 0 16px" }}>Activité (7 jours)</h2>
                <BarChart data={chartData} />
              </div>

              {/* Quick actions */}
              <div style={{ ...glass, padding:"22px 24px", animation:"fadeUp 0.45s ease 0.42s both" }}>
                <h2 style={{ fontSize:14, fontWeight:700, margin:"0 0 14px" }}>Actions rapides</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {quickActions.map(({ label, to, icon, grad }) => (
                    <Link key={to} to={to} className="act" style={{
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                      gap:8, padding:"16px 10px", borderRadius:14, minHeight:76,
                      background:grad, color:"#fff", textDecoration:"none",
                      fontSize:11, fontWeight:600, textAlign:"center",
                      boxShadow:"0 4px 12px rgba(0,0,0,0.25)",
                    }}>
                      <Icon d={icon} size={20} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Stats summary */}
              <div style={{ ...glass, padding:"20px 24px", animation:"fadeUp 0.45s ease 0.48s both" }}>
                <h2 style={{ fontSize:14, fontWeight:700, margin:"0 0 14px" }}>Résumé</h2>
                {[
                  { label:"Taux d'acceptation", value: pending.length + accepted.length > 0 ? `${Math.round((accepted.length / (pending.length + accepted.length)) * 100)}%` : "—" },
                  { label:"Moy. colis/jour", value: chartData.reduce((s,d) => s + d.v, 0) > 0 ? (chartData.reduce((s,d) => s + d.v, 0) / 7).toFixed(1) : "0" },
                  { label:"Fragile traités", value: accepted.filter(r => r.isSensitive === "oui").length },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#a78bfa" }}>{loading ? "—" : value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
