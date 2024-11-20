import axios, { AxiosInstance } from 'axios';

/**
 * Base API client to handle HTTP requests.
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, private authToken?: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Automatically add Authorization header if token is set
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.client.get<T>(url, { params }).then((res) => res.data);
  }

  post<T>(url: string, data: any): Promise<T> {
    return this.client.post<T>(url, data).then((res) => res.data);
  }
}
