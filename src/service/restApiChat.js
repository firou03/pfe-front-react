import axios from "axios";

const API_URL = "http://localhost:5000/api/chat";

const token = () => localStorage.getItem("token");
const headers = () => ({
  Authorization: `Bearer ${token()}`,
  "Content-Type": "application/json",
});

// GET all conversations for current user
export const getConversations = () => {
  return axios.get(`${API_URL}/conversations`, { headers: headers() });
};

// GET messages for a specific conversation
export const getMessages = (conversationId) => {
  return axios.get(`${API_URL}/messages/${conversationId}`, { headers: headers() });
};

// POST send a new message
export const sendMessage = (conversationId, messageData) => {
  return axios.post(`${API_URL}/send/${conversationId}`, messageData, { headers: headers() });
};

// POST create a new conversation
export const createConversation = (participantId, requestId) => {
  return axios.post(`${API_URL}/create`, { participantId, requestId }, { headers: headers() });
};

// GET conversation by request ID
export const getConversationByRequest = (requestId) => {
  return axios.get(`${API_URL}/by-request/${requestId}`, { headers: headers() });
};

// PUT mark messages as read
export const markMessagesAsRead = (conversationId) => {
  return axios.put(`${API_URL}/read/${conversationId}`, {}, { headers: headers() });
};
