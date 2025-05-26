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
    const response = await apiClient.post('/auth/login', toSnakeCase(data));
    return toCamelCase(response.data);
  },
  
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signup', toSnakeCase(data));
    return toCamelCase(response.data);
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh');
    return toCamelCase(response.data);
  },
};
