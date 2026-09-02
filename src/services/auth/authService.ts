import { User, LoginPayload, AuthResponse } from "../../utils/types";
import { apiRequest, setAuthToken, setRefreshToken } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>(ENDPOINTS.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (result?.accessToken) {
    setAuthToken(result.accessToken);
  }
  if (result?.refreshToken) {
    setRefreshToken(result.refreshToken);
  }
  return result;
}

export async function getProfile(): Promise<User> {
  return apiRequest<User>(ENDPOINTS.auth.me, { method: "GET" });
}

export async function logout(): Promise<void> {
  try {
    await apiRequest(ENDPOINTS.auth.logout, { method: "POST" });
  } catch (error) {
    console.warn("Logout API call failed:", error);
  } finally {
    setAuthToken(null);
    setRefreshToken(null);
  }
}

export async function getCurrentToken(): Promise<string | null> {
  const { getAuthToken } = require("../api/client");
  return getAuthToken();
}