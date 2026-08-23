import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export type LoginPayload = {
  username: string;
  password: string;
};

export async function login(
  payload: LoginPayload
) {
  return apiRequest(
    ENDPOINTS.auth.login,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}