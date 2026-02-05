import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Define User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: Omit<User, 'id'>) => Promise<void>;
  register: (userData: Omit<User, 'id'> | FormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('nexattend_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from local storage', error);
        localStorage.removeItem('nexattend_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (userData: Omit<User, 'id'>) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', userData);
      const { user, token } = response.data;
      
      setUser(user);
      localStorage.setItem('nexattend_user', JSON.stringify(user));
      localStorage.setItem('nexattend_token', token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'> | FormData) => {
    setIsLoading(true);
    try {
      let response;
      
      // Check if userData is FormData (for student registration with images)
      if (userData instanceof FormData) {
        response = await api.post('/students/register', userData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Standard user registration (teacher)
        response = await api.post('/auth/register', userData);
      }
      
      const { user, token } = response.data;
      
      setUser(user);
      localStorage.setItem('nexattend_user', JSON.stringify(user));
      localStorage.setItem('nexattend_token', token);
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexattend_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
