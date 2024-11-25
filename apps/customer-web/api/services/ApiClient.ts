import axios, { AxiosInstance } from 'axios';
import { AccessTokenResponse } from '../types';
import { AuthService } from './AuthService';

export class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: AccessTokenResponse) => void)[] = [];
  private static currentInstance: ApiClient;

  private constructor(
    baseURL: string,
    private authToken?: AccessTokenResponse
  ) {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      this.authToken = JSON.parse(storedToken);
    }

    this.client = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add Authorization header
    this.client.interceptors.request.use(async (config) => {
      if (this.authToken) {
        const { issued_at, expires_in } = this.authToken;
        const isTokenExpired = Date.now() >= issued_at + expires_in;

        if (isTokenExpired) {
          this.authToken = await this.handleTokenRefresh();
        }

        config.headers.Authorization = `Bearer ${this.authToken.access_token}`;
      }
      return config;
    });
  }

  setAuthToken(token: AccessTokenResponse): void {
    this.authToken = token;
    localStorage.setItem('authToken', JSON.stringify(token));
  }

  private async handleTokenRefresh(): Promise<AccessTokenResponse> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const authService = new AuthService(this); // Use the authentication service
      const tokenResp = await authService.refreshToken();
      this.setAuthToken(tokenResp);

      // Notify all subscribers with the new token
      this.refreshSubscribers.forEach((callback) => callback(tokenResp));
      this.refreshSubscribers = [];
      return tokenResp;
    } catch (error) {
      this.authToken = undefined; // Clear tokens on failure
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.client.get<T>(url, { params });
    return res.data;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const res = await this.client.post<T>(url, data);
    return res.data;
  }

  static getInstance(
    baseURL: string,
    authToken?: AccessTokenResponse
  ): ApiClient {
    if (!ApiClient.currentInstance) {
      ApiClient.currentInstance = new ApiClient(baseURL, authToken);
    }
    return ApiClient.currentInstance;
  }
}
