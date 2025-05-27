import axios, { AxiosError, AxiosInstance } from 'axios';
import { env } from '../core/config/environment';
import { useAuthStore } from '../features/auth/stores/authStore';
import { AuthenticationError, NetworkError } from '../core/utils/errors';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 60000, // Increase timeout to 60 seconds for large files
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const state = useAuthStore.getState();
      const token = state.token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log requests in development
      if (env.isDevelopment) {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data instanceof FormData) {
          console.log('[API] Uploading FormData');
        }
      }
      
      return config;
    },
    (error) => {
      console.error('[API] Request error:', error);
      return Promise.reject(error);
    }
  );
  
  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => {
      if (env.isDevelopment) {
        console.log(`[API] Response ${response.status} from ${response.config.url}`);
      }
      return response;
    },
    async (error: AxiosError) => {
      console.error('[API] Response error:', error);
      
      if (!error.response) {
        // Network error - no response received
        console.error('[API] Network error - no response received');
        console.error('[API] Error details:', error.message);
        
        if (error.code === 'ECONNABORTED') {
          throw new NetworkError('Request timeout. The file might be too large.');
        }
        
        throw new NetworkError('Network error occurred. Please check if the backend server is running.');
      }
      
      console.error(`[API] Error response ${error.response.status} from ${error.config?.url}`);
      console.error('[API] Error data:', error.response.data);
      
      if (error.response.status === 401) {
        // Clear auth state and redirect to login
        const currentPath = window.location.pathname;
        
        // Only clear auth and redirect if we're not already on auth pages
        if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        
        throw new AuthenticationError('Session expired. Please login again.');
      }
      
      // Extract error message from response
      const errorData = error.response.data as any;
      const message = errorData?.error || errorData?.message || 'An error occurred';
      
      throw new Error(message);
    }
  );
  
  return client;
};

export const apiClient = createApiClient();
