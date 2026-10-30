import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { ApiResponse } from '@gym-app/shared-types';

// Default to Cloudflare local worker dev URL or production
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8787',
  ios: 'http://localhost:8787',
  default: 'http://localhost:8787',
});

// Storage helper with web fallback
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export class ApiClient {
  private static token: string | null = null;
  private static baseUrl = BASE_URL;

  static setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  static getBaseUrl() {
    return this.baseUrl;
  }

  static async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await storage.setItem('auth_token', token);
    } else {
      await storage.deleteItem('auth_token');
    }
  }

  static async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await storage.getItem('auth_token');
    }
    return this.token;
  }

  static async setRefreshToken(token: string | null) {
    if (token) {
      await storage.setItem('refresh_token', token);
    } else {
      await storage.deleteItem('refresh_token');
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    return storage.getItem('refresh_token');
  }

  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration & automatic refresh
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        const refreshToken = await this.getRefreshToken();
        if (refreshToken) {
          const refreshRes = await fetch(`${this.baseUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.token) {
            await this.setToken(refreshData.data.token);
            await this.setRefreshToken(refreshData.data.refresh_token);
            // Retry original request
            headers.set('Authorization', `Bearer ${refreshData.data.token}`);
            const retryRes = await fetch(url, { ...options, headers });
            return retryRes.json();
          }
        }
      }

      return response.json();
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Unable to connect to Cloudflare serverless backend',
        },
      };
    }
  }

  static get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  static post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  }

  static put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    });
  }

  static patch<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    });
  }

  static delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

