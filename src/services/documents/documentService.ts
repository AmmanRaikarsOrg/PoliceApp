import { apiRequest } from "../api/client";

export type DocumentTemplate = {
  id: string;
  name: string;
  description?: string;
};

export async function getTemplates() {
  return apiRequest("/templates");
}

export async function generateDocument(
  caseId: string,
  data: unknown
) {
  return apiRequest(
    `/cases/${caseId}/documents`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function getDocument(
  caseId: string,
  documentId: string
) {
  return apiRequest(
    `/cases/${caseId}/documents/${documentId}`
  );
}