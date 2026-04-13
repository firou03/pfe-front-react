import axios from "axios";

const API_URL = "http://localhost:5000/api/transport-requests"; // ✅ BACKEND URL

export const createTransportRequest = (data) => {
   const token = localStorage.getItem("token");

  return axios.post(`${API_URL}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
};
const token = () => localStorage.getItem("token");

const headers = () => ({
  Authorization: `Bearer ${token()}`,
});

// GET pending requests
export const getPendingRequests = () => {
  return axios.get(`${API_URL}/pending`, { headers: headers() });
};

// ACCEPT request
export const acceptTransportRequest = (id) => {
  return axios.put(`${API_URL}/accept/${id}`, {}, { headers: headers() });
};
// GET mes requests acceptées
export const getMesRequests = () => {
  return axios.get(`${API_URL}/mes-requests`, { headers: headers() });
};