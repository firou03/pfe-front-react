/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";

export default function Index() {
  return (
    <>
      <IndexNavbar fixed />

      {/* ── HERO ── */}
      <section style={{ background: "#f8fafc", paddingTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px 80px", display: "flex", alignItems: "center", gap: 40 }}>

          {/* Left */}
          <div style={{ flex: 1 }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 12, background: "#e6f1fb", color: "#185FA5", border: "0.5px solid #b5d4f4", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#185FA5", display: "inline-block" }} />
              Plateforme de transport intelligente
            </div>

            <h1 style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.2, color: "#0f172a", marginBottom: 16 }}>
              La livraison en Tunisie,{" "}
              <span style={{ color: "#378ADD" }}>réinventée.</span>
            </h1>

            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Connectez clients et transporteurs en temps réel. Simple, rapide et sécurisé pour toute la Tunisie.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
              <Link to="/auth/register" style={{ padding: "11px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "#378ADD", color: "#fff", textDecoration: "none" }}>
                S'inscrire gratuitement
              </Link>
              <Link to="/auth/login" style={{ padding: "11px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "transparent", border: "0.5px solid #cbd5e1", color: "#475569", textDecoration: "none" }}>
                Se connecter
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { val: "500+", lbl: "Livraisons réussies" },
                { val: "200+", lbl: "Transporteurs actifs" },
                { val: "98%", lbl: "Satisfaction" },
                { val: "24/7", lbl: "Support" },
              ].map((s) => (
                <div key={s.lbl} style={{ flex: 1, background: "#f1f5f9", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: "#0f172a" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: "100%", maxWidth: 420, borderRadius: 16, overflow: "hidden", border: "0.5px solid #e2e8f0" }}>
              <img
                src={require("assets/img/tunisiemaps.png").default}
                alt="Tunisia map"
                style={{ width: "100%", display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: "0.5px", background: "#e2e8f0", margin: "0 40px" }} />

      {/* ── FEATURES ── */}
      <section style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Fonctionnalités</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>Tout ce dont vous avez besoin</div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 40 }}>Une expérience rapide, intelligente et sécurisée.</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: "fas fa-search", title: "Recherche facile", desc: "Trouvez rapidement des offres de transport adaptées à vos besoins." },
              { icon: "fas fa-robot", title: "Matching intelligent", desc: "Notre système utilise l'IA pour proposer les meilleures correspondances." },
              { icon: "fas fa-comments", title: "Communication directe", desc: "Discutez facilement avec les transporteurs et suivez vos demandes." },
              { icon: "fas fa-map-marker-alt", title: "Suivi en temps réel", desc: "Suivez vos colis à chaque étape jusqu'à la livraison finale." },
              { icon: "fas fa-shield-alt", title: "Plateforme sécurisée", desc: "Vos données et transactions sont protégées à tout moment." },
              { icon: "fas fa-star", title: "Avis et notations", desc: "Évaluez vos transporteurs et construisez une relation de confiance." },
            ].map((f) => (
              <div key={f.title} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <i className={f.icon} style={{ fontSize: 16, color: "#185FA5" }} />
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 6 }}>{f.title}</h4>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: "0.5px", background: "#e2e8f0" }} />

      {/* ── ABOUT ── */}
      <section style={{ background: "#f8fafc", borderTop: "0.5px solid #e2e8f0", borderBottom: "0.5px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px", display: "flex", gap: 48, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <img
              alt="transport"
              src="https://images.unsplash.com/photo-1502877338535-766e1452684a"
              style={{ width: "100%", borderRadius: 14, border: "0.5px solid #e2e8f0", display: "block" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>À propos</div>
            <h3 style={{ fontSize: 26, fontWeight: 500, color: "#0f172a", marginBottom: 12 }}>
              Une solution moderne pour vos besoins de transport
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
              Notre plateforme facilite la mise en relation entre clients et transporteurs, avec des outils intelligents pour améliorer l'expérience utilisateur.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
              {["Gestion simple des demandes de transport", "Suivi en temps réel de vos colis", "Plateforme 100% sécurisée", "Système de notation transparent"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#475569" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#eaf3de", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <i className="fas fa-check" style={{ fontSize: 9, color: "#3B6D11" }} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Processus</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>Comment ça marche ?</div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 40 }}>En 4 étapes simples, gérez vos transports efficacement.</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { num: "1", title: "Créez un compte", desc: "Inscrivez-vous en tant que client ou transporteur en quelques minutes." },
              { num: "2", title: "Faites une demande", desc: "Renseignez les lieux, la date et les détails de votre colis." },
              { num: "3", title: "Un transporteur accepte", desc: "Un transporteur disponible prend en charge votre demande." },
              { num: "4", title: "Livraison & notation", desc: "Recevez votre colis et évaluez la qualité du service." },
            ].map((s) => (
              <div key={s.num} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: 14, padding: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#378ADD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#fff", marginBottom: 14 }}>
                  {s.num}
                </div>
                <h4 style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", marginBottom: 6 }}>{s.title}</h4>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAGES PREVIEW ── */}
      <section style={{ background: "#f8fafc", borderTop: "0.5px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Navigation</div>
          <div style={{ fontSize: 26, fontWeight: 500, color: "#0f172a", marginBottom: 40 }}>Accédez à vos pages</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Page de connexion", sub: "Accédez à votre compte", route: "/auth/login", img: require("assets/img/login.jpg").default },
              { label: "Page de profil", sub: "Gérez vos informations", route: "/profile", img: require("assets/img/profile.jpg").default },
              { label: "Landing page", sub: "Découvrez la plateforme", route: "/landing", img: require("assets/img/landing.jpg").default },
            ].map((p) => (
              <Link key={p.label} to={p.route} style={{ textDecoration: "none" }}>
                <div style={{ background: "#ffffff", border: "0.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                  <img src={p.img} alt={p.label} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{p.sub}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "#ffffff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 40px" }}>
          <div style={{ background: "#e6f1fb", border: "0.5px solid #b5d4f4", borderRadius: 20, padding: "48px", textAlign: "center" }}>
            <h2 style={{ fontSize: 26, fontWeight: 500, color: "#0f172a", marginBottom: 10 }}>
              Prêt à commencer ?
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>
              Rejoignez des centaines d'utilisateurs qui font confiance à TransportTN.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link to="/auth/register" style={{ padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "#378ADD", color: "#fff", textDecoration: "none" }}>
                S'inscrire gratuitement
              </Link>
              <Link to="/auth/login" style={{ padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 500, background: "transparent", border: "0.5px solid #94a3b8", color: "#475569", textDecoration: "none" }}>
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}