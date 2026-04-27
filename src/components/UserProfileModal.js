import React from "react";
import { Link } from "react-router-dom";

const Ic = ({ d, size = 16, color = "rgba(255,255,255,0.35)", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const D = {
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
  location: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  close: "M6 18L18 6M6 6l12 12",
};

export default function UserProfileModal({ user, isOpen, onClose, title = "Profil utilisateur" }) {
  if (!isOpen || !user) return null;

  const getAvatarUrl = () => {
    if (user?.user_image) {
      return `http://localhost:5000/images/${user.user_image}`;
    }
    return null;
  };

  const fullName = user?.name || "Utilisateur";
  const initials = fullName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          maxWidth: 500,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic d={D.close} size={20} color="rgba(255,255,255,0.5)" sw={2} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px 24px" }}>
          {/* Avatar */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
              }}
            >
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt={fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 40, fontWeight: 800 }}>{initials}</span>
              )}
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>
              {fullName}
            </h3>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(59, 130, 246, 0.2)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              {user?.role === "transporteur" ? "Transporteur" : "Client"}
            </span>
          </div>

          {/* Rating (if transporteur) */}
          {user?.role === "transporteur" && user?.averageRating !== undefined && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "16px",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    viewBox="0 0 24 24"
                    style={{
                      width: 18,
                      height: 18,
                      margin: "0 2px",
                      fill: star <= Math.round(user.averageRating || 0) ? "#fbbf24" : "none",
                      stroke: star <= Math.round(user.averageRating || 0) ? "#fbbf24" : "rgba(255,255,255,0.2)",
                      strokeWidth: 1.5,
                    }}
                  >
                    <path d={D.star} />
                  </svg>
                ))}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24" }}>
                {user.averageRating?.toFixed(1) || "0.0"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {user.totalReviews || 0} avis{(user.totalReviews || 0) > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {/* Info Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            {user?.email && (
              <div style={{ display: "flex", gap: 12 }}>
                <Ic d={D.mail} size={20} color="#60a5fa" sw={2} />
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                    EMAIL
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{user.email}</div>
                </div>
              </div>
            )}

            {/* Phone */}
            {user?.phone && (
              <div style={{ display: "flex", gap: 12 }}>
                <Ic d={D.phone} size={20} color="#60a5fa" sw={2} />
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                    TÉLÉPHONE
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{user.phone}</div>
                </div>
              </div>
            )}

            {/* Location */}
            {(user?.city || user?.address) && (
              <div style={{ display: "flex", gap: 12 }}>
                <Ic d={D.location} size={20} color="#60a5fa" sw={2} />
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                    LOCALISATION
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {user.address && <div>{user.address}</div>}
                    {user.city && (
                      <div style={{ marginTop: 2 }}>
                        {user.city}
                        {user.postalCode && ` - ${user.postalCode}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              Fermer
            </button>
            <Link
              to={`/profile/${user._id}`}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = "0 6px 20px rgba(59,130,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "0 4px 12px rgba(59,130,246,0.3)";
              }}
            >
              Voir le profil complet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
