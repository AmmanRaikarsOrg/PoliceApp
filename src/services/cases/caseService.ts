import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export async function getCases() {
  return apiRequest(ENDPOINTS.cases.list);
}

export async function createCase(data: {
  name: string;
  description?: string;
  type?: string;
  date?: string;
}) {
  return apiRequest(
    ENDPOINTS.cases.create,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}
