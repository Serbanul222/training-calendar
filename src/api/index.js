import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Can be moved to .env file
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // For cookies/credentials if needed
});

// Add interceptors for handling errors, authentication, etc.
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Global error handling
    console.error('API Error:', error.response?.data || error);
    return Promise.reject(error);
  }
);

export default apiClient;