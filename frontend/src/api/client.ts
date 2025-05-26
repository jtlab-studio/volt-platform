import axios, { AxiosError, AxiosInstance } from 'axios';
import { env } from '../core/config/environment';
import { useAuthStore } from '../features/auth/stores/authStore';
import { AuthenticationError, NetworkError } from '../core/utils/errors';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (!error.response) {
        throw new NetworkError('Network error occurred. Please check your connection.');
      }
      
      if (error.response.status === 401) {
        // Clear auth state and redirect to login
        useAuthStore.getState().logout();
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
