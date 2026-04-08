import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CardTransporteur() {

  const [requests, setRequests] = useState([]);
  const userId = "TRANSPORTEUR_ID";

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:5000/transport/all");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ✅ accepter / refuser
  const handleStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/transport/updateStatus/${id}`, {
      status,
      transporteurId: userId,
    });

    fetchRequests();
  };

  return (
    <div>
      <h2>Demandes de transport</h2>

      {requests.map((r) => (
        <div key={r._id} className="border p-3 mb-2">
          {r.pickupLocation} → {r.deliveryLocation}
          <br />
          Status : {r.status}

          <br />

          <button onClick={() => handleStatus(r._id, "accepted")}>
            Accepter
          </button>

          <button onClick={() => handleStatus(r._id, "rejected")}>
            Refuser
          </button>
        </div>
      ))}
    </div>
  );
}