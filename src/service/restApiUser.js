import axios from "axios";

const API_URL = "http://localhost:5000/users";

// REGISTER
export const registerUser = (data) => {
  return axios.post(`${API_URL}/CreateUser`, data);
};

// LOGIN
export const loginUser = (data) => {
  return axios.post("http://localhost:5000/api/auth/login", data);
};

// GET USERS
export async function getAllUsers() {
  return await axios.get(`${API_URL}/getAllUsers`);
}

// DELETE
export async function deleteUser(id) {
  return await axios.delete(`${API_URL}/deleteUser/${id}`);
}

// ADD USER
export async function addUser(userData) {
  return await axios.post(`${API_URL}/addUser`, userData);
}

// UPDATE USER
export async function updateUser(id, userData) {
  return await axios.put(`${API_URL}/updateUser/${id}`, userData);
}

// GET BY ID
export async function getUserById(id) {
  return await axios.get(`${API_URL}/getUserById/${id}`);
}