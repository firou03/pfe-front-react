import React from "react";
import { Link } from "react-router-dom";
import ChatComponent from "components/Chat/ChatComponent.js";

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
};
const glass = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" };

export default function ChatPage() {
  const currentUser = React.useMemo(() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }, []);
  const isTransporteur = currentUser?.role === "transporteur";
  const accent = isTransporteur
    ? { from:"#7c3aed", to:"#6d28d9", glow:"rgba(124,58,237,0.4)", active:"rgba(124,58,237,0.18)", activeBorder:"rgba(124,58,237,0.3)", icon:"#a78bfa" }
    : { from:"#3b82f6", to:"#2563eb", glow:"rgba(59,130,246,0.4)", active:"rgba(59,130,246,0.18)", activeBorder:"rgba(59,130,246,0.25)", icon:"#60a5fa" };

  const clientNav = [
    { label:"Dashboard",        to:"/dashboard/client",  icon:D.dash,  active:false },
    { label:"Nouvelle demande", to:"/client",             icon:D.plus,  active:false },
    { label:"Tracking",         to:"/tracking",           icon:D.map,   active:false },
    { label:"Messagerie",       to:"/chat",               icon:D.chat,  active:true  },
    { label:"Mon Profil",       to:"/profile/client",     icon:D.user,  active:false },
  ];
  const transporteurNav = [
    { label:"Dashboard",        to:"/dashboard/transporteur", icon:D.dash,  active:false },
    { label:"Demandes dispo.",  to:"/requests",               icon:D.list,  active:false },
    { label:"Mes demandes",     to:"/mes-requests",           icon:D.check, active:false },
    { label:"Tracking",         to:"/tracking",               icon:D.map,   active:false },
    { label:"Messagerie",       to:"/chat",                   icon:D.chat,  active:true  },
    { label:"Mon Profil",       to:"/profile/transporteur",   icon:D.user,  active:false },
  ];
  const navItems = isTransporteur ? transporteurNav : clientNav;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fadeUp 0.4s ease forwards; }
        .nl:hover { background:rgba(255,255,255,0.09) !important; }
        .nl { transition:background 0.15s; }
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
              {(currentUser?.name || currentUser?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser?.name || "Utilisateur"}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser?.email || ""}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft:240, flex:1, padding:"36px 40px", display:"flex", flexDirection:"column" }}>
          <div style={{ marginBottom:28 }} className="fu">
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Communication</div>
            <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>Messagerie</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>Communiquez avec vos clients et transporteurs</p>
          </div>

          <div style={{ ...glass, flex:1, padding:"24px", animation:"fadeUp 0.4s ease 0.1s both" }}>
            <ChatComponent currentUser={currentUser} />
          </div>
        </main>
      </div>
    </>
  );
}
