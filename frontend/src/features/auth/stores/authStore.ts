import { create } from 'zustand';
import { authApi } from '../../auth/api/auth';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,
  loading: false,
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authApi.login({ email, password });
      
      set({
        user: response.user,
        token: response.token,
        loading: false,
        error: null,
      });
      
      // Store token in memory only (as per requirements)
      // The API client will access it from the store
      
      return true;
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
      const response = await authApi.signup({ email, username, password });
      
      set({
        user: response.user,
        token: response.token,
        loading: false,
        error: null,
      });
      
      return true;
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
      // Clear local state
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
      // Check if we have a token in the current state
      const currentToken = get().token;
      
      if (!currentToken) {
        set({
          user: null,
          token: null,
          isLoading: false,
        });
        return;
      }
      
      // In a real app, you might validate the token here
      // For now, just keep the existing state
      set({ isLoading: false });
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
