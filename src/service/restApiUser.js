import axios from "axios";
const API_URL = "http://localhost:5000/users";
export async function getAllUsers() {
    return await axios.get(`${API_URL}/getAllUsers`)  
};

export async function deleteUser(id) {
    return await axios.delete(`${API_URL}/deleteUser/${id}`)
};