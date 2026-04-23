import React from "react";

const D = {
  user:  "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  mail:  "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h3l3 3v4h-6m0 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0z",
  close: "M6 18L18 6M6 6l12 12",
  star:  "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  shield:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

const Ic = ({ d, size = 16, color = "rgba(255,255,255,0.5)", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function UserProfileModal({ user, onClose, isTransporteur }) {
  if (!user) return null;

  // Color scheme based on their role
  const isOtherTransporteur = user.role === "transporteur";
  const accent = isOtherTransporteur
    ? { from: "#7c3aed", to: "#6d28d9", glow: "rgba(124,58,237,0.5)", light: "#a78bfa" }
    : { from: "#3b82f6", to: "#2563eb", glow: "rgba(59,130,246,0.5)", light: "#60a5fa" };

  const roleLabel = isOtherTransporteur ? "Transporteur" : "Client";
  const initial  = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @keyframes pmFadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .pm-card { animation: pmFadeIn 0.25s ease forwards; }
        .pm-close:hover { background: rgba(255,255,255,0.12) !important; }
        .pm-close { transition: background 0.15s; }
        .pm-row:hover { background: rgba(255,255,255,0.05) !important; }
        .pm-row { transition: background 0.15s; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        }}
      />

      {/* Modal card */}
      <div className="pm-card" style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 1000,
        width: 380,
        background: "linear-gradient(145deg,rgba(15,23,42,0.98),rgba(10,15,30,0.98))",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px ${accent.glow}`,
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* Hero gradient strip */}
        <div style={{
          height: 90,
          background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
          position: "relative",
        }}>
          {/* Subtle pattern */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
          }} />
          {/* Close button */}
          <button className="pm-close" onClick={onClose} style={{
            position: "absolute", top: 12, right: 12,
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ic d={D.close} size={14} color="#fff" sw={2.5} />
          </button>
        </div>

        {/* Avatar (overlapping the hero) */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: -36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
            border: "4px solid rgba(10,15,30,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#fff",
            boxShadow: `0 8px 24px ${accent.glow}`,
          }}>
            {initial}
          </div>
        </div>

        {/* Name + role */}
        <div style={{ textAlign: "center", padding: "12px 24px 0" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            {user.name || "Utilisateur"}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
            background: `rgba(${isOtherTransporteur ? "124,58,237" : "59,130,246"},0.15)`,
            border: `1px solid rgba(${isOtherTransporteur ? "124,58,237" : "59,130,246"},0.3)`,
            borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: accent.light,
          }}>
            <Ic d={isOtherTransporteur ? D.truck : D.shield} size={12} color={accent.light} sw={2.2} />
            {roleLabel}
          </div>
        </div>

        {/* Info rows */}
        <div style={{ padding: "20px 24px 8px" }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            overflow: "hidden",
          }}>
            {/* Email */}
            {user.email && (
              <div className="pm-row" style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `rgba(${isOtherTransporteur ? "124,58,237" : "59,130,246"},0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ic d={D.mail} size={14} color={accent.light} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
                    Email
                  </div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                    {user.email}
                  </div>
                </div>
              </div>
            )}

            {/* Phone */}
            {user.phone && (
              <div className="pm-row" style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: `rgba(${isOtherTransporteur ? "124,58,237" : "59,130,246"},0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ic d={D.phone} size={14} color={accent.light} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
                    Téléphone
                  </div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                    {user.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Role info */}
            <div className="pm-row" style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "13px 16px",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: `rgba(${isOtherTransporteur ? "124,58,237" : "59,130,246"},0.12)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic d={isOtherTransporteur ? D.truck : D.user} size={14} color={accent.light} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 2 }}>
                  Rôle
                </div>
                <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                  {roleLabel} sur TransportApp
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating stars (decorative) */}
        {isOtherTransporteur && (
          <div style={{ textAlign: "center", padding: "8px 24px 4px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {[1,2,3,4,5].map(i => (
                <Ic key={i} d={D.star} size={14} color={i <= 4 ? "#fbbf24" : "rgba(255,255,255,0.2)"} sw={0} />
              ))}
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>4.8 / 5</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "16px 24px 24px" }}>
          <button onClick={onClose} style={{
            width: "100%", padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
            border: "none", color: "#fff", cursor: "pointer",
            boxShadow: `0 4px 14px ${accent.glow}`,
            transition: "opacity 0.2s",
          }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
}
