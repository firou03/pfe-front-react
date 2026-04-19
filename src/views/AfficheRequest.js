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

  useEffect(() => { fetchRequests(); }, []);

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
      <Navbar />

      <div
        style={{
          background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
          minHeight: "100vh",
          paddingTop: 92,
        }}
        className="px-6 md:px-8 pb-16"
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>

          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h2
              className="font-semibold"
              style={{ fontSize: 22, color: "#0f172a" }}
            >
              Demandes en attente
            </h2>
            <div className="flex flex-wrap gap-2 justify-end">
              <Link
                to="/profile/transporteur"
                className="text-white text-xs font-medium px-4 py-2 rounded-lg"
                style={{ background: "#3b82f6" }}
              >
                Mon profile
              </Link>
              <Link
                to="/tracking"
                className="text-white text-xs font-medium px-4 py-2 rounded-lg"
                style={{ background: "#1e40af" }}
              >
                Tracking colis
              </Link>
              <Link
                to="/mes-requests"
                className="text-white text-xs font-medium px-4 py-2 rounded-lg"
                style={{ background: "#3b82f6" }}
              >
                Mes demandes acceptées
              </Link>
            </div>
          </div>

          {/* États */}
          {loading ? (
            <p className="text-center text-sm" style={{ color: "#475569" }}>
              Chargement...
            </p>
          ) : requests.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "#475569" }}>
              Aucune demande en attente
            </p>
          ) : (

            /* Tableau */
            <div
              style={{
                borderRadius: 14,
                border: "1px solid #dbeafe",
                overflow: "hidden",
                boxShadow: "0 14px 30px rgba(30,64,175,0.08)",
                background: "#ffffff",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>

                {/* En-têtes */}
                <thead style={{ background: "#eff6ff" }}>
                  <tr>
                    {["Départ", "Livraison", "Date", "Poids", "Sensible", "Client", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 14px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#1e3a8a",
                          borderBottom: "1px solid #dbeafe",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Lignes */}
                <tbody>
                  {requests.map((request, i) => (
                    <tr
                      key={request._id}
                      style={{
                        borderBottom:
                          i < requests.length - 1
                            ? "1px solid #eff6ff"
                            : "none",
                      }}
                    >
                      <td style={tdStyle}>{request.pickupLocation}</td>
                      <td style={tdStyle}>{request.deliveryLocation}</td>
                      <td style={tdStyle}>
                        {new Date(request.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td style={tdStyle}>{request.weight} kg</td>

                      {/* Badge Sensible */}
                      <td style={tdStyle}>
                        {request.isSensitive === "oui" ? (
                          <span style={badgeRed}>Oui</span>
                        ) : (
                          <span style={badgeGreen}>Non</span>
                        )}
                      </td>

                      {/* Client */}
                      <td style={tdStyle}>
                        <div style={{ color: "#e2e8f0", fontSize: 12 }}>
                          {request.client?.name}
                        </div>
                        <div style={{ color: "#334155", fontSize: 11 }}>
                          {request.client?.email}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleAccept(request._id)}
                          style={btnAccept}
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleDelete(request._id)}
                          style={btnDelete}
                        >
                          Suppr.
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

/* ── Styles partagés ── */
const tdStyle = {
  padding: "14px 14px",
  color: "#334155",
  fontSize: 13,
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const badgeRed = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 500,
  background: "#fee2e2",
  color: "#991b1b",
};

const badgeGreen = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 500,
  background: "#dcfce7",
  color: "#166534",
};

const btnAccept = {
  padding: "5px 10px",
  borderRadius: 6,
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #bbf7d0",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  marginRight: 6,
};

const btnDelete = {
  padding: "5px 10px",
  borderRadius: 6,
  background: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
};