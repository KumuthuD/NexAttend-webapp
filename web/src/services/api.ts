import axios from 'axios';

// Types for auth responses
export interface UserData {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
    avatar?: string;
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

export interface DashboardStats {
    total_students: number;
    total_classrooms: number;
    total_sessions: number;
    todays_attendance_count: number;
    attendance_percentage: number;
}

export interface AttendanceRecord {
    id: string;
    date: string;
    classroom_name: string;
    session_label: string;
    status: 'present' | 'absent';
    confidence?: number;
}

// Create an Axios instance with a base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
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

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/v1/dashboard/stats');
    return response.data;
};

export const getAttendanceHistory = async (classroomId?: string): Promise<AttendanceRecord[]> => {
    const params = classroomId ? { classroom_id: classroomId } : {};
    const response = await api.get<AttendanceRecord[]>('/api/v1/attendance/history', { params });
    return response.data;
};

// Auth API functions
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', {
        email,
        password,
    });
    return response.data;
};

export const registerUser = async (data: RegisterData, images?: File[]): Promise<UserData> => {
    const formData = new FormData();
    formData.append('full_name', data.full_name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('role', data.role);

    if (images && images.length > 0) {
        images.forEach((file) => {
            formData.append('files', file);
        });
    }

    const response = await api.post<UserData>('/api/v1/auth/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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

export const updateProfile = async (data: { full_name?: string; avatar?: string }): Promise<UserData> => {
    const response = await api.put<UserData>('/api/v1/users/me', data);
    return response.data;
};

export default api;
