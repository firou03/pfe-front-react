import axios from "axios";

const API_URL = "http://localhost:5000/transport";

export const createTransportRequest = (data) => {
  return axios.post(`${API_URL}/transportRequest/create`, data);
};