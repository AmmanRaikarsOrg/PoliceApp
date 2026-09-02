/**
 * ============================================================================
 * Authentication Service
 * ============================================================================
 * Handles officer login, session verification, token persistence, and logout.
 */

import { AuthResponse, LoginPayload, User } from "../../utils/types";
import { apiRequest, getAuthToken, setAuthToken } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { mockFindUser, mockGetUserById } from "../api/mockData/mockStore";

/**
 * Authenticate officer with badge number, email, or phone and password.
 * On success, saves token locally and returns user details.
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>(ENDPOINTS.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
    mockFallback: () => {
      const user = mockFindUser(payload.username);
      const token = `mock-jwt-${user.id}-${Date.now()}`;
      return {
        token,
        user,
        expiresIn: 86400 * 7, // 7 days
      };
    },
  });

  // Save auth token to AsyncStorage & memory
  if (result?.token) {
    setAuthToken(result.token);
  }

  return result;
}

/**
 * Fetch current logged-in officer profile.
 */
export async function getProfile(): Promise<User> {
  return apiRequest<User>(ENDPOINTS.auth.profile, {
    method: "GET",
    mockFallback: () => {
      // Default to first officer in mock store
      const user = mockGetUserById("usr_001") || mockFindUser("PSI-1605");
      return user;
    },
  });
}

/**
 * Logout officer, invalidate server session if supported, and clear local token.
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest(ENDPOINTS.auth.logout, {
      method: "POST",
      mockFallback: () => ({ success: true }),
    });
  } catch (error) {
    console.warn("Logout API call failed:", error);
  } finally {
    setAuthToken(null);
  }
}

/**
 * Get current stored auth token.
 */
export async function getCurrentToken(): Promise<string | null> {
  return getAuthToken();
}