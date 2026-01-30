import axios from 'axios';

// Create an Axios instance with a base URL
const api = axios.create({
    baseURL: 'http://localhost:8000', // Update this if your backend runs on a different port
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
