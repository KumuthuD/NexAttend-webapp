import axios from 'axios';

// Create an Axios instance with a base URL
const api = axios.create({
    baseURL: 'http://localhost:8000', // Update this if your backend runs
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



// Student Registration with Face Data
export const registerStudent = async (studentData: FormData) => {
    try {
        const response = await api.post('/students/register', studentData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Student registration failed:', error);
        throw error;
    }
};

export default api;
