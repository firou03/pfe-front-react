import axio from 'axios';

//http://localhost:5000 Global URL for API

//http:localhost:5000/Users gestion des utilisateurs
//http:localhost:5000/reservations gestion des reservations
//http:localhost:5000/rooms gestion des chambres

const API_URL = 'http://localhost:5000/Users';

//http:localhost:5000/Users/getAllUsers get all users
//http:localhost:5000/Users/getUserById/:id get user by id
//http:localhost:5000/Users/addUser add user
//http:localhost:5000/Users/updateUser/:id update user
//http:localhost:5000/Users/deleteUser/:id delete user

//get => recuperer les données
//post => ajouter des données
//put => modifier des données
//delete => supprimer des données

//get all users

export async function getAllUsers() {
    return await axio.get(`${API_URL}/getAllUsers`);    
}

export async function deleteUser(id) {
    return await axio.delete(`${API_URL}/deleteUser/${id}`);
}

export async function addUser(userData) {
    return await axio.post(`${API_URL}/addUser`, userData);
}

export async function updateUser(id, userData) {
    return await axio.put(`${API_URL}/updateUser/${id}`, userData);
}

export async function getUserById(id) {
    return await axio.get(`${API_URL}/getUserById/${id}`);
}

export async function getbyEmail(email) {
    return await axio.get(`${API_URL}/getbyEmail/`,email);
}