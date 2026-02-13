import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, updateProfile, UserData, RegisterData } from '../services/api';

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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }, images?: File[]) => Promise<void>;
  updateUser: (data: { name?: string; avatar?: string }) => Promise<void>;
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
        localStorage.removeItem('nexattend_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      
      // Store token
      localStorage.setItem('nexattend_token', response.access_token);
      
      // Map API response to User format
      const newUser: User = {
        id: response.user.id,
        name: response.user.full_name,
        email: response.user.email,
        role: response.user.role as 'teacher' | 'student',
        avatar: response.user.avatar
      };
      
      setUser(newUser);
      localStorage.setItem('nexattend_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }, images?: File[]) => {
    setIsLoading(true);
    console.log('Registering with images:', images);
    
    try {
      const registerData: RegisterData = {
        full_name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      };
      
      const response = await registerUser(registerData);
      
      // Map API response to User format
      const newUser: User = {
        id: response.id,
        name: response.full_name,
        email: response.email,
        role: response.role as 'teacher' | 'student',
      };
      
      setUser(newUser);
      localStorage.setItem('nexattend_user', JSON.stringify(newUser));
      
      // Note: Token will be obtained on subsequent login
      // For auto-login after registration, call login API
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: { name?: string; avatar?: string }) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const apiData: { full_name?: string; avatar?: string } = {};
      if (data.name) apiData.full_name = data.name;
      if (data.avatar) apiData.avatar = data.avatar;
      
      const updatedUserFn = await updateProfile(apiData);
      
      const updatedUser: User = {
        ...user,
        name: updatedUserFn.full_name,
        avatar: updatedUserFn.avatar
      };
      
      setUser(updatedUser);
      localStorage.setItem('nexattend_user', JSON.stringify(updatedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexattend_user');
    localStorage.removeItem('nexattend_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      updateUser,
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
