import React, { useState, useRef, useEffect } from "react";
import { createTransportRequest } from "service/restApiTransport";
import Navbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footers/Footer.js";

// Composant Map sans react-leaflet
function LeafletMap({ onPick, pickupCoords, deliveryCoords }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Charge leaflet via CDN
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
  }, []);

  const initMap = () => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current).setView([33.8869, 9.5375], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    map.on("click", (e) => {
      onPick(e.latlng);
    });

    mapInstanceRef.current = map;
  };

  return (
    <div
      ref={mapRef}
      style={{ height: "300px", width: "100%", borderRadius: "12px" }}
    />
  );
}

const steps = ["Lieux", "Colis", "Confirmation"];

export default function CardClient() {
  const isMounted = useRef(true);
  const [step, setStep] = useState(0);
  const [activeMap, setActiveMap] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    pickupCoords: null,
    deliveryCoords: null,
    date: "",
    weight: "",
    isSensitive: "non",
  });

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMapPick = async (latlng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
      );
      const data = await res.json();
      const address = data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;

      if (activeMap === "pickup") {
        setFormData((prev) => ({ ...prev, pickupLocation: address, pickupCoords: latlng }));
      } else {
        setFormData((prev) => ({ ...prev, deliveryLocation: address, deliveryCoords: latlng }));
      }
      setActiveMap(null);
    } catch {
      const address = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      if (activeMap === "pickup") {
        setFormData((prev) => ({ ...prev, pickupLocation: address, pickupCoords: latlng }));
      } else {
        setFormData((prev) => ({ ...prev, deliveryLocation: address, deliveryCoords: latlng }));
      }
      setActiveMap(null);
    }
  };

  const handleSubmit = async () => {
    try {
      await createTransportRequest({
        pickupLocation: formData.pickupLocation,
        deliveryLocation: formData.deliveryLocation,
        date: formData.date,
        weight: formData.weight,
        isSensitive: formData.isSensitive,
      });

      if (isMounted.current) {
        alert("Demande envoyée avec succès ✅");
        setFormData({
          pickupLocation: "",
          deliveryLocation: "",
          pickupCoords: null,
          deliveryCoords: null,
          date: "",
          weight: "",
          isSensitive: "non",
        });
        setStep(0);
      }
    } catch (error) {
      console.error(error);
      if (isMounted.current) alert("Erreur lors de l'envoi ❌");
    }
  };

  const canNext = () => {
    if (step === 0) return formData.pickupLocation && formData.deliveryLocation;
    if (step === 1) return formData.date && formData.weight;
    return true;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-blueGray-100 pt-24 pb-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-lightBlue-600 mb-2">
              🚚 Nouvelle Demande
            </h2>
            <p className="text-blueGray-500">Remplissez les informations pour votre transport</p>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all duration-300 ${
                  i === step ? "bg-lightBlue-500 text-white shadow-lg"
                  : i < step ? "bg-green-500 text-white"
                  : "bg-blueGray-200 text-blueGray-500"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-semibold ${i === step ? "text-lightBlue-600" : "text-blueGray-400"}`}>
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-12 h-1 rounded ${i < step ? "bg-green-400" : "bg-blueGray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">

            {/* STEP 0 */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <h3 className="text-xl font-bold text-blueGray-700 mb-2">📍 Choisissez les lieux</h3>

                <div>
                  <label className="block text-blueGray-600 mb-1 font-semibold text-sm uppercase tracking-wide">
                    Lieu de départ
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      placeholder="Ex: Tunis, Avenue Habib Bourguiba"
                      className="flex-1 px-4 py-3 border-2 border-blueGray-200 rounded-xl focus:outline-none focus:border-lightBlue-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveMap(activeMap === "pickup" ? null : "pickup")}
                      className={`px-4 py-3 rounded-xl font-bold transition ${
                        activeMap === "pickup" ? "bg-lightBlue-500 text-white" : "bg-blueGray-100 text-blueGray-600 hover:bg-lightBlue-100"
                      }`}
                    >
                      🗺️
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-blueGray-600 mb-1 font-semibold text-sm uppercase tracking-wide">
                    Lieu de livraison
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="deliveryLocation"
                      value={formData.deliveryLocation}
                      onChange={handleChange}
                      placeholder="Ex: Sfax, Rue de la République"
                      className="flex-1 px-4 py-3 border-2 border-blueGray-200 rounded-xl focus:outline-none focus:border-lightBlue-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveMap(activeMap === "delivery" ? null : "delivery")}
                      className={`px-4 py-3 rounded-xl font-bold transition ${
                        activeMap === "delivery" ? "bg-lightBlue-500 text-white" : "bg-blueGray-100 text-blueGray-600 hover:bg-lightBlue-100"
                      }`}
                    >
                      🗺️
                    </button>
                  </div>
                </div>

                {/* Map */}
                {activeMap && (
                  <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-lightBlue-200">
                    <div className="bg-lightBlue-50 px-4 py-2 text-sm font-semibold text-lightBlue-600">
                      🖱️ Clique sur la carte pour sélectionner {activeMap === "pickup" ? "le départ" : "la livraison"}
                    </div>
                    <LeafletMap
                      onPick={handleMapPick}
                      pickupCoords={formData.pickupCoords}
                      deliveryCoords={formData.deliveryCoords}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h3 className="text-xl font-bold text-blueGray-700 mb-2">📦 Détails du colis</h3>

                <div>
                  <label className="block text-blueGray-600 mb-1 font-semibold text-sm uppercase tracking-wide">
                    📅 Date de livraison
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blueGray-200 rounded-xl focus:outline-none focus:border-lightBlue-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-blueGray-600 mb-1 font-semibold text-sm uppercase tracking-wide">
                    ⚖️ Poids du colis (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="1"
                    placeholder="Ex: 10"
                    className="w-full px-4 py-3 border-2 border-blueGray-200 rounded-xl focus:outline-none focus:border-lightBlue-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-blueGray-600 mb-2 font-semibold text-sm uppercase tracking-wide">
                    ⚠️ Sensibilité du colis
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isSensitive: "non" })}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${
                        formData.isSensitive === "non"
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white text-blueGray-500 border-blueGray-200 hover:border-green-300"
                      }`}
                    >
                      🟢 Non sensible
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isSensitive: "oui" })}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${
                        formData.isSensitive === "oui"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-white text-blueGray-500 border-blueGray-200 hover:border-red-300"
                      }`}
                    >
                      🔴 Sensible
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-blueGray-700 mb-2">✅ Confirmation</h3>
                <div className="bg-blueGray-50 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-blueGray-500 font-semibold">📍 Départ</span>
                    <span className="text-blueGray-700 text-right max-w-xs text-sm">{formData.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blueGray-500 font-semibold">📦 Livraison</span>
                    <span className="text-blueGray-700 text-right max-w-xs text-sm">{formData.deliveryLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blueGray-500 font-semibold">📅 Date</span>
                    <span className="text-blueGray-700">{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blueGray-500 font-semibold">⚖️ Poids</span>
                    <span className="text-blueGray-700">{formData.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blueGray-500 font-semibold">⚠️ Sensible</span>
                    <span className={formData.isSensitive === "oui" ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                      {formData.isSensitive === "oui" ? "Oui 🔴" : "Non 🟢"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-xl font-bold border-2 border-blueGray-300 text-blueGray-600 hover:bg-blueGray-50 transition"
                >
                  ← Retour
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext()}
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition ${
                    canNext() ? "bg-lightBlue-500 hover:bg-lightBlue-600 shadow-lg" : "bg-blueGray-300 cursor-not-allowed"
                  }`}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-lg transition"
                >
                  🚀 Envoyer la demande
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