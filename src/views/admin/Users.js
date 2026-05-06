import React, { useState, useEffect, useRef } from "react";
import { notify } from "utils/notifications";
import axios from "axios";

const Icon = ({ d, size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  users: "M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 13H4.458c-1.119 0-2.02.905-1.98 2.024.087 2.755 1.899 5.228 4.514 5.858m0-13.986h7.541c1.12 0 2.021.905 1.981 2.024-.087 2.755-1.899 5.228-4.513 5.858m6.5-13.986c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm-3 8.99c.93 0 1.78.384 2.38 1",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
};

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/getAllUsers").catch(() => ({ data: { data: [] } }));
        const allUsers = res.data?.data || [];
        if (isMounted.current) {
          setUsers(allUsers);
          setFilteredUsers(allUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchUsers();
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    let filtered = users;
    if (filter === "clients") filtered = filtered.filter(u => u.role === "client");
    else if (filter === "transporteurs") filtered = filtered.filter(u => u.role === "transporteur");

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [users, filter, searchTerm]);

  const deleteUser = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      try {
        await axios.delete(`http://localhost:5000/users/deleteUser/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        notify.success("Utilisateur supprimé avec succès");
      } catch (err) {
        notify.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0f1e 0%,#0f172a 40%,#0d1b2e 100%)", fontFamily: "'Inter', sans-serif", color: "#fff", padding: "30px 40px" }}>
      <header style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Gestion des Utilisateurs</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "8px 0 0 0" }}>Total: {filteredUsers.length} utilisateurs</p>
      </header>

      <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
        <input type="text" placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14 }} />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {["all", "clients", "transporteurs"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", background: filter === f ? "rgba(232,121,249,0.2)" : "rgba(255,255,255,0.05)", border: "1px solid " + (filter === f ? "rgba(232,121,249,0.3)" : "rgba(255,255,255,0.1)"), borderRadius: 8, color: filter === f ? "#e879f9" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {f === "all" ? "Tous" : f === "clients" ? "Clients" : "Transporteurs"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...glass, padding: 24 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Nom</th>
                <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Email</th>
                <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Rôle</th>
                <th style={{ textAlign: "left", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Téléphone</th>
                <th style={{ textAlign: "center", padding: "12px 0", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Chargement...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Aucun utilisateur trouvé</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 0", fontSize: 12, fontWeight: 600, color: "#e879f9" }}>{user.name || "—"}</td>
                    <td style={{ padding: "12px 0", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{user.email || "—"}</td>
                    <td style={{ padding: "12px 0" }}>
                      <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: user.role === "client" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)", color: user.role === "client" ? "#3b82f6" : "#a855f7" }}>
                        {user.role === "client" ? "Client" : user.role === "transporteur" ? "Transporteur" : "Admin"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{user.tel || "—"}</td>
                    <td style={{ padding: "12px 0", textAlign: "center" }}>
                      <button onClick={() => deleteUser(user._id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", color: "#ef4444", fontSize: 11, fontWeight: 600 }}>
                        <Icon d={ICONS.trash} size={12} color="#ef4444" /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
