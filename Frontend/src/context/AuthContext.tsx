import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CITIZEN' | 'MUNICIPAL_ADMIN' | 'SUPER_ADMIN';
  rewardPoints: number;
  fakeReportCount: number;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  suspensionUntil?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerUser: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Failed to load user profile", error);
      logout();
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = response.data;
    localStorage.setItem('token', token);
    setUser(loggedUser);
    return loggedUser;
  };

  const registerUser = async (data: any): Promise<void> => {
    await api.post('/auth/register', data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async (): Promise<User> => {
    const response = await api.get('/auth/me');
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
