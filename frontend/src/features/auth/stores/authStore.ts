import { create } from 'zustand';
import { env } from '../../../core/config/environment';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  loading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

// For development without Supabase
const mockAuth = {
  login: async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
    // Mock authentication - accept any email/password in dev
    if (email && password) {
      return {
        user: {
          id: 'dev-user-1',
          email,
          username: email.split('@')[0],
        },
        token: 'dev-token-123',
      };
    }
    return null;
  },
  
  signup: async (email: string, username: string, password: string): Promise<{ user: User; token: string } | null> => {
    if (email && username && password) {
      return {
        user: {
          id: 'dev-user-1',
          email,
          username,
        },
        token: 'dev-token-123',
      };
    }
    return null;
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,
  loading: false,
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      // Use mock auth in development
      const result = await mockAuth.login(email, password);
      
      if (result) {
        set({
          user: result.user,
          token: result.token,
          loading: false,
          error: null,
        });
        return true;
      }
      
      throw new Error('Invalid credentials');
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Login failed',
      });
      return false;
    }
  },
  
  signup: async (email, username, password) => {
    set({ loading: true, error: null });
    
    try {
      // Use mock auth in development
      const result = await mockAuth.signup(email, username, password);
      
      if (result) {
        set({
          user: result.user,
          token: result.token,
          loading: false,
          error: null,
        });
        return true;
      }
      
      throw new Error('Signup failed');
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Signup failed',
      });
      return false;
    }
  },
  
  logout: async () => {
    set({ loading: true });
    
    try {
      // Simple logout for development
      set({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Logout failed',
      });
    }
  },
  
  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Check if we have a stored session (in a real app, this would check localStorage/cookies)
      // For now, just set as not authenticated
      set({
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isLoading: false,
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));

// Note: When ready to integrate Supabase, uncomment the following:
/*
import { createClient } from '@supabase/supabase-js';

const supabase = env.supabaseUrl && env.supabaseAnonKey 
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;

// Then replace mock auth with real Supabase auth
*/
