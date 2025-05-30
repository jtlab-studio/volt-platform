import { apiClient } from '../../../api/client';
import { toCamelCase, toSnakeCase } from '../../../core/utils/transform';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', toSnakeCase(data));
      return toCamelCase(response.data);
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/signup', toSnakeCase(data));
      return toCamelCase(response.data);
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async (): Promise<void> => {
    // No backend logout endpoint needed for JWT
    return Promise.resolve();
  },
  
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh');
    return toCamelCase(response.data);
  },
};
