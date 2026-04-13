import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPendingRequests, acceptTransportRequest } from "service/restApiTransport";
import Navbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footers/Footer.js";

export default function AfficheRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await getPendingRequests();
      setRequests(res.data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors du chargement ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptTransportRequest(id);
      alert("Demande acceptée ✅");
      setRequests(requests.filter((r) => r._id !== id));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'acceptation ❌");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette demande ?")) {
      setRequests(requests.filter((r) => r._id !== id));
    }
  };

  return (
    <>
      {/* ✅ Navbar sans transparent */}
      <Navbar />
      
      <div className="flex flex-col items-center min-h-screen bg-blueGray-100 pt-24 pb-10">
        <div className="w-full max-w-4xl px-4">

          <h2 className="text-3xl font-bold text-center text-lightBlue-600 mb-10">
            🚚 Demandes de Transport en Attente
          </h2>
          <div className="flex justify-end mb-6">
  <Link
    to="/mes-requests"
    className="bg-lightBlue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-lightBlue-600 transition duration-300"
  >
    📋 Voir mes demandes acceptées
  </Link>
</div>

          {loading ? (
            <p className="text-center text-blueGray-500">Chargement...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-blueGray-500">
              Aucune demande en attente 📭
            </p>
          ) : (
            <div className="flex flex-col gap-8"> {/* ✅ espace entre chaque carte */}
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-blueGray-100"
                >
                  {/* Infos */}
                  <div className="flex flex-col gap-3">
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
                  </div>

                  {/* ✅ Deux boutons */}
                  <div className="flex flex-col gap-3 min-w-max">
                    <button
                      onClick={() => handleAccept(request._id)}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition duration-300"
                    >
                      ✅ Accepter
                    </button>
                    <button
                      onClick={() => handleDelete(request._id)}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition duration-300"
                    >
                      🗑️ Supprimer
                    </button>
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