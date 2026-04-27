import axios from "axios";

const API_URL = "http://localhost:5000/users";


// REGISTER — JSON ou FormData (ex. permis transporteur en fichier)
export const registerUser = (data) => {
  return axios.post(`${API_URL}/createUser`, data);
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

// FORGOT PASSWORD
export async function forgotPassword(email) {
  return await axios.post(`http://localhost:5000/api/auth/forgot-password`, { email });
}

// RESET PASSWORD
export async function resetPassword(token, password) {
  return await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
}

// UPLOAD PROFILE PICTURE
export async function uploadProfilePicture(userId, file) {
  const formData = new FormData();
  formData.append('user_image', file);
  return await axios.put(`${API_URL}/updateProfilePicture/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}