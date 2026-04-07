import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  getAllUsers,
  deleteUser,
  addUser,
  updateUser,
} from "../../service/restApiUser";

export default function CardTable({ color }) {
  const [users, setUsers] = useState([]);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    role: "",
    age: "",
    location: "",
    name: "",
  });

  // ✅ GET USERS
  const getUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // ✅ INPUT CHANGE
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData({ ...newUserData, [name]: value });
  };

  // ✅ ADD USER
  const handleAddUser = async () => {
    try {
      await addUser(newUserData);
      getUsers();
      setNewUserData({
        email: "",
        password: "",
        role: "",
        age: "",
        localistion: "",
        name: "",
      });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // ✅ DELETE USER
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      getUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // ✅ UPDATE USER
  const handleUpdateUser = async () => {
    try {
      await updateUser(newUserData._id, newUserData);
      getUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <>
      {/* TABLE */}
      <div
        className={
          "relative flex flex-col w-full mb-6 shadow-lg rounded " +
          (color === "light" ? "bg-white" : "bg-lightBlue-900 text-white")
        }
      >
        <div className="px-4 py-3">
          <h3
            className={
              "font-semibold text-lg " +
              (color === "light" ? "text-blueGray-700" : "text-white")
            }
          >
            Liste des utilisateurs
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user._id || index}>
                    <td className="p-4 flex items-center">
                      <img
                        src={`http://localhost:5000/images/${user.user_image}`}
                        className="h-12 w-12 rounded-full border"
                        alt="user"
                      />
                      <span className="ml-3 font-bold">
                        {user.name || "No Name"}
                      </span>
                    </td>

                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : ""}
                    </td>

                    <td>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-base px-8 py-3 rounded shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      >
                        Supprimer
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleUpdateUser(user._id)}
                        className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-base px-8 py-3 rounded shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-lightBlue-600">
          Add New User
        </h2>

        <div className="mb-3 pt-0">
          <input
            type="text"
            placeholder="Name"
            className="px-3 py-2 mr-2 border rounded"
            onChange={handleInputChange}
            value={newUserData.name}
            name="name"
          />

          <select
            name="role"
            value={newUserData.role}
            onChange={handleInputChange}
            className="px-3 py-2 mr-2 border rounded"
          >
            <option value="">Choisir un rôle</option>
            <option value="client">Client</option>
            <option value="transporteur">Transporteur</option>
          </select>
          <input
            type="text"
            placeholder="localisation"
            className="px-3 py-2 mr-2 border rounded"
            onChange={handleInputChange}
            value={newUserData.location}
            name="location"
          />

          <input
            type="email"
            placeholder="Email"
            className="px-3 py-2 mr-2 border rounded"
            onChange={handleInputChange}
            value={newUserData.email}
            name="email"
          />

          <input
            type="password"
            placeholder="Password"
            className="px-3 py-2 mr-2 border rounded"
            onChange={handleInputChange}
            value={newUserData.password}
            name="password"
          />

          <div className="mt-3">
            <button
              className="bg-purple-500 mt-2 text-white active:bg-lightBlue-600 font-bold uppercase text-sm px-6 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
              onClick={handleAddUser}
            >
              Add User
            </button>
             <button
            className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-sm px-6 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={() => {
              handleUpdateUser();
            }}
          >
            update
          </button>




            <button
              className="bg-red-500 mt-2 text-white active:bg-lightBlue-600 font-bold uppercase text-sm px-6 py-3 rounded-lg shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
            >
              cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

CardTable.defaultProps = {
  color: "light",
};

CardTable.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};