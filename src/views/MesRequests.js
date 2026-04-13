import React, { useState, useEffect } from "react";
import { getMesRequests } from "service/restApiTransport";
import Navbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footers/Footer.js";

export default function MesRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMesRequests = async () => {
      try {
        const res = await getMesRequests();
        setRequests(res.data);
      } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchMesRequests();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center min-h-screen bg-blueGray-100 pt-24 pb-10">
        <div className="w-full max-w-4xl px-4">

          <h2 className="text-3xl font-bold text-center text-lightBlue-600 mb-10">
            📋 Mes Demandes Acceptées
          </h2>

          {loading ? (
            <p className="text-center text-blueGray-500">Chargement...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-blueGray-500">
              Aucune demande acceptée 📭
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-2xl shadow-xl p-8 border border-blueGray-100"
                >
                  <div className="flex flex-col gap-3">

                    {/* Status badge */}
                    <div className="flex justify-end">
                      <span className="bg-green-100 text-green-700 font-bold px-4 py-1 rounded-full text-sm">
                        ✅ Acceptée
                      </span>
                    </div>

                    <p className="text-blueGray-700">
                      <span className="font-bold">📍 Départ :</span>{" "}
                      {request.pickupLocation}
                    </p>
                    <p className="text-blueGray-700">
                      <span className="font-bold">📦 Livraison :</span>{" "}
                      {request.deliveryLocation}
                    </p>
                    <p className="text-blueGray-700">
                      <span className="font-bold">📅 Date :</span>{" "}
                      {new Date(request.date).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-blueGray-700">
                      <span className="font-bold">⚖️ Poids :</span>{" "}
                      {request.weight} kg
                    </p>
                    <p className="text-blueGray-700">
                      <span className="font-bold">⚠️ Sensible :</span>{" "}
                      {request.isSensitive === "oui" ? "Oui 🔴" : "Non 🟢"}
                    </p>
                    <p className="text-blueGray-700">
                      <span className="font-bold">👤 Client :</span>{" "}
                      {request.client?.name} ({request.client?.email})
                    </p>
                    <p className="text-blueGray-500 text-sm">
                      <span className="font-bold">🕐 Créée le :</span>{" "}
                      {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}