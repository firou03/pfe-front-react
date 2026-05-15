import React, { useState, useEffect, useRef } from "react";
import { notify } from "utils/notifications";
import axios from "axios";
import PageHeader from "components/dashboard/PageHeader";

const Icon = ({ d, size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
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
        const res = await axios
          .get("http://localhost:5000/users/getAllUsers")
          .catch(() => ({ data: { data: [] } }));
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
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let filtered = users;
    if (filter === "clients") filtered = filtered.filter((u) => u.role === "client");
    else if (filter === "transporteurs")
      filtered = filtered.filter((u) => u.role === "transporteur");

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
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
        setUsers(users.filter((u) => u._id !== userId));
        notify.success("Utilisateur supprimé avec succès");
      } catch {
        notify.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <>
      <PageHeader
        sectionLabel="Administration"
        title="Gestion des utilisateurs"
        subtitle={`Total : ${filteredUsers.length} utilisateurs`}
      />

      <div className="dash-panel" style={{ marginBottom: 20 }}>
        <input
          type="text"
          className="dash-input"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="dash-filters" style={{ marginTop: 16 }}>
          {["all", "clients", "transporteurs"].map((f) => (
            <button
              key={f}
              type="button"
              className={`dash-filter-pill${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tous" : f === "clients" ? "Clients" : "Transporteurs"}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-panel">
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="dash-empty">Aucun utilisateur trouvé</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Téléphone</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <span className="dash-route">{user.name || "—"}</span>
                  </td>
                  <td>
                    <span className="dash-date">{user.email || "—"}</span>
                  </td>
                  <td>
                    <span
                      className={`dash-badge ${
                        user.role === "client" ? "pending" : "accepted"
                      }`}
                    >
                      <span className="dash-badge-dot" />
                      {user.role === "client"
                        ? "Client"
                        : user.role === "transporteur"
                          ? "Transporteur"
                          : "Admin"}
                    </span>
                  </td>
                  <td>
                    <span className="dash-date">{user.tel || "—"}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className="dash-btn-danger"
                      onClick={() => deleteUser(user._id)}
                    >
                      <Icon d={ICONS.trash} size={12} color="currentColor" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
