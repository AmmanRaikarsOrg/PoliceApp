import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export type DocumentTemplate = {
  id: string;
  name: string;
  description?: string;
};

export const DEFAULT_TEMPLATES: DocumentTemplate[] = [
  { id: "panchanama", name: "Panchanama", description: "Crime scene and seizure memo" },
  { id: "letter", name: "Letter", description: "Inter-departmental letter" },
  { id: "request", name: "Request", description: "Formal request document" },
  { id: "chargesheet", name: "Chargesheet", description: "Police investigation chargesheet" },
];

export async function getTemplates(): Promise<DocumentTemplate[]> {
  try {
    const data = await apiRequest<DocumentTemplate[]>(ENDPOINTS.documents.templates);
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_TEMPLATES;
  } catch (error) {
    return DEFAULT_TEMPLATES;
  }
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