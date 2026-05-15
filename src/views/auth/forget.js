import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../service/restApiUser";

export default function Forget() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez entrer votre email");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message || "Un lien de réinitialisation a été envoyé !");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Mot de passe oublié</h1>
      <p className="auth-sub">Recevez un lien de réinitialisation par email</p>

      {message && (
        <p className="dash-date" style={{ color: "var(--semantic-delivery)", marginBottom: 12 }}>
          {message}
        </p>
      )}
      {error && (
        <p className="dash-date" style={{ color: "var(--semantic-warning)", marginBottom: 12 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label className="dash-label" htmlFor="forget-email">
            Email
          </label>
          <input
            id="forget-email"
            type="email"
            className="dash-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-btn" disabled={isSubmitting}>
          {isSubmitting ? "Envoi en cours..." : "Réinitialiser"}
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Link to="/auth/login" className="auth-link">
          Se connecter
        </Link>
        <Link to="/auth/register" className="auth-link">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
