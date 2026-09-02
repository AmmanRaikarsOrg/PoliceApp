/**
 * Document Generation & Management Service
 * Handles templates, document CRUD, AI generation, and downloads.
 */

import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  DocumentTemplate as DocumentTemplateType,
  BackendDoc,
  EditDocContentPayload,
  GenerateDocumentPayload,
} from "../../utils/types";

// Re-export for backward compatibility
export type DocumentTemplate = DocumentTemplateType;

/** Build doc endpoint path based on docType */
function docEndpoint(caseId: string, docType: string) {
  if (docType === "complaint") {
    return {
      generate: ENDPOINTS.complaint.generate(caseId),
      regenerate: (docId: string) => ENDPOINTS.complaint.regenerate(caseId, docId),
      list: ENDPOINTS.complaint.listDocs(caseId),
      get: (docId: string) => ENDPOINTS.complaint.getDoc(caseId, docId),
      create: ENDPOINTS.complaint.createDoc(caseId),
      patch: (docId: string) => ENDPOINTS.complaint.patchDoc(caseId, docId),
      update: (docId: string) => ENDPOINTS.complaint.updateDoc(caseId, docId),
      delete: (docId: string) => ENDPOINTS.complaint.deleteDoc(caseId, docId),
      download: (docId: string) => ENDPOINTS.complaint.downloadDoc(caseId, docId),
    };
  }
  return {
    generate: ENDPOINTS.docType.generate(caseId, docType),
    regenerate: (docId: string) => ENDPOINTS.docType.regenerate(caseId, docType, docId),
    list: ENDPOINTS.docType.listDocs(caseId, docType),
    get: (docId: string) => ENDPOINTS.docType.getDoc(caseId, docType, docId),
    create: ENDPOINTS.docType.createDoc(caseId, docType),
    patch: (docId: string) => ENDPOINTS.docType.patchDoc(caseId, docType, docId),
    update: (docId: string) => ENDPOINTS.docType.updateDoc(caseId, docType, docId),
    delete: (docId: string) => ENDPOINTS.docType.deleteDoc(caseId, docType, docId),
    download: (docId: string) => ENDPOINTS.docType.downloadDoc(caseId, docType, docId),
  };
}

/** Normalize BackendDoc: ensure id field is set */
function normalizeDoc(raw: BackendDoc): BackendDoc {
  return { ...raw, id: raw.id || raw._id };
}

// ── Templates ──

export async function getTemplates(): Promise<DocumentTemplateType[]> {
  const result = await apiRequest<any>(ENDPOINTS.templates.list);
  // Backend may return array directly or { data: [...] }
  const list = Array.isArray(result) ? result : result?.data || [];
  return list.map((t: any) => ({ ...t, id: t.id || t._id }));
}

export async function getTemplate(templateId: string): Promise<DocumentTemplateType> {
  return apiRequest<DocumentTemplateType>(ENDPOINTS.templates.get(templateId));
}

// ── Document CRUD ──

export async function generateDocument(
  caseId: string,
  docType: string = "complaint",
  payload?: GenerateDocumentPayload
): Promise<BackendDoc> {
  const ep = docEndpoint(caseId, docType);
  const raw = await apiRequest<BackendDoc>(ep.generate, {
    method: "POST",
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return normalizeDoc(raw);
}

export async function regenerateDocument(
  caseId: string,
  docType: string,
  docId: string,
  correctionPrompt?: string
): Promise<BackendDoc> {
  const ep = docEndpoint(caseId, docType);
  const raw = await apiRequest<BackendDoc>(ep.regenerate(docId), {
    method: "POST",
    body: correctionPrompt ? JSON.stringify({ correctionPrompt }) : undefined,
  });
  return normalizeDoc(raw);
}

export async function getDocuments(
  caseId: string,
  docType: string = "complaint"
): Promise<BackendDoc[]> {
  const ep = docEndpoint(caseId, docType);
  const result = await apiRequest<BackendDoc[]>(ep.list);
  const list = Array.isArray(result) ? result : [];
  return list.map(normalizeDoc);
}

export async function getDocument(
  caseId: string,
  docType: string,
  docId: string
): Promise<BackendDoc> {
  const ep = docEndpoint(caseId, docType);
  const raw = await apiRequest<BackendDoc>(ep.get(docId));
  return normalizeDoc(raw);
}

/** Create/finalize a document (POST with docId to convert draft->final) */
export async function createDocument(
  caseId: string,
  docType: string,
  payload: { docId: string }
): Promise<BackendDoc> {
  const ep = docEndpoint(caseId, docType);
  const raw = await apiRequest<BackendDoc>(ep.create, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeDoc(raw);
}

/** Rename a document (PATCH with title) */
export async function renameDocument(
  caseId: string,
  docType: string,
  docId: string,
  title: string
): Promise<BackendDoc> {
  const ep = docEndpoint(caseId, docType);
  const raw = await apiRequest<BackendDoc>(ep.patch(docId), {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
  return normalizeDoc(raw);
}

/** Edit document content and/or status (PUT) */
export async function updateDocument(
  caseId: string,
  docType: string,
  docId: string,
  payload: EditDocContentPayload
): Promise<BackendDoc> {
  const ep = docEndpoint(caseId, docType);
  const raw = await apiRequest<BackendDoc>(ep.update(docId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeDoc(raw);
}

/** Delete a document */
export async function deleteDocument(
  caseId: string,
  docType: string,
  docId: string
): Promise<boolean> {
  const ep = docEndpoint(caseId, docType);
  await apiRequest(ep.delete(docId), { method: "DELETE" });
  return true;
}

/** Download document (returns download URL or DOCX) */
export async function downloadDocument(
  caseId: string,
  docType: string,
  docId: string
): Promise<any> {
  const ep = docEndpoint(caseId, docType);
  return apiRequest(ep.download(docId));
}