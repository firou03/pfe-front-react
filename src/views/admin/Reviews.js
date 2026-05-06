import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Icon = ({ d, size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  check: "M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z",
  x: "M6 18L18 6M6 6l12 12",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const API_URL = "http://localhost:5000/api/reviews";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const isMounted = useRef(true);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios
        .get(`${API_URL}/all`, { headers })
        .catch(() => axios.get(`${API_URL}`, { headers }));

      const list = res.data?.data || res.data?.reviews || res.data || [];
      const arr = Array.isArray(list) ? list : [];
      if (isMounted.current) {
        setReviews(arr);
        setFilteredReviews(arr);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      if (isMounted.current) setError("Impossible de charger les avis depuis le serveur.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchReviews();
    return () => { isMounted.current = false; };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (typeFilter === "all") {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.status === typeFilter));
    }
  }, [typeFilter, reviews]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Supprimer cet avis ?")) return;
    setActionLoading(reviewId);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_URL}/${reviewId}`, { headers });
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  };

  const StarDisplay = ({ rating = 0 }) => (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#fbbf24" : "rgba(255,255,255,0.15)", fontSize: 14 }}>★</span>
      ))}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>{rating}/5</span>
    </span>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0f1e 0%,#0f172a 40%,#0d1b2e 100%)", fontFamily: "'Inter', sans-serif", color: "#fff", padding: "30px 40px" }}>
      <header style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Gestion des Avis</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "8px 0 0 0" }}>
            {loading ? "Chargement..." : `${reviews.length} avis • Note moyenne : ${avgRating}★`}
          </p>
        </div>
        <button
          onClick={fetchReviews}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <Icon d={ICONS.refresh} size={14} color="#fbbf24" /> Actualiser
        </button>
      </header>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: 16, borderRadius: 12, marginBottom: 20, color: "#fca5a5" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats bar */}
      {!loading && reviews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total", value: reviews.length, color: "#e879f9" },
            { label: "5 étoiles", value: reviews.filter(r => r.rating === 5).length, color: "#fbbf24" },
            { label: "Note moy.", value: `${avgRating}★`, color: "#22c55e" },
            { label: "Sans commentaire", value: reviews.filter(r => !r.comment).length, color: "#60a5fa" },
          ].map((s, i) => (
            <div key={i} style={{ ...glass, padding: "14px 18px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "Tous" },
            { key: "pending", label: "En attente" },
            { key: "resolved", label: "Résolus" },
            { key: "rejected", label: "Rejetés" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              style={{
                padding: "8px 16px",
                background: typeFilter === key ? "rgba(232,121,249,0.2)" : "rgba(255,255,255,0.05)",
                border: "1px solid " + (typeFilter === key ? "rgba(232,121,249,0.3)" : "rgba(255,255,255,0.1)"),
                borderRadius: 8,
                color: typeFilter === key ? "#e879f9" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ ...glass, padding: 24 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {["Auteur", "Évalué", "Note", "Commentaire", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 8px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: 24 }}>⏳</div>
                  <div style={{ marginTop: 8 }}>Chargement des avis...</div>
                </td></tr>
              ) : filteredReviews.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: 40 }}>⭐</div>
                  <div style={{ marginTop: 8 }}>Aucun avis trouvé</div>
                </td></tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 600, color: "#e879f9" }}>
                      {review.ratedBy?.name || review.author || "—"}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                      {review.ratedUser?.name || review.recipient || "—"}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <StarDisplay rating={review.rating || 0} />
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: 12, color: "rgba(255,255,255,0.6)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {review.comment || <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.25)" }}>Aucun commentaire</span>}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                        background: review.status === "pending" ? "rgba(245,158,11,0.15)" : review.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(34,211,153,0.15)",
                        color: review.status === "pending" ? "#fbbf24" : review.status === "rejected" ? "#f87171" : "#34d399"
                      }}>
                        {review.status === "pending" ? "En attente" : review.status === "rejected" ? "Rejeté" : "Résolu"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={actionLoading === review._id}
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "5px 10px", borderRadius: 6, cursor: "pointer", color: "#ef4444", fontSize: 11, fontWeight: 600, opacity: actionLoading === review._id ? 0.5 : 1 }}
                      >
                        <Icon d={ICONS.trash} size={12} color="#ef4444" /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
