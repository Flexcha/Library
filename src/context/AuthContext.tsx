import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: (role: UserRole | 'GUEST') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      if (localStorage.getItem('accessToken')) {
        const profile = await api.me();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setToken(data.accessToken);
      const profile = await api.me();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      await api.register(formData);
      // Auto login after register
      await login(formData.email, formData.password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') || undefined;
    try {
      await api.logout(refreshToken);
    } catch {
      // Ignore error on logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setToken(null);
  };

  const switchAccount = async (role: UserRole | 'GUEST') => {
    if (role === 'GUEST') {
      await logout();
      return;
    }

    const credentials: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@library.com', pass: 'Admin123!' },
      LIBRARIAN: { email: 'librarian@library.com', pass: 'Librarian123!' },
      MEMBER: { email: 'member1@library.com', pass: 'Member123!' },
    };

    const cred = credentials[role];
    if (cred) {
      await login(cred.email, cred.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, switchAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
