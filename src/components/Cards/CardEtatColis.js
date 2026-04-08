import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CardEtatColis() {

  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:5000/transport/all");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 🚚 update statut
  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/transport/updateStatus/${id}`, {
      status,
    });

    fetchRequests();
  };

  return (
    <div>
      <h2>Mise à jour état colis</h2>

      {requests.map((r) => (
        <div key={r._id} className="border p-3 mb-2">

          {r.pickupLocation} → {r.deliveryLocation}
          <br />

          Status actuel : <b>{r.status}</b>

          <br />

          <button onClick={() => updateStatus(r._id, "delivered")}>
            Livré
          </button>

          <button onClick={() => updateStatus(r._id, "pending")}>
            En attente
          </button>

        </div>
      ))}
    </div>
  );
}