import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockAuth } from '../services/mockBackend';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = mockAuth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
        const loggedInUser = await mockAuth.login(email);
        if (loggedInUser) {
            setUser(loggedInUser);
            return true;
        }
        return false;
    } finally {
        setLoading(false);
    }
  };

  const register = async (email: string, name: string) => {
    setLoading(true);
    try {
        const newUser = await mockAuth.register(email, name);
        setUser(newUser);
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
      await mockAuth.logout();
      setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
