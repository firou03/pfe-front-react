import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../service/restApiUser";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [permisFile, setPermisFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "role" && value !== "transporteur") {
      setPermisFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "transporteur") {
      if (!permisFile) {
        alert("Veuillez joindre une copie de votre permis de conduire (PDF ou image).");
        return;
      }
    }

    try {
      if (formData.role === "transporteur" && permisFile) {
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("email", formData.email);
        fd.append("password", formData.password);
        fd.append("role", formData.role);
        fd.append("permis", permisFile);
        await registerUser(fd);
      } else {
        await registerUser(formData);
      }
      alert("Compte créé ✅");
      window.location.href = "/auth/login";
    } catch (error) {
      console.error(error);
      alert("Erreur inscription ❌");
    }
  };

  return (
    <div className="auth-card">
      <h1>Inscription</h1>
      <p className="auth-sub">Créez votre compte TransportTN</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label className="dash-label" htmlFor="register-name">
            Nom
          </label>
          <input
            id="register-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="dash-input"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="dash-label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="dash-input"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="dash-label" htmlFor="register-password">
            Mot de passe
          </label>
          <input
            id="register-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="dash-input"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="dash-label" htmlFor="register-role">
            Rôle
          </label>
          <select
            id="register-role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="dash-input"
          >
            <option value="client">Client</option>
            <option value="transporteur">Transporteur</option>
          </select>
        </div>

        {formData.role === "transporteur" && (
          <div style={{ marginBottom: 16 }}>
            <label className="dash-label" htmlFor="permis-file">
              Permis de conduire
            </label>
            <input
              id="permis-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setPermisFile(e.target.files?.[0] || null)}
              className="dash-input"
            />
            {permisFile && (
              <p className="dash-date" style={{ marginTop: 8 }}>
                Fichier sélectionné : {permisFile.name}
              </p>
            )}
          </div>
        )}

        <button type="submit" className="auth-btn">
          Créer un compte
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Link to="/auth/forget" className="auth-link">
          Mot de passe oublié ?
        </Link>
        <Link to="/auth/login" className="auth-link">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
