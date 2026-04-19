import React, { useEffect, useMemo, useState } from "react";
import {
  getMesRequests,
  getClientRequests,
  updateRequestLocation,
} from "service/restApiTransport";
import Navbar from "components/Navbars/AuthNavbar.js";
import Footer from "components/Footers/Footer.js";

const TRACKING_KEY = "colisTrackingByRequest";

const getStoredTracking = () => {
  try {
    return JSON.parse(localStorage.getItem(TRACKING_KEY) || "{}");
  } catch {
    return {};
  }
};

const getStoredClientRequests = () => {
  try {
    return JSON.parse(localStorage.getItem("clientRequests") || "[]");
  } catch {
    return [];
  }
};

const sameUser = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

export default function ColisTracking() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isTransporteur = user?.role === "transporteur";
  const [requests, setRequests] = useState([]);
  const [tracking, setTracking] = useState(getStoredTracking());
  const [locationInputs, setLocationInputs] = useState({});
  const [loading, setLoading] = useState(true);

  const filterRequestsForCurrentUser = (rawRequests, options = {}) => {
    const { trustServerScope = false } = options;
    const list = Array.isArray(rawRequests) ? rawRequests : [];

    if (isTransporteur) {
      return list.filter((request) => {
        if (request.transporteur?._id && user?._id) {
          return sameUser(request.transporteur._id, user._id);
        }
        if (request.transporteur?.email && user?.email) {
          return sameUser(request.transporteur.email, user.email);
        }
        if (request.assignedTransporteurId && user?._id) {
          return sameUser(request.assignedTransporteurId, user._id);
        }
        // If backend already gives only mes requests, keep it.
        return true;
      });
    }

    return list.filter((request) => {
      if (request.client?._id && user?._id) {
        return sameUser(request.client._id, user._id);
      }
      if (request.client?.email && user?.email) {
        return sameUser(request.client.email, user.email);
      }
      if (request.createdByClientId && user?._id) {
        return sameUser(request.createdByClientId, user._id);
      }
      if (request.createdByClientEmail && user?.email) {
        return sameUser(request.createdByClientEmail, user.email);
      }
      // If request came from a user-scoped backend endpoint, keep it even when
      // client fields are not populated in response payload.
      if (trustServerScope) return true;
      return false;
    });
  };

  useEffect(() => {
    const loadRequests = async () => {
      try {
        if (isTransporteur) {
          const res = await getMesRequests();
          setRequests(filterRequestsForCurrentUser(res.data || [], { trustServerScope: true }));
          return;
        }

        try {
          const res = await getClientRequests();
          const clientScoped = filterRequestsForCurrentUser(res.data || [], {
            trustServerScope: true,
          });
          // Client tracking focuses on accepted requests only.
          const acceptedOnly = clientScoped.filter((request) => {
            const status = String(request?.status || "").toLowerCase();
            return status.includes("accept");
          });
          setRequests(acceptedOnly);
        } catch {
          // Local fallback remains strict per owner and keeps only accepted.
          const localOwned = filterRequestsForCurrentUser(getStoredClientRequests());
          const acceptedLocal = localOwned.filter((request) => {
            const status = String(request?.status || "").toLowerCase();
            return status.includes("accept");
          });
          setRequests(acceptedLocal);
        }
      } catch (error) {
        console.error(error);
        const localOwned = filterRequestsForCurrentUser(getStoredClientRequests());
        const acceptedLocal = localOwned.filter((request) => {
          const status = String(request?.status || "").toLowerCase();
          return status.includes("accept");
        });
        setRequests(acceptedLocal);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [isTransporteur]);

  const handleInputChange = (requestId, value) => {
    setLocationInputs((prev) => ({ ...prev, [requestId]: value }));
  };

  const saveTracking = async (request) => {
    if (!isTransporteur) {
      alert("Seul le transporteur peut mettre à jour la localisation.");
      return;
    }

    const nextLocation = (locationInputs[request._id] || "").trim();
    if (!nextLocation) {
      alert("Veuillez saisir une localisation.");
      return;
    }

    const entry = {
      location: nextLocation,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name || "transporteur",
    };
    const updated = { ...tracking, [request._id]: entry };
    setTracking(updated);
    localStorage.setItem(TRACKING_KEY, JSON.stringify(updated));

    try {
      await updateRequestLocation(request._id, { currentLocation: nextLocation });
    } catch (error) {
      console.warn("API localisation indisponible, sauvegarde locale utilisée.", error);
    }

    setLocationInputs((prev) => ({ ...prev, [request._id]: "" }));
    alert("Localisation mise à jour ✅");
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
          minHeight: "100vh",
          paddingTop: 88,
        }}
        className="px-6 pb-14"
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div className="mb-8">
            <h2 className="font-semibold" style={{ fontSize: 24, color: "#0f172a" }}>
              Suivi des colis
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
              {isTransporteur
                ? "Mettez à jour la position de vos colis pris en charge."
                : "Consultez la localisation la plus récente de vos colis."}
            </p>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Chargement...</p>
          ) : requests.length === 0 ? (
            <div
              style={{
                border: "1px solid #dbeafe",
                borderRadius: 12,
                padding: 20,
                color: "#475569",
                background: "#ffffff",
              }}
            >
              Aucune demande disponible pour le suivi.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {requests.map((request) => {
                const status = tracking[request._id];
                return (
                  <div
                    key={request._id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #dbeafe",
                      borderRadius: 14,
                      padding: 20,
                      boxShadow: "0 10px 24px rgba(30,64,175,0.08)",
                    }}
                  >
                    <div className="flex flex-wrap justify-between gap-3 mb-4">
                      <div>
                        <div style={{ color: "#0f172a", fontSize: 15, fontWeight: 600 }}>
                          {request.pickupLocation} → {request.deliveryLocation}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                          Colis: {request.weight} kg
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          borderRadius: 9999,
                          padding: "4px 10px",
                          color: status ? "#97c459" : "#94a3b8",
                          background: status
                            ? "rgba(99,153,34,0.16)"
                            : "rgba(148,163,184,0.12)",
                        }}
                      >
                        {status ? "Position mise à jour" : "En attente de mise à jour"}
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: isTransporteur ? 12 : 0,
                      }}
                    >
                      <div style={{ color: "#64748b", fontSize: 12 }}>Dernière localisation</div>
                      <div style={{ color: "#0f172a", fontSize: 14, marginTop: 4 }}>
                        {status?.location || "Aucune localisation pour le moment"}
                      </div>
                      {status?.updatedAt && (
                        <div style={{ color: "#64748b", fontSize: 11, marginTop: 6 }}>
                          Mis à jour le{" "}
                          {new Date(status.updatedAt).toLocaleString("fr-FR")}
                        </div>
                      )}
                    </div>

                    {isTransporteur && (
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={locationInputs[request._id] || ""}
                          onChange={(e) => handleInputChange(request._id, e.target.value)}
                          placeholder="Ex: Sousse, Km 12 - Autoroute A1"
                          style={{
                            flex: 1,
                            minWidth: 220,
                            padding: "11px 12px",
                            borderRadius: 9,
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            color: "#0f172a",
                            outline: "none",
                          }}
                        />
                        <button
                          onClick={() => saveTracking(request)}
                          style={{
                            padding: "11px 14px",
                            borderRadius: 9,
                            border: "none",
                            background: "#3b82f6",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Mettre à jour
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
