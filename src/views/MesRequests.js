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
          <div className="mb-10">
            <h2 className="font-semibold" style={{ fontSize: 22, color: "#0f172a" }}>
              Mes demandes acceptées
            </h2>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>
              Toutes les demandes que vous avez prises en charge
            </p>
          </div>

          {/* États */}
          {loading ? (
            <p className="text-center text-sm" style={{ color: "#475569" }}>
              Chargement...
            </p>
          ) : requests.length === 0 ? (
            <p className="text-center text-sm" style={{ color: "#475569" }}>
              Aucune demande acceptée
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

                <thead style={{ background: "#eff6ff" }}>
                  <tr>
                    {["Départ", "Livraison", "Date", "Poids", "Sensible", "Client", "Créée le", "Statut"].map((h) => (
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

                      {/* Date création */}
                      <td style={tdStyle}>
                        {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Statut */}
                      <td style={tdStyle}>
                        <span style={badgeAccepted}>Acceptée</span>
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

/* ── Styles ── */
const tdStyle = {
  padding: "14px 14px",
  color: "#334155",
  fontSize: 13,
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const badgeAccepted = {
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 500,
  background: "#dcfce7",
  color: "#166534",
  border: "1px solid #bbf7d0",
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