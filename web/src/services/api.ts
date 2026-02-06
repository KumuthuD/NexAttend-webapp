import axios from 'axios';

// Types for auth responses
export interface UserData {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: UserData;
}

export interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    role: string;
}

// Create an Axios instance with a base URL
const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('nexattend_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API call failed:', error);
        // Handle 401 unauthorized - clear token and redirect
        if (error.response?.status === 401) {
            localStorage.removeItem('nexattend_token');
            localStorage.removeItem('nexattend_user');
        }
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

// Auth API functions
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', {
        email,
        password,
    });
    return response.data;
};

export const registerUser = async (data: RegisterData): Promise<UserData> => {
    const response = await api.post<UserData>('/api/v1/auth/register', data);
    return response.data;
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
