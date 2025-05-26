import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../../core/config/environment';
import { authApi } from '../api/auth';

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

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,
  loading: false,
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user && data.session) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username || data.user.email!.split('@')[0],
        };
        
        set({
          user,
          token: data.session.access_token,
          loading: false,
          error: null,
        });
        
        return true;
      }
      
      return false;
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user && data.session) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          username,
        };
        
        set({
          user,
          token: data.session.access_token,
          loading: false,
          error: null,
        });
        
        return true;
      }
      
      return false;
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
      await supabase.auth.signOut();
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username || session.user.email!.split('@')[0],
        };
        
        set({
          user,
          token: session.access_token,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          token: null,
          isLoading: false,
        });
      }
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

// Subscribe to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  const state = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session) {
    const user: User = {
      id: session.user.id,
      email: session.user.email!,
      username: session.user.user_metadata.username || session.user.email!.split('@')[0],
    };
    
    useAuthStore.setState({
      user,
      token: session.access_token,
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      token: null,
    });
  }
});
