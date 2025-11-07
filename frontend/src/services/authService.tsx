import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  personal_brand_brief: {
    has_brand_brief: boolean;
    original_filename?: string;
    updated_at?: string;
  };
  company_brand_brief: {
    has_brand_brief: boolean;
    original_filename?: string;
    updated_at?: string;
  };
  active_brand_brief: string;
  has_any_brand_brief: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

class AuthService {
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', loginData);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || "Invalid credentials");
    }
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/register', signupData);
      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.error || "Error signing up");
    }
  }

  async getCurrentUser(token: string): Promise<{ user: User }> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(error.response?.data?.error || "Could not fetch user");
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw new Error(error.response?.data?.error || "Could not refresh token");
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.response?.data?.error || "Logout failed");
    }
  }

  // Token management
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();