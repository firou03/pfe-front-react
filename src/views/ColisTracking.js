import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMesRequests, getClientRequests, updateRequestLocation } from "service/restApiTransport";

const TRACKING_KEY = "colisTrackingByRequest";
const getStoredTracking = () => { try { return JSON.parse(localStorage.getItem(TRACKING_KEY) || "{}"); } catch { return {}; } };
const getStoredClientRequests = () => { try { return JSON.parse(localStorage.getItem("clientRequests") || "[]"); } catch { return []; } };
const sameUser = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

const Ic = ({ d, size = 16, color = "rgba(255,255,255,0.35)", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const D = {
  dash:  "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  plus:  "M12 4v16m8-8H4",
  list:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  map:   "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  chat:  "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user:  "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  pin:   "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
};

const glass = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" };

export default function ColisTracking() {
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }, []);
  const isTransporteur = user?.role === "transporteur";

  const [requests, setRequests] = useState([]);
  const [tracking, setTracking] = useState(getStoredTracking());
  const [locationInputs, setLocationInputs] = useState({});
  const [loading, setLoading] = useState(true);

  const filterRequests = React.useCallback((list, opts = {}) => {
    const arr = Array.isArray(list) ? list : [];
    if (isTransporteur) return arr.filter(r => {
      if (r.transporteur?._id && user?._id) return sameUser(r.transporteur._id, user._id);
      if (r.transporteur?.email && user?.email) return sameUser(r.transporteur.email, user.email);
      if (r.assignedTransporteurId && user?._id) return sameUser(r.assignedTransporteurId, user._id);
      return true;
    });
    return arr.filter(r => {
      if (r.client?._id && user?._id) return sameUser(r.client._id, user._id);
      if (r.client?.email && user?.email) return sameUser(r.client.email, user.email);
      if (r.createdByClientId && user?._id) return sameUser(r.createdByClientId, user._id);
      if (r.createdByClientEmail && user?.email) return sameUser(r.createdByClientEmail, user.email);
      return opts.trustServerScope || false;
    });
  }, [isTransporteur, user]);

  useEffect(() => {
    const load = async () => {
      try {
        if (isTransporteur) {
          const res = await getMesRequests();
          setRequests(filterRequests(res.data || [], { trustServerScope: true }));
        } else {
          try {
            const res = await getClientRequests();
            const scoped = filterRequests(res.data || [], { trustServerScope: true });
            setRequests(scoped.filter(r => String(r?.status || "").toLowerCase().includes("accept")));
          } catch {
            const local = filterRequests(getStoredClientRequests());
            setRequests(local.filter(r => String(r?.status || "").toLowerCase().includes("accept")));
          }
        }
      } catch { setRequests([]); }
      finally { setLoading(false); }
    };
    load();
  }, [isTransporteur, filterRequests]);

  const saveTracking = async (request) => {
    if (!isTransporteur) { alert("Seul le transporteur peut mettre à jour la localisation."); return; }
    const loc = (locationInputs[request._id] || "").trim();
    if (!loc) { alert("Veuillez saisir une localisation."); return; }
    const entry = { location: loc, updatedAt: new Date().toISOString(), updatedBy: user?.name || "transporteur" };
    const updated = { ...tracking, [request._id]: entry };
    setTracking(updated);
    localStorage.setItem(TRACKING_KEY, JSON.stringify(updated));
    try { await updateRequestLocation(request._id, { currentLocation: loc }); } catch {}
    setLocationInputs(prev => ({ ...prev, [request._id]: "" }));
    alert("Localisation mise à jour ✅");
  };

  const clientNav = [
    { label:"Dashboard",        to:"/dashboard/client",  icon:D.dash,  active:false },
    { label:"Nouvelle demande", to:"/client",             icon:D.plus,  active:false },
    { label:"Tracking",         to:"/tracking",           icon:D.map,   active:true  },
    { label:"Messagerie",       to:"/chat",               icon:D.chat,  active:false },
    { label:"Mon Profil",       to:"/profile/client",     icon:D.user,  active:false },
  ];
  const transporteurNav = [
    { label:"Dashboard",        to:"/dashboard/transporteur", icon:D.dash,  active:false },
    { label:"Demandes dispo.",  to:"/requests",               icon:D.list,  active:false },
    { label:"Mes demandes",     to:"/mes-requests",           icon:D.check, active:false },
    { label:"Tracking",         to:"/tracking",               icon:D.map,   active:true  },
    { label:"Messagerie",       to:"/chat",                   icon:D.chat,  active:false },
    { label:"Mon Profil",       to:"/profile/transporteur",   icon:D.user,  active:false },
  ];
  const navItems = isTransporteur ? transporteurNav : clientNav;
  const accent = isTransporteur ? { from:"#7c3aed", to:"#6d28d9", glow:"rgba(124,58,237,0.4)", active:"rgba(124,58,237,0.18)", activeBorder:"rgba(124,58,237,0.3)", icon:"#a78bfa" }
                                : { from:"#3b82f6", to:"#2563eb", glow:"rgba(59,130,246,0.4)",  active:"rgba(59,130,246,0.18)",  activeBorder:"rgba(59,130,246,0.25)",  icon:"#60a5fa" };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp 0.4s ease forwards; }
        .nl:hover { background:rgba(255,255,255,0.09) !important; }
        .nl { transition:background 0.15s; }
        .card:hover { transform:translateY(-2px); box-shadow:0 20px 40px rgba(0,0,0,0.3) !important; }
        .card { transition:transform 0.2s, box-shadow 0.2s; }
        input::placeholder { color:rgba(255,255,255,0.2); }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#0a0f1e 100%)", fontFamily:"'Inter',sans-serif", color:"#fff", display:"flex" }}>

        {/* Sidebar */}
        <aside style={{ position:"fixed", top:0, left:0, bottom:0, width:240, background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.07)", padding:"28px 16px", display:"flex", flexDirection:"column", zIndex:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40, paddingLeft:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${accent.from},${accent.to})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 12px ${accent.glow}` }}>
              <Ic d={D.truck} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>TransportApp</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{isTransporteur ? "Transporteur Portal" : "Client Portal"}</div>
            </div>
          </div>
          {navItems.map(({ label, to, icon, active }) => (
            <Link key={to} to={to} className="nl" style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, marginBottom:4, textDecoration:"none", fontSize:13, fontWeight:active?600:400, color:active?"#fff":"rgba(255,255,255,0.45)", background:active?accent.active:"transparent", border:active?`1px solid ${accent.activeBorder}`:"1px solid transparent" }}>
              <Ic d={icon} size={16} color={active ? accent.icon : "rgba(255,255,255,0.35)"} />
              {label}
            </Link>
          ))}
          <div style={{ flex:1 }} />
          <div style={{ ...glass, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${accent.from},${accent.to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name || "Utilisateur"}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.email || ""}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft:240, flex:1, padding:"36px 40px" }}>
          <div style={{ marginBottom:32 }} className="fu">
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Suivi</div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Tracking des colis</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>
              {isTransporteur ? "Mettez à jour la position de vos colis pris en charge." : "Consultez la localisation la plus récente de vos colis."}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", padding:"80px 0", fontSize:13 }}>Chargement...</div>
          ) : requests.length === 0 ? (
            <div style={{ ...glass, padding:"60px 40px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:14 }}>📦</div>
              <div style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>Aucun colis à suivre</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginBottom:20 }}>
                {isTransporteur ? "Acceptez des demandes pour les suivre ici." : "Vos colis acceptés apparaîtront ici."}
              </div>
              <Link to={isTransporteur ? "/requests" : "/client"} style={{ padding:"10px 24px", borderRadius:12, background:`linear-gradient(135deg,${accent.from},${accent.to})`, color:"#fff", textDecoration:"none", fontSize:13, fontWeight:600 }}>
                {isTransporteur ? "Voir les demandes" : "Créer une demande"}
              </Link>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(440px,1fr))", gap:20 }}>
              {requests.map((r, i) => {
                const st = tracking[r._id];
                return (
                  <div key={r._id} className="card fu" style={{ ...glass, padding:"24px 26px", animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
                    {/* Card header */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {r.pickupLocation} → {r.deliveryLocation}
                        </div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", display:"flex", gap:12 }}>
                          <span>⚖️ {r.weight || "?"} kg</span>
                          {r.date && <span>📅 {new Date(r.date).toLocaleDateString("fr-FR")}</span>}
                          {r.isSensitive === "oui" && <span style={{ color:"#f87171" }}>⚠️ Fragile</span>}
                        </div>
                      </div>
                      <span style={{
                        flexShrink:0, marginLeft:12, fontSize:10, fontWeight:600, padding:"3px 10px", borderRadius:20,
                        background: st ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
                        color: st ? "#4ade80" : "rgba(255,255,255,0.35)",
                        border: `1px solid ${st ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                      }}>
                        {st ? "✓ Mise à jour" : "En attente"}
                      </span>
                    </div>

                    {/* Location box */}
                    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"14px 16px", marginBottom: isTransporteur ? 14 : 0 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                        <Ic d={D.pin} size={12} color="rgba(255,255,255,0.3)" />
                        Dernière localisation
                      </div>
                      <div style={{ fontSize:14, fontWeight:600, color: st ? "#e2e8f0" : "rgba(255,255,255,0.25)" }}>
                        {st?.location || "Aucune localisation pour le moment"}
                      </div>
                      {st?.updatedAt && (
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:6 }}>
                          Mis à jour le {new Date(st.updatedAt).toLocaleString("fr-FR")}
                        </div>
                      )}
                    </div>

                    {/* Transporteur update input */}
                    {isTransporteur && (
                      <div style={{ display:"flex", gap:10 }}>
                        <input type="text" value={locationInputs[r._id] || ""} onChange={e => setLocationInputs(prev => ({ ...prev, [r._id]: e.target.value }))}
                          placeholder="Ex: Sousse, Km 12 - Autoroute A1"
                          style={{ flex:1, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#f1f5f9", fontSize:12, outline:"none" }}
                        />
                        <button onClick={() => saveTracking(r)} style={{ padding:"10px 16px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${accent.from},${accent.to})`, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", boxShadow:`0 4px 10px ${accent.glow}` }}>
                          Mettre à jour
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
