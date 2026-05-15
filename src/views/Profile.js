import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AppPageLayout from "components/dashboard/AppPageLayout";
import { getUserById, updateUser, uploadProfilePicture } from "service/restApiUser";

const Ic = ({ d, size = 16, color = "rgba(255,255,255,0.35)", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const D = {
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  save: "M5 13l4 4L19 7",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

function StarRating({ value, onChange, readonly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <svg key={star} viewBox="0 0 24 24"
            style={{ width: size, height: size, cursor: readonly ? "default" : "pointer", flexShrink: 0 }}
            fill={filled ? "#EF9F27" : "none"}
            stroke={filled ? "#EF9F27" : "var(--dash-text-muted)"}
            strokeWidth="1.5"
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange && onChange(star)}
          >
            <path d={D.star} />
          </svg>
        );
      })}
    </div>
  );
}

export default function Profile() {
  const { userId } = useParams();
  const safeParseUser = () => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } };
  const currentUser = safeParseUser();

  const [user, setUser] = useState(currentUser);
  const [loading, setLoading] = useState(!!userId);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isOtherProfile = userId && userId !== currentUser?._id;

  const [formData, setFormData] = useState({
    phone: "", address: "", city: "", postalCode: "", preference: "",
  });

  useEffect(() => {
    if (isOtherProfile) {
      setLoading(true);
      getUserById(userId)
        .then(res => {
          const userData = res.data.data;
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
          console.error("Profile load error:", err);
          alert("Erreur lors du chargement du profil: " + (err?.response?.data?.error || err?.message || "Erreur inconnue"));
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

  useEffect(() => {
    const targetId = isOtherProfile ? userId : currentUser?._id;
    if (!targetId) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/reviews/user/${targetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setReviewData(data))
      .catch(() => {});
  }, [userId, isOtherProfile, currentUser?._id]);

  const role = user?.role || "client";
  const isTransporteur = role === "transporteur";
  const fullName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Utilisateur";
  const isProfileIncomplete = !isOtherProfile && (!formData.phone || !formData.address || !formData.city || !formData.postalCode || !formData.preference);

  useEffect(() => { setShowNotification(isProfileIncomplete); }, [isProfileIncomplete]);

  const appRole = currentUser?.role || "client";
  const isAppTransporteur = appRole === "transporteur";
  const accent = isAppTransporteur
    ? { from: "#7c3aed", to: "#6d28d9", glow: "rgba(124,58,237,0.4)", active: "rgba(124,58,237,0.18)", activeBorder: "rgba(124,58,237,0.3)", icon: "#a78bfa" }
    : { from: "#3b82f6", to: "#2563eb", glow: "rgba(59,130,246,0.4)", active: "rgba(59,130,246,0.18)", activeBorder: "rgba(59,130,246,0.25)", icon: "#60a5fa" };

  const handleInputChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      const response = await updateUser(user._id, formData);
      const updated = response.data.data;
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setIsEditing(false);
      setShowNotification(false);
      alert("Profil mis à jour avec succès !");
    } catch {
      alert("Erreur lors de la mise à jour du profil.");
    }
  };

  const handleCancel = () => {
    setFormData({
      phone: user?.phone || user?.telephone || "",
      address: user?.address || user?.adresse || "",
      city: user?.city || user?.ville || "",
      postalCode: user?.postalCode || user?.zipCode || "",
      preference: user?.preference || "",
    });
    setIsEditing(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePictureFile) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    try {
      setUploading(true);
      const response = await uploadProfilePicture(user._id, profilePictureFile);
      const updated = response.data.data;
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setProfilePictureFile(null);
      setPreviewUrl(null);
      alert("Photo de profil mise à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors du upload:", error);
      alert("Erreur lors de la mise à jour de la photo de profil.");
    } finally {
      setUploading(false);
    }
  };

  const infoFields = [
    { label: "Nom complet", value: fullName, editable: false },
    { label: "Email", value: user?.email, editable: false },
    { label: "Téléphone", value: formData.phone, editable: true, field: "phone", ph: "Ex: +216 20 123 456", type: "text" },
    { label: "Adresse", value: formData.address, editable: true, field: "address", ph: "Votre adresse complète", type: "text" },
    { label: "Ville", value: formData.city, editable: true, field: "city", ph: "Votre ville", type: "text" },
    { label: "Code postal", value: formData.postalCode, editable: true, field: "postalCode", ph: "Ex: 1000", type: "text" },
    {
      label: isTransporteur ? "Type de véhicule" : "Type de compte",
      value: isTransporteur ? user?.vehicleType || user?.vehicule || "—" : "Client",
      editable: false,
    },
    {
      label: isTransporteur ? "Capacité (kg)" : "Préférence de transport",
      value: isTransporteur ? user?.capacity || user?.capacite || "—" : formData.preference,
      editable: !isTransporteur, field: "preference", type: "select",
    },
  ];

  const starDist = reviewData?.reviews
    ? [5, 4, 3, 2, 1].map(s => ({
        star: s,
        count: reviewData.reviews.filter(r => r.rating === s).length,
      }))
    : [];

  return (
    <>
      {showNotification && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 14, padding: "14px 18px", maxWidth: 320, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Ic d={D.warn} size={18} color="#fbbf24" sw={2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 3 }}>Profil incomplet</div>
            <div style={{ fontSize: 12, color: "rgba(251,191,36,0.7)", lineHeight: 1.5 }}>Veuillez compléter vos informations pour une meilleure expérience.</div>
          </div>
          <button type="button" onClick={() => setShowNotification(false)} style={{ background: "none", border: "none", color: "rgba(251,191,36,0.5)", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}

      <AppPageLayout
        sectionLabel={isOtherProfile ? "Profil Public" : "Compte"}
        title={isOtherProfile ? `Profil de ${fullName}` : "Mon Profil"}
        subtitle={isOtherProfile ? "Informations du partenaire de transport" : "Gérez vos informations personnelles"}
      >
        {loading ? (
          <div className="dash-panel" style={{ padding: 40, textAlign: "center", color: "var(--dash-text-muted)" }}>
            Chargement...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
              <div className="dash-panel" style={{ padding: "28px 24px", textAlign: "center" }}>
                <div style={{ position: "relative", width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${accent.from},${accent.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, margin: "0 auto 16px", boxShadow: `0 8px 24px ${accent.glow}`, overflow: "hidden", color: "#fff" }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : user?.user_image ? (
                    <img src={`http://localhost:5000/images/${user.user_image}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    fullName.charAt(0).toUpperCase()
                  )}
                </div>

                {!isOtherProfile && (
                  <div style={{ marginBottom: 16 }}>
                    <input
                      type="file"
                      id="profilePictureInput"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("profilePictureInput").click()}
                      className="dash-btn-primary"
                      style={{ width: "100%", marginBottom: profilePictureFile ? 8 : 0 }}
                    >
                      📷 Changer la photo
                    </button>

                    {profilePictureFile && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={handleUploadProfilePicture}
                          disabled={uploading}
                          className="dash-btn-primary"
                          style={{ flex: 1, opacity: uploading ? 0.6 : 1, cursor: uploading ? "not-allowed" : "pointer" }}
                        >
                          {uploading ? "Upload..." : "✓ Confirmer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePictureFile(null);
                            setPreviewUrl(null);
                            document.getElementById("profilePictureInput").value = "";
                          }}
                          className="dash-btn-ghost"
                          style={{ flex: 1 }}
                        >
                          ✕ Annuler
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text)", marginBottom: 4 }}>{fullName}</div>
                <div className="dash-date" style={{ marginBottom: 16 }}>{user?.email}</div>
                <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: accent.active, color: accent.icon, border: `1px solid ${accent.activeBorder}` }}>
                  {isTransporteur ? "Transporteur" : "Client"}
                </span>

                {reviewData && reviewData.total > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--dash-border)" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#EF9F27", lineHeight: 1 }}>
                      {reviewData.average}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}>
                      <StarRating value={Math.round(reviewData.average)} readonly size={16} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--dash-text-muted)" }}>
                      {reviewData.total} avis reçu{reviewData.total > 1 ? "s" : ""}
                    </div>
                  </div>
                )}

                {isProfileIncomplete && !isOtherProfile && (
                  <div style={{ marginTop: 18, padding: "10px 14px", borderRadius: 12, background: "var(--semantic-warning-bg)", border: "1px solid var(--semantic-warning)", fontSize: 11, color: "var(--semantic-warning)", lineHeight: 1.5 }}>
                    Profil incomplet — complétez vos infos
                  </div>
                )}

                {!isOtherProfile && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--dash-border-subtle)" }}>
                    <Link to={isTransporteur ? "/requests" : "/client"} className="dash-btn-primary" style={{ display: "flex", width: "100%", justifyContent: "center", textAlign: "center" }}>
                      {isTransporteur ? "Voir les demandes" : "Nouvelle demande"}
                    </Link>
                  </div>
                )}
              </div>

              <div className="dash-panel" style={{ padding: "28px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26, paddingBottom: 20, borderBottom: "1px solid var(--dash-border)" }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--dash-text)" }}>Coordonnées</h2>
                    <p className="dash-date" style={{ marginTop: 3 }}>Vos informations de contact</p>
                  </div>
                  {!isOtherProfile && (!isEditing ? (
                    <button type="button" onClick={() => setIsEditing(true)} className="dash-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                      <Ic d={D.edit} size={13} color="#fff" sw={2} /> Modifier
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="button" onClick={handleSave} className="dash-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#22c55e,#15803d)", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}>
                        <Ic d={D.save} size={13} color="#fff" sw={2.5} /> Enregistrer
                      </button>
                      <button type="button" onClick={handleCancel} className="dash-btn-ghost">
                        Annuler
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {infoFields.map(item => (
                    <div
                      key={item.label}
                      style={{
                        background: item.editable && isEditing ? "var(--dash-hover)" : "var(--dash-bg)",
                        border: item.editable && isEditing ? `1px solid ${accent.activeBorder}` : "1px solid var(--dash-border-subtle)",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <div className="dash-label" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                        {item.label}
                        {item.editable && item.field && !formData[item.field] && <span style={{ color: "#f87171" }}>*</span>}
                      </div>
                      {item.editable && isEditing ? (
                        item.type === "select" ? (
                          <select name={item.field} value={formData[item.field]} onChange={handleInputChange} className="dash-select">
                            <option value="">Sélectionner...</option>
                            {["Standard", "Express", "Économique", "Urgent"].map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type="text" name={item.field} value={formData[item.field]}
                            onChange={handleInputChange} placeholder={item.ph} className="dash-input" />
                        )
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 600, color: item.value ? "var(--dash-text)" : "var(--dash-text-muted)" }}>
                          {item.value || "Non renseigné"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div style={{ marginTop: 14, fontSize: 11, color: "var(--dash-text-muted)" }}>
                    <span style={{ color: "#f87171" }}>*</span> Champs obligatoires pour compléter votre profil
                  </div>
                )}
              </div>
            </div>

            {reviewData && (
              <div className="dash-panel" style={{ padding: "28px 32px" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 24px", paddingBottom: 16, borderBottom: "1px solid var(--dash-border)", color: "var(--dash-text)" }}>
                  Évaluations reçues
                </h2>

                {reviewData.total === 0 ? (
                  <div className="dash-empty" style={{ padding: "20px 0" }}>
                    Aucun avis reçu pour le moment.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 52, fontWeight: 800, color: "#EF9F27", lineHeight: 1 }}>
                        {reviewData.average}
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 6px" }}>
                        <StarRating value={Math.round(reviewData.average)} readonly size={22} />
                      </div>
                      <div style={{ fontSize: 13, color: "var(--dash-text-muted)" }}>
                        {reviewData.total} avis
                      </div>

                      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                        {starDist.map(({ star, count }) => {
                          const pct = reviewData.total > 0 ? (count / reviewData.total) * 100 : 0;
                          return (
                            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 11, color: "var(--dash-text-muted)", width: 8, textAlign: "right" }}>{star}</span>
                              <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: "#EF9F27", flexShrink: 0 }}>
                                <path d={D.star} />
                              </svg>
                              <div style={{ flex: 1, height: 4, background: "var(--dash-border-subtle)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "#EF9F27", borderRadius: 2, transition: "width 0.5s" }} />
                              </div>
                              <span style={{ fontSize: 11, color: "var(--dash-text-muted)", width: 16 }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 360, overflowY: "auto" }}>
                      {reviewData.reviews.map((review) => (
                        <div key={review._id} className="dash-panel" style={{ padding: "14px 16px", boxShadow: "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: accent.active, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: accent.icon, flexShrink: 0 }}>
                                {review.ratedBy?.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)" }}>
                                  {review.ratedBy?.name || "Anonyme"}
                                </div>
                                <div className="dash-date">
                                  {review.ratedBy?.role === "transporteur" ? "Transporteur" : "Client"}
                                </div>
                              </div>
                            </div>
                            <StarRating value={review.rating} readonly size={14} />
                          </div>

                          {review.comment && (
                            <div style={{ fontSize: 12, color: "var(--dash-text-secondary)", marginTop: 8, fontStyle: "italic", padding: "8px 10px", background: "var(--dash-hover)", borderRadius: 8 }}>
                              &quot;{review.comment}&quot;
                            </div>
                          )}

                          {review.transportRequest && (
                            <div className="dash-route" style={{ fontSize: 12, marginTop: 4 }}>
                              {review.transportRequest.pickupLocation} → {review.transportRequest.deliveryLocation}
                            </div>
                          )}
                          <div className="dash-date" style={{ marginTop: 4 }}>
                            {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </AppPageLayout>
    </>
  );
}
