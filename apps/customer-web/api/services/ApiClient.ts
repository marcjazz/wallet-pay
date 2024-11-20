import axios, { AxiosInstance } from 'axios';
import { AuthService } from './AuthService';

export class ApiClient {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(
    baseURL: string,
    private authToken?: string,
    private refreshToken?: string
  ) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add Authorization header
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Response interceptor to handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 403 && !error.config._retry) {
          const originalRequest = error.config;
          originalRequest._retry = true;

          try {
            const newToken = await this.handleTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  private async handleTokenRefresh(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const authService = new AuthService(this); // Use the authentication service
      const { access_token } = await authService.refreshToken({
        refresh_token: this.refreshToken!,
      });
      this.setAuthToken(access_token);

      // Notify all subscribers with the new token
      this.refreshSubscribers.forEach((callback) => callback(access_token));
      this.refreshSubscribers = [];
      return access_token;
    } catch (error) {
      this.authToken = undefined; // Clear tokens on failure
      this.refreshToken = undefined;
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const res = await this.client.get<T>(url, { params });
      return res.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const res = await this.client.post<T>(url, data);
      return res.data;
  }
}
