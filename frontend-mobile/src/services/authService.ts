import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api/mobile' 
  : 'https://your-production-api.com/api/mobile';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class AuthService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post('/auth/login', {
        email,
        password,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 403) {
        errorMessage = 'Account is inactive';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post('/auth/register', userData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Register error:', error);
      
      let errorMessage = 'Registration failed';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid data or email already exists';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response: AxiosResponse<boolean> = await this.apiClient.post('/auth/validate', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Helper method to set authorization header for authenticated requests
  setAuthToken(token: string | null) {
    if (token) {
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.apiClient.defaults.headers.common['Authorization'];
    }
  }

  // Get authenticated API client for other services
  getAuthenticatedClient() {
    return this.apiClient;
  }
}

export const authService = new AuthService();
