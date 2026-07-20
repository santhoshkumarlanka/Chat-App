// lib/axios.js

import axios from "axios";

export const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    withCredentials:true,
})


// Local development:
// http://localhost:5001/api

// Production:
// https://your-backend.azurewebsites.net/api