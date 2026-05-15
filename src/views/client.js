import React, { useState, useRef, useEffect, useCallback } from "react";
import AppPageLayout from "components/dashboard/AppPageLayout";
import { createTransportRequest } from "service/restApiTransport";
import PaymentModal from "components/PaymentModal";

/* ── Leaflet Map ── */
function LeafletMap({ onPick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const initMap = useCallback(() => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([33.8869, 9.5375], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    map.on("click", (e) => onPick(e.latlng));
    mapInstanceRef.current = map;
  }, [onPick]);
  useEffect(() => {
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else { initMap(); }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [initMap]);
  return <div ref={mapRef} style={{ height: 280, width: "100%", borderRadius: 12 }} />;
}

/* ── Icons ── */
const Ic = ({ d, size = 18, color = "#fff", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const D = {
  map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  pin: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  check: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  card: "M3 10a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10zm0 5h18",
};

const steps = [
  { label: "Étape 1", title: "Lieux",        icon: D.pin   },
  { label: "Étape 2", title: "Colis",         icon: D.box   },
  { label: "Étape 3", title: "Confirmation",  icon: D.check },
  { label: "Étape 4", title: "Paiement",      icon: D.card },
];

export default function CardClient() {
  const currentUser = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);
  const isMounted = useRef(true);
  const [step, setStep] = useState(0);
  const [activeMap, setActiveMap] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: "", deliveryLocation: "",
    pickupCoords: null, deliveryCoords: null,
    date: "", weight: "", isSensitive: "non",
  });

  const minDateStr = React.useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0]; // Today
  }, []);

  const maxDateStr = React.useMemo(() => {
    const d = new Date();
    d.setMonth(11);
    d.setDate(31);
    return d.toISOString().split("T")[0]; // End of current year
  }, []);

  useEffect(() => () => { isMounted.current = false; }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMapPick = async (latlng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
      const data = await res.json();
      const address = data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      const field = activeMap === "pickup" ? "pickupLocation" : "deliveryLocation";
      const coordField = activeMap === "pickup" ? "pickupCoords" : "deliveryCoords";
      setFormData((prev) => ({ ...prev, [field]: address, [coordField]: latlng }));
    } catch {
      const address = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      const field = activeMap === "pickup" ? "pickupLocation" : "deliveryLocation";
      setFormData((prev) => ({ ...prev, [field]: address }));
    }
    setActiveMap(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        pickupLocation: formData.pickupLocation,
        deliveryLocation: formData.deliveryLocation,
        date: formData.date, 
        weight: parseInt(formData.weight) || 0, // Ensure weight is a number
        isSensitive: formData.isSensitive,
      };

      if (payload.weight <= 0) {
        alert("Le poids doit être supérieur à 0 kg");
        return;
      }

      const res = await createTransportRequest(payload);
      const createdRequest = res?.data?.request || {
        ...payload, _id: `local-${Date.now()}`, createdAt: new Date().toISOString(),
        client: { _id: currentUser?._id, email: currentUser?.email, name: currentUser?.name },
      };
      
      setCreatedRequestId(createdRequest._id);
      setPaymentModalOpen(true);
      
      const previous = JSON.parse(localStorage.getItem("clientRequests") || "[]");
      localStorage.setItem("clientRequests", JSON.stringify([createdRequest, ...previous]));
    } catch (err) {
      console.error(err);
      if (isMounted.current) alert(err.response?.data?.message || "Erreur lors de l'envoi ❌");
    }
  };

  const handlePaymentSuccess = () => {
    if (isMounted.current) {
      alert("Demande de transport et paiement confirmés ✅");
      setFormData({ pickupLocation: "", deliveryLocation: "", pickupCoords: null, deliveryCoords: null, date: "", weight: "", isSensitive: "non" });
      setStep(0);
      setPaymentModalOpen(false);
      setCreatedRequestId(null);
    }
  };

  const canNext = () => {
    if (step === 0) return formData.pickupLocation && formData.deliveryLocation;
    if (step === 1) return formData.date && formData.weight;
    return true;
  };

  return (
    <>
      <style>{`
        @keyframes card-client-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-client-fadeUp { animation: card-client-fadeUp 0.4s ease forwards; }
        .card-client-fadeUp-delay { animation: card-client-fadeUp 0.45s ease 0.1s both; }
      `}</style>
      <AppPageLayout
        sectionLabel="Client"
        title="Demande de transport"
        subtitle="Suivez les étapes pour soumetter votre demande"
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }} className="card-client-fadeUp">
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    background:
                      i === step
                        ? step === 3
                          ? "linear-gradient(135deg,#fbbf24,#f59e0b)"
                          : "linear-gradient(135deg,#6d28d9,#5b21b6)"
                        : i < step
                          ? "rgba(34,197,94,0.2)"
                          : "var(--dash-hover)",
                    color:
                      i === step
                        ? step === 3
                          ? "#000"
                          : "#fff"
                        : i < step
                          ? "#4ade80"
                          : "var(--dash-text-muted)",
                    border: i < step ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
                    boxShadow:
                      i === step
                        ? step === 3
                          ? "0 4px 12px rgba(251,191,36,0.4)"
                          : "0 4px 12px rgba(109,40,217,0.35)"
                        : "none",
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--dash-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color:
                        i === step
                          ? step === 3
                            ? "#f59e0b"
                            : "var(--semantic-request)"
                          : i < step
                            ? "#4ade80"
                            : "var(--dash-text-muted)",
                    }}
                  >
                    {s.title}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 60,
                    height: 1,
                    margin: "0 18px",
                    background: i < step ? "rgba(34,197,94,0.4)" : "var(--dash-border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="dash-panel card-client-fadeUp-delay" style={{ maxWidth: 820, padding: "36px 40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 30,
              paddingBottom: 22,
              borderBottom: "1px solid var(--dash-border)",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--semantic-request-bg)",
                border: "1px solid var(--dash-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ic d={steps[step].icon} size={19} color="var(--semantic-request)" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text)" }}>
                {["Choisissez les lieux de transport", "Détails du colis", "Récapitulatif de votre demande", "Paiement de votre demande"][step]}
              </div>
              <div style={{ fontSize: 12, color: "var(--dash-text-muted)", marginTop: 3 }}>
                {[
                  "Saisissez les adresses ou cliquez sur la carte",
                  "Précisez la date, le poids et la nature du colis",
                  "Vérifiez les informations avant d'envoyer",
                  "Choisissez votre méthode de paiement et complétez le paiement",
                ][step]}
              </div>
            </div>
          </div>

          {step === 0 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {[
                  { label: "Lieu de départ", name: "pickupLocation", mapKey: "pickup", ph: "Ex: Tunis, Avenue Habib Bourguiba" },
                  { label: "Lieu de livraison", name: "deliveryLocation", mapKey: "delivery", ph: "Ex: Sfax, Rue de la République" },
                ].map(({ label, name, mapKey, ph }) => (
                  <div key={name}>
                    <label className="dash-label" htmlFor={`cc-${name}`}>
                      {label}
                    </label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input
                        id={`cc-${name}`}
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={ph}
                        className="dash-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setActiveMap(activeMap === mapKey ? null : mapKey)}
                        className="dash-btn-ghost"
                        style={{ width: 46, padding: 0, flexShrink: 0, justifyContent: "center" }}
                        aria-label="Choisir sur la carte"
                      >
                        <Ic d={D.map} size={16} color="var(--semantic-request)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {activeMap && (
                <div
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid var(--semantic-tracking-bg)",
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      fontSize: 12,
                      color: "var(--semantic-tracking)",
                      background: "var(--semantic-tracking-bg)",
                    }}
                  >
                    Cliquez sur la carte pour sélectionner {activeMap === "pickup" ? "le lieu de départ" : "le lieu de livraison"}
                  </div>
                  <LeafletMap onPick={handleMapPick} />
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div>
                  <label className="dash-label" htmlFor="cc-date">
                    Date de livraison souhaitée
                  </label>
                  <input
                    id="cc-date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="dash-input"
                    min={minDateStr}
                    max={maxDateStr}
                  />
                </div>
                <div>
                  <label className="dash-label" htmlFor="cc-weight">
                    Poids du colis (kg)
                  </label>
                  <input
                    id="cc-weight"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="1"
                    placeholder="Ex: 25"
                    className="dash-input"
                  />
                </div>
              </div>
              <div>
                <label className="dash-label" style={{ marginBottom: 14 }}>
                  Type de colis
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { val: "non", name: "Non sensible", desc: "Colis standard, aucune précaution requise", color: "#4ade80", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
                    { val: "oui", name: "Sensible / Fragile", desc: "Manipulation avec soin, emballage spécial", color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
                  ].map(({ val, name, desc, color, bg, border }) => {
                    const active = formData.isSensitive === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData({ ...formData, isSensitive: val })}
                        style={{
                          padding: "20px 22px",
                          borderRadius: 14,
                          cursor: "pointer",
                          textAlign: "left",
                          background: active ? bg : "var(--dash-hover)",
                          border: `1px solid ${active ? border : "var(--dash-border)"}`,
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: active ? color : "var(--dash-border)", marginBottom: 12 }} />
                        <div style={{ fontSize: 13, fontWeight: 600, color: active ? color : "var(--dash-text-secondary)", marginBottom: 5 }}>{name}</div>
                        <div style={{ fontSize: 11, color: active ? `${color}99` : "var(--dash-text-muted)", lineHeight: 1.5 }}>{desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="dash-panel" style={{ padding: 0, overflow: "hidden", boxShadow: "none" }}>
              {[
                { key: "Lieu de départ", val: formData.pickupLocation },
                { key: "Lieu de livraison", val: formData.deliveryLocation },
                { key: "Date de livraison", val: formData.date },
                { key: "Poids", val: `${formData.weight} kg` },
                {
                  key: "Type de colis",
                  val: formData.isSensitive === "oui" ? "Sensible / Fragile" : "Non sensible",
                  badge: true,
                  color: formData.isSensitive === "oui" ? "#f87171" : "#4ade80",
                  bg: formData.isSensitive === "oui" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                },
              ].map(({ key, val, badge, color, bg }, i, arr) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 22px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--dash-border-subtle)" : "none",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--dash-text-muted)" }}>{key}</span>
                  {badge ? (
                    <span style={{ fontSize: 11, fontWeight: 600, color, background: bg, border: `1px solid ${color}44`, padding: "3px 12px", borderRadius: 20 }}>{val}</span>
                  ) : (
                    <span style={{ fontSize: 13, color: "var(--dash-text)", maxWidth: "55%", textAlign: "right" }}>{val}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div
              className="dash-panel"
              style={{
                textAlign: "center",
                border: "2px solid var(--semantic-warning)",
                background: "var(--semantic-warning-bg)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>🎉</div>
              <div style={{ fontSize: 14, color: "var(--semantic-warning)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ✓ Demande créée avec succès
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 16,
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Étape de paiement
              </div>
              <div style={{ fontSize: 13, color: "var(--dash-text-secondary)", lineHeight: 1.8, marginBottom: 24 }}>
                Cliquez sur <strong>&quot;Procéder au paiement&quot;</strong> pour finaliser votre demande de transport.
              </div>
              <div
                style={{
                  background: "var(--semantic-warning-bg)",
                  border: "1px solid var(--semantic-warning)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 18 }}>💳</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--semantic-warning)" }}>Paiement Sécurisé</div>
                  <div style={{ fontSize: 11, color: "var(--dash-text-muted)", marginTop: 2 }}>Carte • Virement • Espèces</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 14, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--dash-border)" }}>
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="dash-btn-ghost" style={{ flex: 1 }}>
                ← Retour
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="dash-btn-primary"
                style={{ flex: 2, opacity: canNext() ? 1 : 0.45, cursor: canNext() ? "pointer" : "not-allowed" }}
              >
                Suivant — {steps[step + 1]?.title} →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="dash-btn-primary" style={{ flex: 2 }}>
                Procéder au paiement 💳
              </button>
            )}
          </div>
        </div>

        <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} requestId={createdRequestId} onPaymentSuccess={handlePaymentSuccess} />
      </AppPageLayout>
    </>
  );
}