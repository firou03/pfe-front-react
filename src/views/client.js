import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createTransportRequest } from "service/restApiTransport";

/* ── Leaflet Map ── */
function LeafletMap({ onPick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const initMap = useCallback(() => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([33.8869, 9.5375], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    map.on("click", (e) => onPick(e.latlng));
    mapInstanceRef.current = map;
  }, [onPick]);
  useEffect(() => {
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else { initMap(); }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [initMap]);
  return <div ref={mapRef} style={{ height: 280, width: "100%", borderRadius: 12 }} />;
}

/* ── Icons ── */
const Ic = ({ d, size = 18, color = "#fff", sw = 1.8 }) => (
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
  pin:   "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  box:   "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  check: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
};

const steps = [
  { label: "Étape 1", title: "Lieux",        icon: D.pin   },
  { label: "Étape 2", title: "Colis",         icon: D.box   },
  { label: "Étape 3", title: "Confirmation",  icon: D.check },
];

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

export default function CardClient() {
  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);
  const isMounted = useRef(true);
  const [step, setStep] = useState(0);
  const [activeMap, setActiveMap] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: "", deliveryLocation: "",
    pickupCoords: null, deliveryCoords: null,
    date: "", weight: "", isSensitive: "non",
  });

  const minDateStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  useEffect(() => () => { isMounted.current = false; }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMapPick = async (latlng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
      const data = await res.json();
      const address = data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      const field = activeMap === "pickup" ? "pickupLocation" : "deliveryLocation";
      const coordField = activeMap === "pickup" ? "pickupCoords" : "deliveryCoords";
      setFormData((prev) => ({ ...prev, [field]: address, [coordField]: latlng }));
    } catch {
      const address = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      const field = activeMap === "pickup" ? "pickupLocation" : "deliveryLocation";
      setFormData((prev) => ({ ...prev, [field]: address }));
    }
    setActiveMap(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        pickupLocation: formData.pickupLocation,
        deliveryLocation: formData.deliveryLocation,
        date: formData.date, weight: formData.weight, isSensitive: formData.isSensitive,
      };
      const res = await createTransportRequest(payload);
      const createdRequest = res?.data?._id ? res.data : {
        ...payload, _id: `local-${Date.now()}`, createdAt: new Date().toISOString(),
        client: { _id: currentUser?._id, email: currentUser?.email, name: currentUser?.name },
      };
      const previous = JSON.parse(localStorage.getItem("clientRequests") || "[]");
      localStorage.setItem("clientRequests", JSON.stringify([createdRequest, ...previous]));
      if (isMounted.current) {
        alert("Demande envoyée avec succès ✅");
        setFormData({ pickupLocation: "", deliveryLocation: "", pickupCoords: null, deliveryCoords: null, date: "", weight: "", isSensitive: "non" });
        setStep(0);
      }
    } catch (err) {
      console.error(err);
      if (isMounted.current) alert("Erreur lors de l'envoi ❌");
    }
  };

  const canNext = () => {
    if (step === 0) return formData.pickupLocation && formData.deliveryLocation;
    if (step === 1) return formData.date && formData.weight;
    return true;
  };

  const navItems = [
    { label: "Dashboard",        to: "/dashboard/client",  icon: D.dash,  active: false },
    { label: "Nouvelle demande", to: "/client",             icon: D.plus,  active: true  },
    { label: "Tracking",         to: "/tracking",           icon: D.map,   active: false },
    { label: "Messagerie",       to: "/chat",               icon: D.chat,  active: false },
    { label: "Mon Profil",       to: "/profile/client",     icon: D.user,  active: false },
  ];

  /* ── input / label shared styles ── */
  const inp = {
    width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 13,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#f1f5f9", outline: "none",
  };
  const lbl = {
    fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8,
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.4s ease forwards; }
        .nl:hover { background: rgba(255,255,255,0.09) !important; }
        .nl { transition: background 0.15s; }
        .step-btn:hover { transform:translateY(-2px); }
        .step-btn { transition: transform 0.2s; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); }
        select { appearance: none; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0f1e 0%,#0f172a 40%,#0d1b2e 100%)", fontFamily:"'Inter',sans-serif", color:"#fff", display:"flex" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          position:"fixed", top:0, left:0, bottom:0, width:240,
          background:"rgba(255,255,255,0.025)", borderRight:"1px solid rgba(255,255,255,0.07)",
          padding:"28px 16px", display:"flex", flexDirection:"column", zIndex:100,
        }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40, paddingLeft:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#3b82f6,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(59,130,246,0.4)" }}>
              <Ic d={D.truck} size={18} />
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>TransportApp</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:1 }}>Client Portal</div>
            </div>
          </div>

          {navItems.map(({ label, to, icon, active }) => (
            <Link key={to} to={to} className="nl" style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
              borderRadius:12, marginBottom:4, textDecoration:"none", fontSize:13,
              fontWeight: active ? 600 : 400,
              color: active ? "#fff" : "rgba(255,255,255,0.45)",
              background: active ? "rgba(59,130,246,0.18)" : "transparent",
              border: active ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
            }}>
              <Ic d={icon} size={16} color={active ? "#60a5fa" : "rgba(255,255,255,0.35)"} />
              {label}
            </Link>
          ))}

          <div style={{ flex:1 }} />

          {/* User card */}
          <div style={{ ...glass, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
              {(currentUser?.name || currentUser?.email || "C").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser?.name || "Client"}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser?.email || ""}</div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ marginLeft:240, flex:1, padding:"36px 40px", minHeight:"100vh" }}>

          {/* Header */}
          <div style={{ marginBottom:32 }} className="fu">
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>
              Nouvelle demande
            </div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Demande de transport</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>Suivez les étapes pour soumettre votre demande</p>
          </div>

          {/* ── Stepper ── */}
          <div style={{ display:"flex", alignItems:"center", marginBottom:36 }} className="fu">
            {steps.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, fontWeight:700, flexShrink:0,
                    background: i === step ? "linear-gradient(135deg,#3b82f6,#2563eb)" : i < step ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)",
                    color: i === step ? "#fff" : i < step ? "#4ade80" : "rgba(255,255,255,0.3)",
                    border: i < step ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
                    boxShadow: i === step ? "0 4px 12px rgba(59,130,246,0.4)" : "none",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color: i === step ? "#60a5fa" : i < step ? "#4ade80" : "rgba(255,255,255,0.35)" }}>{s.title}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width:60, height:1, margin:"0 18px", background: i < step ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Form Card ── */}
          <div style={{ ...glass, padding:"36px 40px", maxWidth:820, animation:"fadeUp 0.45s ease 0.1s both" }}>

            {/* Section title */}
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:30, paddingBottom:22, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ic d={steps[step].icon} size={19} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>
                  {["Choisissez les lieux de transport","Détails du colis","Récapitulatif de votre demande"][step]}
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:3 }}>
                  {["Saisissez les adresses ou cliquez sur la carte","Précisez la date, le poids et la nature du colis","Vérifiez les informations avant d'envoyer"][step]}
                </div>
              </div>
            </div>

            {/* ── STEP 0 ── */}
            {step === 0 && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
                  {[
                    { label:"Lieu de départ", name:"pickupLocation", mapKey:"pickup", ph:"Ex: Tunis, Avenue Habib Bourguiba" },
                    { label:"Lieu de livraison", name:"deliveryLocation", mapKey:"delivery", ph:"Ex: Sfax, Rue de la République" },
                  ].map(({ label, name, mapKey, ph }) => (
                    <div key={name}>
                      <label style={lbl}>{label}</label>
                      <div style={{ display:"flex", gap:10 }}>
                        <input type="text" name={name} value={formData[name]} onChange={handleChange} placeholder={ph} style={{ ...inp, flex:1 }} />
                        <button onClick={() => setActiveMap(activeMap === mapKey ? null : mapKey)} style={{
                          width:46, borderRadius:10, border:"none", cursor:"pointer", flexShrink:0,
                          background: activeMap === mapKey ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.15)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          <Ic d={D.map} size={16} color="#60a5fa" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {activeMap && (
                  <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid rgba(59,130,246,0.2)", marginTop:8 }}>
                    <div style={{ padding:"10px 16px", fontSize:12, color:"#60a5fa", background:"rgba(59,130,246,0.08)" }}>
                      Cliquez sur la carte pour sélectionner {activeMap === "pickup" ? "le lieu de départ" : "le lieu de livraison"}
                    </div>
                    <LeafletMap onPick={handleMapPick} />
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
                  <div>
                    <label style={lbl}>Date de livraison souhaitée</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} style={inp} min={minDateStr} />
                  </div>
                  <div>
                    <label style={lbl}>Poids du colis (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} min="1" placeholder="Ex: 25" style={inp} />
                  </div>
                </div>
                <div>
                  <label style={{ ...lbl, marginBottom:14 }}>Type de colis</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    {[
                      { val:"non", name:"Non sensible", desc:"Colis standard, aucune précaution requise", color:"#4ade80", bg:"rgba(34,197,94,0.12)", border:"rgba(34,197,94,0.25)" },
                      { val:"oui", name:"Sensible / Fragile", desc:"Manipulation avec soin, emballage spécial", color:"#f87171", bg:"rgba(239,68,68,0.12)", border:"rgba(239,68,68,0.25)" },
                    ].map(({ val, name, desc, color, bg, border }) => {
                      const active = formData.isSensitive === val;
                      return (
                        <button key={val} onClick={() => setFormData({ ...formData, isSensitive: val })} style={{
                          padding:"20px 22px", borderRadius:14, cursor:"pointer", textAlign:"left",
                          background: active ? bg : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? border : "rgba(255,255,255,0.08)"}`,
                          transition:"all 0.2s",
                        }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background: active ? color : "rgba(255,255,255,0.2)", marginBottom:12 }} />
                          <div style={{ fontSize:13, fontWeight:600, color: active ? color : "rgba(255,255,255,0.6)", marginBottom:5 }}>{name}</div>
                          <div style={{ fontSize:11, color: active ? `${color}99` : "rgba(255,255,255,0.3)", lineHeight:1.5 }}>{desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
                {[
                  { key:"Lieu de départ",    val: formData.pickupLocation },
                  { key:"Lieu de livraison", val: formData.deliveryLocation },
                  { key:"Date de livraison", val: formData.date },
                  { key:"Poids",             val: `${formData.weight} kg` },
                  { key:"Type de colis",     val: formData.isSensitive === "oui" ? "Sensible / Fragile" : "Non sensible",
                    badge: true, color: formData.isSensitive === "oui" ? "#f87171" : "#4ade80",
                    bg: formData.isSensitive === "oui" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)" },
                ].map(({ key, val, badge, color, bg }, i, arr) => (
                  <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 22px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{key}</span>
                    {badge ? (
                      <span style={{ fontSize:11, fontWeight:600, color, background:bg, border:`1px solid ${color}44`, padding:"3px 12px", borderRadius:20 }}>{val}</span>
                    ) : (
                      <span style={{ fontSize:13, color:"#e2e8f0", maxWidth:"55%", textAlign:"right" }}>{val}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Navigation ── */}
            <div style={{ display:"flex", gap:14, marginTop:32, paddingTop:24, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{
                  flex:1, padding:13, borderRadius:10, fontSize:13, cursor:"pointer",
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)",
                }}>← Retour</button>
              )}
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canNext()} style={{
                  flex:2, padding:13, borderRadius:10, fontSize:13, fontWeight:600, border:"none",
                  cursor: canNext() ? "pointer" : "not-allowed",
                  background: canNext() ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "rgba(255,255,255,0.05)",
                  color: canNext() ? "#fff" : "rgba(255,255,255,0.25)",
                  boxShadow: canNext() ? "0 4px 14px rgba(59,130,246,0.4)" : "none",
                  transition:"all 0.2s",
                }}>Suivant — {steps[step + 1]?.title} →</button>
              ) : (
                <button onClick={handleSubmit} style={{
                  flex:2, padding:13, borderRadius:10, fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                  background:"linear-gradient(135deg,#22c55e,#15803d)",
                  color:"#fff", boxShadow:"0 4px 14px rgba(34,197,94,0.4)",
                }}>Envoyer la demande ✓</button>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}