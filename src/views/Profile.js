import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserById } from "service/restApiUser";

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
  edit:  "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  save:  "M5 13l4 4L19 7",
  warn:  "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
};
const glass = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" };

export default function Profile() {
  const { userId } = useParams();
  const safeParseUser = () => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } };
  const currentUser = safeParseUser();
  const [user, setUser] = useState(currentUser);
  const [loading, setLoading] = useState(!!userId);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  const isOtherProfile = userId && userId !== currentUser?._id;

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    preference: "",
  });

  useEffect(() => {
    if (isOtherProfile) {
      setLoading(true);
      getUserById(userId)
        .then(res => {
          const userData = res.data;
          setUser(userData);
          setFormData({
            phone: userData?.phone || userData?.telephone || "",
            address: userData?.address || userData?.adresse || "",
            city: userData?.city || userData?.ville || "",
            postalCode: userData?.postalCode || userData?.zipCode || "",
            preference: userData?.preference || "",
          });
        })
        .catch(err => {
          console.error("Error fetching user:", err);
          alert("Erreur lors du chargement du profil.");
        })
        .finally(() => setLoading(false));
    } else {
      setUser(currentUser);
      setFormData({
        phone: currentUser?.phone || currentUser?.telephone || "",
        address: currentUser?.address || currentUser?.adresse || "",
        city: currentUser?.city || currentUser?.ville || "",
        postalCode: currentUser?.postalCode || currentUser?.zipCode || "",
        preference: currentUser?.preference || "",
      });
      setLoading(false);
    }
  }, [userId, isOtherProfile, currentUser]);

  const role = user?.role || "client";
  const isTransporteur = role === "transporteur";
  const fullName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Utilisateur";
  const isProfileIncomplete = !isOtherProfile && (!formData.phone || !formData.address || !formData.city || !formData.postalCode || !formData.preference);

  useEffect(() => { setShowNotification(isProfileIncomplete); }, [isProfileIncomplete]);

  const appRole = currentUser?.role || "client";
  const isAppTransporteur = appRole === "transporteur";
  const accent = isAppTransporteur
    ? { from:"#7c3aed", to:"#6d28d9", glow:"rgba(124,58,237,0.4)", active:"rgba(124,58,237,0.18)", activeBorder:"rgba(124,58,237,0.3)", icon:"#a78bfa" }
    : { from:"#3b82f6", to:"#2563eb", glow:"rgba(59,130,246,0.4)", active:"rgba(59,130,246,0.18)", activeBorder:"rgba(59,130,246,0.25)", icon:"#60a5fa" };

  const clientNav = [
    { label:"Dashboard",        to:"/dashboard/client",  icon:D.dash,  active:false },
    { label:"Nouvelle demande", to:"/client",             icon:D.plus,  active:false },
    { label:"Tracking",         to:"/tracking",           icon:D.map,   active:false },
    { label:"Messagerie",       to:"/chat",               icon:D.chat,  active:false },
    { label:"Mon Profil",       to:"/profile/client",     icon:D.user,  active:true  },
  ];
  const transporteurNav = [
    { label:"Dashboard",        to:"/dashboard/transporteur", icon:D.dash,  active:false },
    { label:"Demandes dispo.",  to:"/requests",               icon:D.list,  active:false },
    { label:"Mes demandes",     to:"/mes-requests",           icon:D.check, active:false },
    { label:"Tracking",         to:"/tracking",               icon:D.map,   active:false },
    { label:"Messagerie",       to:"/chat",                   icon:D.chat,  active:false },
    { label:"Mon Profil",       to:"/profile/transporteur",   icon:D.user,  active:true  },
  ];
  const navItems = isTransporteur ? transporteurNav : clientNav;

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    const updated = { ...user, ...formData };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setIsEditing(false);
    setShowNotification(false);
    alert("Profil mis à jour avec succès !");
  };

  const handleCancel = () => {
    setFormData({ phone: user?.phone||user?.telephone||"", address: user?.address||user?.adresse||"", city: user?.city||user?.ville||"", postalCode: user?.postalCode||user?.zipCode||"", preference: user?.preference||"" });
    setIsEditing(false);
  };

  const editableFields = [
    { name:"phone",      label:"Téléphone",                    type:"text",   ph:"Ex: +216 20 123 456" },
    { name:"address",    label:"Adresse",                      type:"text",   ph:"Votre adresse complète" },
    { name:"city",       label:"Ville",                        type:"text",   ph:"Votre ville" },
    { name:"postalCode", label:"Code postal",                  type:"text",   ph:"Ex: 1000" },
    { name:"preference", label:"Préférence de transport",      type:"select", options:["Standard","Express","Économique","Urgent"] },
  ];

  const infoFields = [
    { label:"Nom complet",   value:fullName,              editable:false },
    { label:"Email",         value:user?.email,           editable:false },
    { label:"Téléphone",     value:formData.phone,        editable:true, field:"phone"      },
    { label:"Adresse",       value:formData.address,      editable:true, field:"address"    },
    { label:"Ville",         value:formData.city,         editable:true, field:"city"       },
    { label:"Code postal",   value:formData.postalCode,   editable:true, field:"postalCode" },
    { label: isTransporteur ? "Type de véhicule"  : "Type de compte",
      value: isTransporteur ? user?.vehicleType||user?.vehicule||"—" : "Client", editable:false },
    { label: isTransporteur ? "Capacité (kg)" : "Préférence de transport",
      value: isTransporteur ? user?.capacity||user?.capacite||"—" : formData.preference,
      editable:!isTransporteur, field:"preference" },
  ];

  const inp = { width:"100%", padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", color:"#f1f5f9", fontSize:13, outline:"none" };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp 0.4s ease forwards; }
        .nl:hover { background:rgba(255,255,255,0.09) !important; }
        .nl { transition:background 0.15s; }
        input::placeholder, select { color:rgba(255,255,255,0.25); }
        select option { background:#1e293b; color:#f1f5f9; }
      `}</style>

      {/* Incomplete profile toast */}
      {showNotification && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:14, padding:"14px 18px", maxWidth:320, backdropFilter:"blur(20px)", display:"flex", gap:12, alignItems:"flex-start" }}>
          <Ic d={D.warn} size={18} color="#fbbf24" sw={2} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#fbbf24", marginBottom:3 }}>Profil incomplet</div>
            <div style={{ fontSize:12, color:"rgba(251,191,36,0.7)", lineHeight:1.5 }}>Veuillez compléter vos informations pour une meilleure expérience.</div>
          </div>
          <button onClick={() => setShowNotification(false)} style={{ background:"none", border:"none", color:"rgba(251,191,36,0.5)", cursor:"pointer", fontSize:16, lineHeight:1, padding:0 }}>✕</button>
        </div>
      )}

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

          {/* Header */}
          <div style={{ marginBottom:32 }} className="fu">
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>
              {isOtherProfile ? "Profil Public" : "Compte"}
            </div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>
              {isOtherProfile ? `Profil de ${fullName}` : "Mon Profil"}
            </h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>
              {isOtherProfile ? "Informations du partenaire de transport" : "Gérez vos informations personnelles"}
            </p>
          </div>

          {loading ? (
             <div style={{ ...glass, padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>Chargement...</div>
          ) : (
          <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:24 }}>

            {/* Avatar card */}
            <div style={{ ...glass, padding:"28px 24px", textAlign:"center", animation:"fadeUp 0.4s ease 0.05s both", alignSelf:"start" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${accent.from},${accent.to})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, margin:"0 auto 16px", boxShadow:`0 8px 24px ${accent.glow}` }}>
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{fullName}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>{user?.email}</div>
              <span style={{ display:"inline-block", padding:"4px 14px", borderRadius:20, fontSize:11, fontWeight:700, background:accent.active, color:accent.icon, border:`1px solid ${accent.activeBorder}` }}>
                {isTransporteur ? "🚚 Transporteur" : "👤 Client"}
              </span>

              {isProfileIncomplete && !isOtherProfile && (
                <div style={{ marginTop:18, padding:"10px 14px", borderRadius:12, background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.2)", fontSize:11, color:"#fbbf24", lineHeight:1.5 }}>
                  ⚠️ Profil incomplet — complétez vos infos
                </div>
              )}

              {!isOtherProfile && (
                <div style={{ marginTop:20, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <Link to={isTransporteur ? "/requests" : "/client"} style={{ display:"block", padding:"10px 0", borderRadius:12, background:`linear-gradient(135deg,${accent.from},${accent.to})`, color:"#fff", textDecoration:"none", fontSize:12, fontWeight:600, boxShadow:`0 4px 10px ${accent.glow}` }}>
                    {isTransporteur ? "Voir les demandes" : "Nouvelle demande"}
                  </Link>
                </div>
              )}
            </div>

            {/* Info card */}
            <div style={{ ...glass, padding:"28px 32px", animation:"fadeUp 0.4s ease 0.12s both" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26, paddingBottom:20, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Coordonnées</h2>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:3 }}>Vos informations de contact</p>
                </div>
                {!isOtherProfile && (!isEditing ? (
                  <button onClick={() => setIsEditing(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, background:`linear-gradient(135deg,${accent.from},${accent.to})`, border:"none", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:`0 4px 10px ${accent.glow}` }}>
                    <Ic d={D.edit} size={13} color="#fff" sw={2} /> Modifier
                  </button>
                ) : (
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={handleSave} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, background:"linear-gradient(135deg,#22c55e,#15803d)", border:"none", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      <Ic d={D.save} size={13} color="#fff" sw={2.5} /> Enregistrer
                    </button>
                    <button onClick={handleCancel} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer" }}>
                      Annuler
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {infoFields.map(item => (
                  <div key={item.label} style={{ background: item.editable && isEditing ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", border: item.editable && isEditing ? `1px solid ${accent.activeBorder}` : "1px solid rgba(255,255,255,0.05)", borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8, display:"flex", alignItems:"center", gap:4 }}>
                      {item.label}
                      {item.editable && !formData[item.field] && <span style={{ color:"#f87171" }}>*</span>}
                    </div>
                    {item.editable && isEditing ? (
                      item.field === "preference" ? (
                        <select name={item.field} value={formData[item.field]} onChange={handleInputChange} style={{ ...inp }}>
                          <option value="">Sélectionner...</option>
                          {["Standard","Express","Économique","Urgent"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type="text" name={item.field} value={formData[item.field]} onChange={handleInputChange}
                          placeholder={editableFields.find(f => f.name === item.field)?.ph} style={inp} />
                      )
                    ) : (
                      <div style={{ fontSize:13, fontWeight:600, color: item.value ? "#e2e8f0" : "rgba(255,255,255,0.25)" }}>
                        {item.value || "Non renseigné"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div style={{ marginTop:14, fontSize:11, color:"rgba(255,255,255,0.3)" }}>
                  <span style={{ color:"#f87171" }}>*</span> Champs obligatoires pour compléter votre profil
                </div>
              )}
            </div>
          </div>
          )}
        </main>
      </div>
    </>
  );
}
