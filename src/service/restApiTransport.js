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

// GET client requests (if backend endpoint exists)
export const getClientRequests = () => {
  return axios.get(`${API_URL}/my-requests`, { headers: headers() });
};

// UPDATE current request location (if backend endpoint exists)
export const updateRequestLocation = (id, data) => {
  return axios.put(`${API_URL}/update-location/${id}`, data, { headers: headers() });
};

// DELIVER request
export const deliverTransportRequest = (id) => {
  return axios.put(`${API_URL}/deliver/${id}`, {}, { headers: headers() });
};

// CONFIRM request (client confirms transporter)
export const confirmRequest = (id) => {
  return axios.patch(`${API_URL}/${id}/confirm`, {}, { headers: headers() });
};

// REFUSE request (client refuses transporter)
export const refuseRequest = (id) => {
  return axios.patch(`${API_URL}/${id}/refuse`, {}, { headers: headers() });
};

// GET client requests for dashboard
export const getClientRequestsForDashboard = () => {
  return axios.get(`${API_URL}/my-requests/client`, { headers: headers() });
};

// ────────────────────────────────────────
// 📢 NOTIFICATION API FUNCTIONS
// ────────────────────────────────────────

const NOTIFICATIONS_URL = "http://localhost:5000/api/notifications";

// GET all notifications
export const getNotifications = () => {
  return axios.get(`${NOTIFICATIONS_URL}`, { headers: headers() });
};

// GET unread count
export const getUnreadCount = () => {
  return axios.get(`${NOTIFICATIONS_URL}/unread-count`, { headers: headers() });
};

// PATCH mark notification as read
export const markNotificationRead = (id) => {
  return axios.patch(`${NOTIFICATIONS_URL}/${id}/read`, {}, { headers: headers() });
};

// PATCH mark all notifications as read
export const markAllNotificationsRead = () => {
  return axios.patch(`${NOTIFICATIONS_URL}/read-all`, {}, { headers: headers() });
};

// DELETE a notification
export const deleteNotification = (id) => {
  return axios.delete(`${NOTIFICATIONS_URL}/${id}`, { headers: headers() });
};