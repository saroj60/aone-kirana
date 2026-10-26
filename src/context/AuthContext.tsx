import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

import { API_BASE_URL } from '../config/api';
import { customerService } from '../services/customerService';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin' | 'rider';
  email?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  registerCustomer: (name: string, phone: string, password?: string, address?: string) => Promise<AuthResponse>;
  loginCustomer: (phoneOrEmail: string, password?: string) => Promise<AuthResponse>;
  signIn: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (emailOrPhone: string, password?: string, fullName?: string, phone?: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default guest profile when running offline or initial visit
const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-user-1',
  fullName: 'Saroj Shrestha',
  phone: '9841234567',
  address: 'Ward 5, Tikathali Chowk, Lalitpur',
  role: 'customer'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('aone_kirana_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isConfigured = isSupabaseConfigured();

  // Check backend session or Supabase session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const customerToken = localStorage.getItem('aone_kirana_customer_token');
        if (customerToken) {
          const res = await fetch(`${API_BASE_URL}/auth/customer/me`, {
            headers: {
              Authorization: `Bearer ${customerToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              const up: UserProfile = {
                id: data.user.id,
                fullName: data.user.name,
                phone: data.user.phone,
                address: data.user.address || 'Ward 5, Tikathali Chowk, Lalitpur',
                role: data.user.role || 'customer',
                email: data.user.email
              };
              setProfile(up);
              localStorage.setItem('aone_kirana_user_profile', JSON.stringify(up));
              customerService.saveRegisteredCustomer(up);
            }
          }
        }
      } catch (err) {
        console.warn('Backend customer session check skipped:', err);
      }

      // Sync active stored profile to admin customers list
      const savedProfile = localStorage.getItem('aone_kirana_user_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed && parsed.phone) {
            customerService.saveRegisteredCustomer(parsed);
          }
        } catch (e) {
          // ignore
        }
      }

      if (isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
        } catch (e) {
          console.warn('Supabase auth session error:', e);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [isConfigured]);

  /**
   * Register customer by Name and Phone number
   */
  const registerCustomer = async (
    name: string,
    phone: string,
    password = 'password123',
    address = 'Ward 5, Tikathali Chowk, Lalitpur'
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/customer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password,
          address: address.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Registration failed. Please check your details.'
        };
      }

      // Success
      if (data.token) {
        localStorage.setItem('aone_kirana_customer_token', data.token);
      }

      const newProfile: UserProfile = {
        id: data.user.id,
        fullName: data.user.name,
        phone: data.user.phone,
        address: data.user.address,
        role: data.user.role || 'customer'
      };

      setProfile(newProfile);
      localStorage.setItem('aone_kirana_user_profile', JSON.stringify(newProfile));
      customerService.saveRegisteredCustomer(newProfile);

      return {
        success: true,
        message: data.message || 'Account registered successfully!',
        user: newProfile
      };
    } catch (err: any) {
      console.warn('Backend register failed, falling back to local storage:', err);
      // Offline / fallback registration
      const newProfile: UserProfile = {
        id: `local-${Date.now()}`,
        fullName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        role: 'customer'
      };
      setProfile(newProfile);
      localStorage.setItem('aone_kirana_user_profile', JSON.stringify(newProfile));
      customerService.saveRegisteredCustomer(newProfile);
      return {
        success: true,
        message: `Welcome to Aone Kirana, ${name}! Registered successfully.`,
        user: newProfile
      };
    }
  };

  /**
   * Login customer by Phone or Email
   */
  const loginCustomer = async (phoneOrEmail: string, password = ''): Promise<AuthResponse> => {
    try {
      const isEmail = phoneOrEmail.includes('@');
      const payload: any = { password };
      if (isEmail) {
        payload.email = phoneOrEmail.trim();
      } else {
        payload.phone = phoneOrEmail.trim();
      }

      const res = await fetch(`${API_BASE_URL}/auth/customer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Failed to sign in. Please verify your credentials.'
        };
      }

      if (data.token) {
        localStorage.setItem('aone_kirana_customer_token', data.token);
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        fullName: data.user.name,
        phone: data.user.phone,
        address: data.user.address || 'Ward 5, Tikathali Chowk, Lalitpur',
        role: data.user.role || 'customer'
      };

      setProfile(userProfile);
      localStorage.setItem('aone_kirana_user_profile', JSON.stringify(userProfile));

      return {
        success: true,
        message: data.message || `Welcome back, ${userProfile.fullName}!`,
        user: userProfile
      };
    } catch (err: any) {
      console.warn('Backend login failed, fallback:', err);
      return {
        success: false,
        error: 'Unable to reach authentication server. Please check your connection.'
      };
    }
  };

  /**
   * Sign In wrapper
   */
  const signIn = async (emailOrPhone: string, password = '') => {
    const res = await loginCustomer(emailOrPhone, password);
    return {
      success: res.success,
      error: res.error
    };
  };

  /**
   * Sign Up wrapper (Name & Phone primary)
   */
  const signUp = async (
    emailOrPhone: string,
    password = '',
    fullName = '',
    phone = '',
    address = 'Ward 5, Tikathali Chowk, Lalitpur'
  ) => {
    const resolvedName = fullName.trim() || 'New Customer';
    const resolvedPhone = phone.trim() || (emailOrPhone.includes('@') ? '' : emailOrPhone.trim());
    const res = await registerCustomer(resolvedName, resolvedPhone, password, address);
    return {
      success: res.success,
      error: res.error
    };
  };

  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem('aone_kirana_customer_token');
    localStorage.removeItem('aone_kirana_user_profile');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return { success: false, error: 'No profile found' };

    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem('aone_kirana_user_profile', JSON.stringify(updated));

    const token = localStorage.getItem('aone_kirana_customer_token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/customer/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: updated.fullName,
            phone: updated.phone,
            address: updated.address
          })
        });
      } catch (e) {
        console.warn('Failed to sync profile update to backend:', e);
      }
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured,
        registerCustomer,
        loginCustomer,
        signIn,
        signUp,
        signOut,
        updateProfile,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
