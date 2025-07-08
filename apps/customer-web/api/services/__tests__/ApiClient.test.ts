import axios from 'axios';
import { AccessTokenResponse } from '../../types';
import { ApiClient } from '../ApiClient';

jest.mock('axios');

const mockInterceptor = {
  request: {
    use: jest.fn((successHandle) => {
      (mockInterceptor.request as any).handler = successHandle;
      return 123;
    }),
    eject: jest.fn(),
    clear: jest.fn()
  },
  response: {
    use: jest.fn(),
    eject: jest.fn(),
    clear: jest.fn()
  }
};

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.create to return our mocked axios instance
(mockedAxios.create as jest.Mock).mockReturnValue({
  ...mockedAxios,
  interceptors: mockInterceptor
});

const mockToken: AccessTokenResponse = {
  access_token: 'test_access_token',
  issued_at: Date.now(),
  expires_in: 900000,
  token_type: 'Bearer'
};
const mockRefreshToken: { data: AccessTokenResponse } = {
  data: {
    access_token: 'new_token',
    expires_in: 900000,
    issued_at: Date.now(),
    token_type: 'Bearer'
  }
};

// Mock window location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true
});

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const baseURL = 'http://localhost:5000';

  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    localStorage.clear();

    // Create a new instance of ApiClient for each test
    apiClient = ApiClient.getInstance(baseURL);
  });

  describe('request interceptor', () => {
    describe('when authToken is set and not expired', () => {
      it('should add Authorization header', async () => {
        // Set up mock interceptor
        apiClient.setAuthToken(mockToken);

        //   Mock an API call
        mockedAxios.get.mockResolvedValue({ data: {} });
        await apiClient.get('/test');

        // Get the registered request interceptor
        const requestInterceptor = (mockInterceptor.request as any).handler;

        const config = { headers: {}, url: '/test' };

        const result = await requestInterceptor(config);

        expect(result.headers.Authorization).toBe(
          `Bearer ${mockToken.access_token}`
        );
      });
    });
    describe('when authToken is set and critical', () => {
      beforeEach(() => {
        // Mock the refresh endpoind response
        mockedAxios.post.mockReset();
        mockedAxios.post.mockResolvedValue(mockRefreshToken);
      });
      it('should refresh token if it is about to expire', async () => {
        // Set up mock interceptor
        apiClient.setAuthToken({
          ...mockToken,
          expires_in: 3600
        });

        //   Mock an API call
        mockedAxios.get.mockResolvedValueOnce({ data: {} });

        // Get the registered request interceptor
        const requestInterceptor = (mockInterceptor.request as any).handler;
        const config = { headers: {}, url: '/protected' };
        await requestInterceptor(config);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/refresh'),
          {},
          { withCredentials: true }
        );
        expect(apiClient.getAuthToken()).toEqual(mockRefreshToken.data);
      });
      it('should add Authorization header', async () => {
        // Set up mock interceptor
        apiClient.setAuthToken({
          ...mockToken,
          expires_in: 3600
        });

        //   Mock an API call
        mockedAxios.get.mockResolvedValueOnce({ data: {} });
        // await apiClient.get('/test');

        // Get the registered request interceptor
        const requestInterceptor = (mockInterceptor.request as any).handler;
        const config = { headers: {}, url: '/protected' };

        const result = await requestInterceptor(config);

        expect(result.headers.Authorization).toBe(
          `Bearer ${mockRefreshToken.data.access_token}`
        );
      });
    });

    describe('when token is set and expired', () => {
      beforeEach(() => {
        // Mock the refresh endpoind response
        mockedAxios.post.mockReset();
        mockedAxios.post.mockResolvedValue(mockRefreshToken);
      });

      it('should clear auth token and redirect', async () => {
        apiClient.setAuthToken({
          ...mockToken,
          expires_in: 0
        });
        //   Mock an API call
        mockedAxios.get.mockResolvedValueOnce({ data: {} });

        // Get the registered request interceptor
        const requestInterceptor = (mockInterceptor.request as any).handler;
        const config = { headers: {}, url: '/protected' };

        // verify the error is throw
        await expect(requestInterceptor(config)).rejects.toThrow(
          'Token expired, redirecting to login'
        );

        // verify redirect
        expect(window.location.href).toBe('/login');

        // verify token was clear
        expect(apiClient.getAuthToken()).toBeUndefined();
      });
    });
  });
});
