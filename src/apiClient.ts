// api/apiClient.ts
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Base API client configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});


export default apiClient;