/**
 * ============================================================================
 * HTTP API Client with Flexible Mock Fallback & Auth Token Support
 * ============================================================================
 * This client provides a unified fetch interface for all backend services.
 * Features:
 *  - Automatic JWT Authorization header injection
 *  - Configurable timeout
 *  - Graceful fallback to mock data when backend is not reached or during development
 *  - Unwraps both standard { success: true, data: T } and direct T responses
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';

// Storage key for authentication token
export const AUTH_TOKEN_KEY = "@police_app_auth_token";
export const REFRESH_TOKEN_KEY = "@police_app_refresh_token";

// Base API URL from Expo environment or localhost
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// Toggle to force mock mode if desired (default: false, falls back gracefully)
const FORCE_MOCK_MODE =
  process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

/**
 * Global token cache in memory for fast access
 */
let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
  if (token) {
    AsyncStorage.setItem(AUTH_TOKEN_KEY, token).catch(() => {});
  } else {
    AsyncStorage.removeItem(AUTH_TOKEN_KEY).catch(() => {});
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (inMemoryToken) {
    return inMemoryToken;
  }
  try {
    const stored = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    inMemoryToken = stored;
    return stored;
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null): void {
  inMemoryRefreshToken = token;
  if (token) {
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, token).catch(() => {});
  } else {
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY).catch(() => {});
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (inMemoryRefreshToken) {
    return inMemoryRefreshToken;
  }
  try {
    const stored = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    inMemoryRefreshToken = stored;
    return stored;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const url = `${API_BASE_URL.replace(/\/$/, "")}/auth/refresh`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const json = await response.json();
  const data = (json && typeof json === "object" && "success" in json && "data" in json) ? json.data : json;
  
  if (data?.accessToken) {
    setAuthToken(data.accessToken);
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    return data.accessToken;
  }
  
  throw new Error("Invalid refresh response");
}

/**
 * Options for apiRequest
 */
export type ApiRequestOptions<T> = RequestInit & {
  /**
   * Optional fallback mock function or data to use when backend is unavailable
   */
  mockFallback?: () => Promise<T> | T;
  /**
   * Request timeout in milliseconds (default: 8000ms)
   */
  timeoutMs?: number;
  /**
   * Query parameters object: { status: 'OPEN', page: 1 } -> ?status=OPEN&page=1
   */
  queryParams?: Record<string, string | number | boolean | undefined | null>;
  /**
   * Internal flag for retry after refresh
   */
  _isRetry?: boolean;
};

/**
 * Main API Request function.
 * Attempts HTTP network request. If FORCE_MOCK_MODE is enabled or if network
 * request fails/times out, it executes the provided `mockFallback` function.
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: ApiRequestOptions<T>
): Promise<T> {
  const { mockFallback, timeoutMs = 8000, queryParams, _isRetry, ...fetchOptions } =
    options || {};

  // If force mock mode is active and a mock provider is given, use it immediately
  if (FORCE_MOCK_MODE && mockFallback) {
    // Simulate brief network latency for realistic loading states (150-300ms)
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockFallback();
  }

  // Build full URL with query parameters if present
  let url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  if (queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // Attach auth token if available
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Controller for network timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 && !_isRetry) {
        try {
          await refreshAccessToken();
          return await apiRequest<T>(endpoint, { ...options, _isRetry: true });
        } catch (refreshErr) {
          throw new Error(`API error (401) and token refresh failed`);
        }
      }
      throw new Error(`API error (${response.status}): ${response.statusText}`);
    }

    const json = await response.json();

    // Check if response is wrapped in standard { success: true, data: T } envelope
    if (
      json &&
      typeof json === "object" &&
      "data" in json &&
      "success" in json
    ) {
      return json.data as T;
    }

    return json as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // If a fallback mock is provided, seamlessly fallback so app never breaks offline
    if (mockFallback) {
      console.log(
        `[API] Network request to ${endpoint} failed (${(error as Error).message}). Using mock fallback.`
      );
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockFallback();
    }

    throw error;
  }
}

export async function apiUpload(uploadUrl: string, fileUri: string, mimeType: string): Promise<void> {
  const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': mimeType,
    },
    uploadType: 1, // FileSystem.FileSystemUploadType.BINARY_CONTENT
  });
  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Upload failed with status ${uploadResult.status}`);
  }
}