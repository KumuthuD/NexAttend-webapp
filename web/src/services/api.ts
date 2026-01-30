import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
    baseURL: 'http://localhost:8000', // Default FastAPI port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor for global error handling (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API call failed:', error);
        return Promise.reject(error);
    }
);

// Basic health check function to verify connection
export const healthCheck = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};

export default api;
