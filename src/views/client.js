import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createTransportRequest } from "service/restApiTransport";
import Navbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footers/Footer.js";

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
    } else {
      initMap();
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initMap]);

  return <div ref={mapRef} style={{ height: 300, width: "100%", borderRadius: 10 }} />;
}

const steps = [
  { label: "Étape 1", title: "Lieux" },
  { label: "Étape 2", title: "Colis" },
  { label: "Étape 3", title: "Confirmation" },
];

/* ── Icônes SVG ── */
const IconPin = () => (
  <svg viewBox="0 0 24 24" style={ico} fill="none" strokeWidth="1.8">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" style={ico} fill="none" strokeWidth="1.8">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" style={ico} fill="none" strokeWidth="1.8">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const ico = { width: 18, height: 18, stroke: "#60a5fa", fill: "none", strokeWidth: "1.8" };

const sectionIcons = [<IconPin />, <IconBox />, <IconCheck />];
const sectionTitles = [
  { title: "Choisissez les lieux de transport", sub: "Saisissez les adresses ou cliquez sur la carte pour les sélectionner" },
  { title: "Détails du colis", sub: "Précisez la date, le poids et la nature de votre colis" },
  { title: "Récapitulatif de votre demande", sub: "Vérifiez les informations avant d'envoyer" },
];

export default function CardClient() {
  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const isMounted = useRef(true);
  const [step, setStep] = useState(0);
  const [activeMap, setActiveMap] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: "", deliveryLocation: "",
    pickupCoords: null, deliveryCoords: null,
    date: "", weight: "", isSensitive: "non",
  });

  useEffect(() => () => { isMounted.current = false; }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMapPick = async (latlng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
      );
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
        weight: formData.weight,
        isSensitive: formData.isSensitive,
      };
      const res = await createTransportRequest(payload);

      // Fallback local history used by tracking page when no dedicated client endpoint exists.
      const createdRequest = res?.data?._id
        ? res.data
        : {
            ...payload,
            _id: `local-${Date.now()}`,
            createdAt: new Date().toISOString(),
            createdByClientId: currentUser?._id,
            createdByClientEmail: currentUser?.email,
            client: {
              _id: currentUser?._id,
              email: currentUser?.email,
              name: currentUser?.name,
            },
          };
      const previous = JSON.parse(localStorage.getItem("clientRequests") || "[]");
      localStorage.setItem("clientRequests", JSON.stringify([createdRequest, ...previous]));

      if (isMounted.current) {
        alert("Demande envoyée avec succès ✅");
        setFormData({ pickupLocation: "", deliveryLocation: "", pickupCoords: null, deliveryCoords: null, date: "", weight: "", isSensitive: "non" });
        setStep(0);
      }
    } catch (err) {
      console.error(err);
      if (isMounted.current) alert("Erreur lors de l'envoi ❌");
    }
  };

  const canNext = () => {
    if (step === 0) return formData.pickupLocation && formData.deliveryLocation;
    if (step === 1) return formData.date && formData.weight;
    return true;
  };

  /* ── Shared styles ── */
  const inputSt = {
    flex: 1, padding: "13px 16px", borderRadius: 10, fontSize: 14,
    background: "#ffffff", border: "1px solid #cbd5e1",
    color: "#0f172a", outline: "none", width: "100%",
  };
  const labelSt = {
    fontSize: 11, fontWeight: 600, color: "#334155",
    textTransform: "uppercase", letterSpacing: "0.05em",
    display: "block", marginBottom: 8,
  };
  const mapBtnSt = (active) => ({
    padding: "0 16px", borderRadius: 10, border: "none", cursor: "pointer",
    background: active ? "#3b82f6" : "#dbeafe",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    minHeight: 48,
  });

  return (
    <>
      <Navbar />
      <div
        style={{
          background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
          minHeight: "100vh",
          paddingTop: 104,
        }}
        className="px-6 md:px-10 pb-24"
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div className="mb-14">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 0 }}>
                Nouvelle demande de transport
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/profile/client"
                  className="text-xs font-medium px-4 py-2 rounded-lg text-white"
                  style={{ background: "rgba(59,130,246,0.85)" }}
                >
                  Mon profile
                </Link>
                <Link
                  to="/tracking"
                  className="text-xs font-medium px-4 py-2 rounded-lg text-white"
                  style={{ background: "rgba(15,23,42,0.9)", border: "0.5px solid rgba(148,163,184,0.4)" }}
                >
                  Tracking colis
                </Link>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Suivez les étapes pour soumettre votre demande
            </p>
          </div>

          {/* ── Stepper ── */}
          <div className="flex items-center justify-center gap-0 mb-14">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 500, flexShrink: 0,
                    background: i === step ? "#3b82f6" : i < step ? "#dcfce7" : "#e2e8f0",
                    color: i === step ? "#fff" : i < step ? "#166534" : "#475569",
                    border: i === step ? "none" : i < step ? "1px solid #bbf7d0" : "1px solid #cbd5e1",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {s.label}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: i === step ? "#2563eb" : i < step ? "#166534" : "#64748b",
                    }}>
                      {s.title}
                    </span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 64, height: 1, margin: "0 20px", flexShrink: 0,
                    background: i < step ? "#86efac" : "#cbd5e1",
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Card ── */}
          <div style={{ background: "#ffffff", border: "1px solid #dbeafe", borderRadius: 20, padding: "44px 52px", boxShadow: "0 18px 34px rgba(30,64,175,0.08)" }}>

            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 34, paddingBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {sectionIcons[step]}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
                  {sectionTitles[step].title}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                  {sectionTitles[step].sub}
                </div>
              </div>
            </div>

            {/* ── STEP 0 — Lieux ── */}
            {step === 0 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
                  {[
                    { label: "Lieu de départ", name: "pickupLocation", mapKey: "pickup", placeholder: "Ex: Tunis, Avenue Habib Bourguiba" },
                    { label: "Lieu de livraison", name: "deliveryLocation", mapKey: "delivery", placeholder: "Ex: Sfax, Rue de la République" },
                  ].map(({ label, name, mapKey, placeholder }) => (
                    <div key={name}>
                      <label style={labelSt}>{label}</label>
                      <div style={{ display: "flex", gap: 12 }}>
                        <input type="text" name={name} value={formData[name]}
                          onChange={handleChange} placeholder={placeholder} style={inputSt} />
                        <button
                          onClick={() => setActiveMap(activeMap === mapKey ? null : mapKey)}
                          style={mapBtnSt(activeMap === mapKey)}
                          title="Sélectionner sur la carte"
                        >
                          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: activeMap === mapKey ? "#fff" : "#60a5fa", fill: "none", strokeWidth: "1.8" }}>
                            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {activeMap && (
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #bfdbfe", marginTop: 6, marginBottom: 10 }}>
                    <div style={{ padding: "10px 16px", fontSize: 13, color: "#1d4ed8", background: "#eff6ff" }}>
                      Cliquez sur la carte pour sélectionner {activeMap === "pickup" ? "le lieu de départ" : "le lieu de livraison"}
                    </div>
                    <LeafletMap onPick={handleMapPick} />
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 1 — Colis ── */}
            {step === 1 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 30 }}>
                  <div>
                    <label style={labelSt}>Date de livraison souhaitée</label>
                    <input type="date" name="date" value={formData.date}
                      onChange={handleChange} style={{ ...inputSt, width: "100%" }} />
                  </div>
                  <div>
                    <label style={labelSt}>Poids du colis (kg)</label>
                    <input type="number" name="weight" value={formData.weight}
                      onChange={handleChange} min="1" placeholder="Ex: 25"
                      style={{ ...inputSt, width: "100%" }} />
                  </div>
                </div>

                <div>
                  <label style={{ ...labelSt, marginBottom: 14 }}>Type de colis</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    {[
                      {
                        val: "non", name: "Non sensible",
                        desc: "Colis standard, aucune précaution particulière requise",
                        activeColor: "#97c459", activeBg: "rgba(99,153,34,0.1)",
                        activeBorder: "rgba(99,153,34,0.3)", iconColor: "#97c459",
                        iconBg: "rgba(99,153,34,0.15)",
                        iconPath: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                      },
                      {
                        val: "oui", name: "Sensible / Fragile",
                        desc: "Manipulation avec soin, emballage spécial requis",
                        activeColor: "#f09595", activeBg: "rgba(226,75,74,0.1)",
                        activeBorder: "rgba(226,75,74,0.3)", iconColor: "#f09595",
                        iconBg: "rgba(226,75,74,0.12)",
                        iconPath: <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
                      },
                    ].map(({ val, name, desc, activeColor, activeBg, activeBorder, iconColor, iconBg, iconPath }) => {
                      const active = formData.isSensitive === val;
                      return (
                        <button key={val}
                          onClick={() => setFormData({ ...formData, isSensitive: val })}
                          style={{
                            padding: "22px 24px", borderRadius: 14, cursor: "pointer",
                            textAlign: "left", border: `1px solid ${active ? activeBorder : "#cbd5e1"}`,
                            background: active ? activeBg : "#f8fafc", transition: "all 0.2s",
                          }}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: active ? iconBg : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 17, height: 17, stroke: active ? iconColor : "#334155", fill: "none", strokeWidth: "2" }}>
                              {iconPath}
                            </svg>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: active ? activeColor : "#475569", marginBottom: 5 }}>
                            {name}
                          </div>
                          <div style={{ fontSize: 12, color: active ? `${activeColor}99` : "#334155", lineHeight: 1.5 }}>
                            {desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 — Confirmation ── */}
            {step === 2 && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginTop: 6 }}>
                {[
                  { key: "Lieu de départ", val: formData.pickupLocation, icon: <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>, icon2: <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/> },
                  { key: "Lieu de livraison", val: formData.deliveryLocation, icon: <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>, icon2: <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/> },
                  { key: "Date de livraison", val: formData.date, icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
                  { key: "Poids", val: `${formData.weight} kg`, icon: <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/> },
                ].map(({ key, val, icon, icon2 }, i, arr) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 24px", borderBottom: i < arr.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                    <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 8, minWidth: 160 }}>
                      <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "#64748b", fill: "none", strokeWidth: "1.8", flexShrink: 0 }}>
                        {icon}{icon2}
                      </svg>
                      {key}
                    </span>
                    <span style={{ fontSize: 13, color: "#0f172a", maxWidth: "55%", textAlign: "right" }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px" }}>
                  <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: "#64748b", fill: "none", strokeWidth: "1.8" }}>
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Type de colis
                  </span>
                  <span style={{
                    padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: formData.isSensitive === "oui" ? "rgba(226,75,74,0.12)" : "rgba(99,153,34,0.12)",
                    color: formData.isSensitive === "oui" ? "#f09595" : "#97c459",
                  }}>
                    {formData.isSensitive === "oui" ? "Sensible / Fragile" : "Non sensible"}
                  </span>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div style={{ display: "flex", gap: 14, marginTop: 34, paddingTop: 28, borderTop: "1px solid #e2e8f0" }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: 14, borderRadius: 10, fontSize: 14, background: "transparent", border: "0.5px solid rgba(255,255,255,0.1)", color: "#475569", cursor: "pointer" }}>
                  ← Retour
                </button>
              )}
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canNext()} style={{ flex: 2, padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 500, border: "none", cursor: canNext() ? "pointer" : "not-allowed", background: canNext() ? "#3b82f6" : "#1e2535", color: canNext() ? "#fff" : "#334155", transition: "background 0.2s" }}>
                  Suivant — {steps[step + 1]?.title} →
                </button>
              ) : (
                <button onClick={handleSubmit} style={{ flex: 2, padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 500, color: "#fff", border: "none", background: "rgba(99,153,34,0.8)", cursor: "pointer" }}>
                  Envoyer la demande
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}