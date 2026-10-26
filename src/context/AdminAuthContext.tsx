import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthService, AdminUser, AdminLoginCredentials, AdminAuthResponse } from '../services/adminAuthService';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AdminLoginCredentials) => Promise<AdminAuthResponse>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    try {
      const session = adminAuthService.getStoredSession();
      if (session.token && session.user) {
        setToken(session.token);
        setAdminUser(session.user);
      }
    } catch (err) {
      console.error('Error verifying admin session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: AdminLoginCredentials): Promise<AdminAuthResponse> => {
    setIsLoading(true);
    try {
      const res = await adminAuthService.login(credentials);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setAdminUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    adminAuthService.logout();
    setToken(null);
    setAdminUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    return await adminAuthService.requestPasswordReset(email);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: !!token && !!adminUser && adminUser.role === 'admin',
        isLoading,
        login,
        logout,
        requestPasswordReset
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
