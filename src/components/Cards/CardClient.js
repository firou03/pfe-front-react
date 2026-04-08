import React, { useState } from "react";
import { createTransportRequest } from "../../service/restApiTransport"; // ✅ IMPORT API

export default function CardClient() {

  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    date: "",
    weight: "",
    isSensitive: "non", // ✅ important
  });

  // handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // handle submit (CONNECTED TO BACKEND)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTransportRequest(formData);

      alert("Demande envoyée avec succès ✅");

      // reset form
      setFormData({
        pickupLocation: "",
        deliveryLocation: "",
        date: "",
        weight: "",
        isSensitive: "non",
      });

    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi ❌");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blueGray-100">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold text-center text-lightBlue-600 mb-6">
          🚚 Nouvelle Demande de Transport
        </h2>

        <p className="text-center text-blueGray-500 mb-8">
          Remplissez les informations pour envoyer votre colis
        </p>

        <form onSubmit={handleSubmit}>

          {/* Pickup */}
          <div className="mb-4">
            <label className="block text-blueGray-600 mb-2 font-semibold">
              📍 Lieu de départ
            </label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue-500"
            />
          </div>

          {/* Delivery */}
          <div className="mb-4">
            <label className="block text-blueGray-600 mb-2 font-semibold">
              📦 Lieu de livraison
            </label>
            <input
              type="text"
              name="deliveryLocation"
              value={formData.deliveryLocation}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue-500"
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-blueGray-600 mb-2 font-semibold">
              📅 Date de livraison
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue-500"
            />
          </div>

          {/* Weight */}
          <div className="mb-4">
            <label className="block text-blueGray-600 mb-2 font-semibold">
              ⚖️ Poids du colis (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lightBlue-500"
            />
          </div>

          {/* Sensitivity */}
          <div className="mb-6">
            <label className="block text-blueGray-600 mb-2 font-semibold">
              ⚠️ Sensibilité du colis
            </label>
            <select
              name="isSensitive"
              value={formData.isSensitive}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-lightBlue-500"
            >
              <option value="non">Non sensible</option>
              <option value="oui">Sensible</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">

            <button
              type="submit"
              className="w-1/2 bg-lightBlue-500 text-white py-3 rounded-lg font-bold hover:bg-lightBlue-600 transition duration-300"
            >
              Envoyer
            </button>

            <button
              type="button"
              className="w-1/2 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition duration-300"
              onClick={() =>
                setFormData({
                  pickupLocation: "",
                  deliveryLocation: "",
                  date: "",
                  weight: "",
                  isSensitive: "non",
                })
              }
            >
              Annuler
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}