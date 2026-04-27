import React, { useState } from "react";
import { createReview } from "service/restApiReview";

const RatingModal = ({ isOpen, onClose, userId, targetUserId, requestId, targetUserName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Veuillez sélectionner une note");
      return;
    }

    setLoading(true);
    try {
      await createReview(targetUserId, requestId, rating, comment);
      alert("Évaluation envoyée avec succès! 🌟");
      setRating(0);
      setComment("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de l'évaluation");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f172a",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 30,
          maxWidth: 500,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: "#fff", marginBottom: 20, fontSize: 20, fontWeight: 700 }}>
          Évaluer {targetUserName || "l'utilisateur"}
        </h2>

        {/* Star Rating */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 10 }}>
            Donnez une note (1-5)
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: rating === star 
                    ? "2px solid #fbbf24" 
                    : "2px solid rgba(255,255,255,0.2)",
                  background: rating === star 
                    ? "rgba(251,191,36,0.2)" 
                    : "transparent",
                  color: rating === star ? "#fbbf24" : "rgba(255,255,255,0.4)",
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {star}⭐
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 8 }}>
            Commentaire (optionnel)
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            style={{
              width: "100%",
              height: 100,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              color: "#fff",
              padding: 12,
              fontFamily: "inherit",
              fontSize: 13,
              resize: "none",
              outline: "none",
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              opacity: loading ? 0.5 : 1,
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            style={{
              flex: 1,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: rating === 0 ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: "#fff",
              cursor: rating === 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Envoi..." : "Envoyer l'évaluation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
