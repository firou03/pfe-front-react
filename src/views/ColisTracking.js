import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMesRequests,
  getClientRequestsForDashboard,
  updateRequestLocation,
} from "service/restApiTransport";
import AppPageLayout from "components/dashboard/AppPageLayout";
import { ICONS } from "components/dashboard/icons";
import { DashIcon } from "components/dashboard/icons";

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
const sameUser = (a, b) =>
  String(a || "")
    .trim()
    .toLowerCase() ===
  String(b || "")
    .trim()
    .toLowerCase();

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

  const filterRequests = React.useCallback(
    (list, opts = {}) => {
      const arr = Array.isArray(list) ? list : [];
      if (isTransporteur)
        return arr.filter((r) => {
          if (r.transporteur?._id && user?._id)
            return sameUser(r.transporteur._id, user._id);
          if (r.transporteur?.email && user?.email)
            return sameUser(r.transporteur.email, user.email);
          if (r.assignedTransporteurId && user?._id)
            return sameUser(r.assignedTransporteurId, user._id);
          return true;
        });
      return arr.filter((r) => {
        if (r.client?._id && user?._id) return sameUser(r.client._id, user._id);
        if (r.client?.email && user?.email)
          return sameUser(r.client.email, user.email);
        if (r.createdByClientId && user?._id)
          return sameUser(r.createdByClientId, user._id);
        if (r.createdByClientEmail && user?.email)
          return sameUser(r.createdByClientEmail, user.email);
        return opts.trustServerScope || false;
      });
    },
    [isTransporteur, user]
  );

  useEffect(() => {
    const load = async () => {
      try {
        if (isTransporteur) {
          const res = await getMesRequests();
          setRequests(filterRequests(res.data || [], { trustServerScope: true }));
        } else {
          try {
            const res = await getClientRequestsForDashboard();
            const scoped = filterRequests(res.data || [], { trustServerScope: true });
            setRequests(
              scoped.filter((r) =>
                ["accepted_by_transporter", "confirmed", "delivered"].includes(
                  String(r?.status || "").toLowerCase()
                )
              )
            );
          } catch {
            const local = filterRequests(getStoredClientRequests());
            setRequests(
              local.filter((r) =>
                ["accepted_by_transporter", "confirmed", "delivered"].includes(
                  String(r?.status || "").toLowerCase()
                )
              )
            );
          }
        }
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isTransporteur, filterRequests]);

  const saveTracking = async (request) => {
    if (!isTransporteur) {
      alert("Seul le transporteur peut mettre à jour la localisation.");
      return;
    }
    const loc = (locationInputs[request._id] || "").trim();
    if (!loc) {
      alert("Veuillez saisir une localisation.");
      return;
    }
    const entry = {
      location: loc,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name || "transporteur",
    };
    const updated = { ...tracking, [request._id]: entry };
    setTracking(updated);
    localStorage.setItem(TRACKING_KEY, JSON.stringify(updated));
    try {
      await updateRequestLocation(request._id, { currentLocation: loc });
    } catch {}
    setLocationInputs((prev) => ({ ...prev, [request._id]: "" }));
    alert("Localisation mise à jour ✅");
  };

  const subtitle = isTransporteur
    ? "Mettez à jour la position de vos colis pris en charge."
    : "Consultez la localisation la plus récente de vos colis.";

  return (
    <AppPageLayout sectionLabel="Suivi" title="Tracking des colis" subtitle={subtitle}>
      {loading ? (
        <div className="dash-empty">Chargement...</div>
      ) : requests.length === 0 ? (
        <div className="dash-panel dash-empty">
          <div style={{ fontSize: 44, marginBottom: 14 }}>📦</div>
          <p className="dash-panel-title">Aucun colis à suivre</p>
          <p className="dash-date" style={{ marginBottom: 20 }}>
            {isTransporteur
              ? "Acceptez des demandes pour les suivre ici."
              : "Vos colis acceptés apparaîtront ici."}
          </p>
          <Link to={isTransporteur ? "/requests" : "/client"} className="dash-btn-primary">
            {isTransporteur ? "Voir les demandes" : "Créer une demande"}
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(440px,1fr))",
            gap: 20,
          }}
        >
          {requests.map((r) => {
            const st = tracking[r._id];
            return (
              <div key={r._id} className="dash-panel">
                <div className="dash-panel-heading">
                  <div>
                    <div className="dash-route">
                      {r.pickupLocation} → {r.deliveryLocation}
                    </div>
                    <div className="dash-date" style={{ marginTop: 4, display: "flex", gap: 12 }}>
                      <span>⚖️ {r.weight || "?"} kg</span>
                      {r.date && (
                        <span>📅 {new Date(r.date).toLocaleDateString("fr-FR")}</span>
                      )}
                      {r.isSensitive === "oui" && <span>⚠️ Fragile</span>}
                    </div>
                  </div>
                  <span
                    className={`dash-badge ${st ? "accepted" : "pending"}`}
                  >
                    <span className="dash-badge-dot" />
                    {st ? "✓ Mise à jour" : "En attente"}
                  </span>
                </div>

                <div className="dash-map-wrap" style={{ marginBottom: isTransporteur ? 14 : 0 }}>
                  <div className="dash-label" style={{ marginBottom: 6 }}>
                    <DashIcon d={ICONS.map} size={12} /> Dernière localisation
                  </div>
                  <div className="dash-route">
                    {st?.location || "Aucune localisation pour le moment"}
                  </div>
                  {st?.updatedAt && (
                    <div className="dash-date" style={{ marginTop: 6 }}>
                      Mis à jour le {new Date(st.updatedAt).toLocaleString("fr-FR")}
                    </div>
                  )}
                </div>

                {isTransporteur && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      className="dash-input"
                      value={locationInputs[r._id] || ""}
                      onChange={(e) =>
                        setLocationInputs((prev) => ({
                          ...prev,
                          [r._id]: e.target.value,
                        }))
                      }
                      placeholder="Ex: Sousse, Km 12 - Autoroute A1"
                    />
                    <button
                      type="button"
                      className="dash-btn-primary"
                      onClick={() => saveTracking(r)}
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
    </AppPageLayout>
  );
}
