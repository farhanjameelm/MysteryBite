import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mysterybite.onrender.com',
  withCredentials: true,
});

export default api;
