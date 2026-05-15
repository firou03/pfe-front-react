import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { loginUser } from "../../service/restApiUser";

function redirectPathForRole(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "/admin/dashboard";
  if (r === "transporteur") return "/dashboard/transporteur";
  return "/dashboard/client";
}

export default function Login() {
  const history = useHistory();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!token || !raw) return;
      const u = JSON.parse(raw);
      history.replace(redirectPathForRole(u?.role));
    } catch {
      /* ignore */
    }
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser(formData);
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      alert("Connexion réussie ✅");

      const role = String(user?.role || "").toLowerCase();
      let next = redirectPathForRole(user?.role);
      const intended = location.state?.from;
      if (role === "admin" && intended?.pathname?.startsWith("/admin")) {
        next = `${intended.pathname}${intended.search || ""}${intended.hash || ""}`;
      }

      history.push(next);
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || "Erreur connexion ❌";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Connexion</h1>
      <p className="auth-sub">Accédez à votre espace TransportTN</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label className="dash-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="dash-input"
            placeholder="Email"
            autoComplete="email"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="dash-label" htmlFor="login-password">
            Mot de passe
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="dash-input"
            placeholder="Mot de passe"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-btn" disabled={isSubmitting}>
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Link to="/auth/forget" className="auth-link">Mot de passe oublié ?</Link>
        <Link to="/auth/register" className="auth-link">Créer un compte</Link>
      </div>
    </div>
  );
}
