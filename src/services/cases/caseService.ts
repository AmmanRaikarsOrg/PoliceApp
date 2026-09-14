/**
 * Case Management Service
 * Handles all CRUD operations for police cases.
 */

import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  BackendCase,
  Case,
  CaseFilterParams,
  CreateCasePayload,
  UpdateCasePayload,
  PaginatedResponse,
} from "../../utils/types";

/**
 * Normalize a backend case object to the frontend Case model.
 * Maps _id to id, title to name, etc.
 */
function normalizeCase(raw: BackendCase): Case {
  return {
    id: raw._id,
    _id: raw._id,
    caseNumber: raw.firNumber || raw._id,
    name: raw.title,
    title: raw.title,
    description: raw.description || undefined,
    date: raw.dateOfIncident || raw.createdAt,
    status: raw.status,
    caseType: raw.caseType || undefined,
    type: raw.caseType || undefined,
    location: raw.location || undefined,
    firNumber: raw.firNumber,
    policeStationId: raw.policeStationId,
    officerId: raw.officerId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Fetch cases with optional filters.
 * Backend returns: { data: BackendCase[], pagination: { total, page, limit, totalPages } }
 */
export async function getCases(filters?: CaseFilterParams): Promise<Case[]> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (filters?.status && filters.status !== "ALL") {
    queryParams.status = filters.status.toLowerCase();
  }
  if (filters?.caseType && filters.caseType !== "ALL") {
    queryParams.caseType = filters.caseType;
  }
  if (filters?.search) {
    queryParams.search = filters.search;
  }
  if (filters?.page) {
    queryParams.page = filters.page;
  }
  if (filters?.limit) {
    queryParams.limit = filters.limit;
  }

  // The apiRequest client auto-unwraps { success, data } but NOT { data, pagination }.
  // Backend returns { data: [...], pagination: {...} } for list endpoints.
  const result = await apiRequest<{ data: BackendCase[]; pagination: any } | BackendCase[]>(
    ENDPOINTS.cases.list,
    { queryParams }
  );

  // Handle both wrapped and unwrapped responses
  const rawCases = Array.isArray(result) ? result : (result as any).data || result;
  const casesArray = Array.isArray(rawCases) ? rawCases : [];
  return casesArray.map(normalizeCase);
}

/**
 * Fetch a single case by ID.
 */
export async function getCaseById(caseId: string): Promise<Case> {
  const raw = await apiRequest<BackendCase>(ENDPOINTS.cases.get(caseId));
  return normalizeCase(raw);
}

/**
 * Create a new case.
 * Backend expects: { title: string, description?: string, location?: string, firNumber?: string, dateOfIncident?: string, caseType?: string }
 */
export async function createCase(payload: CreateCasePayload): Promise<Case> {
  const body: Record<string, any> = {
    title: payload.title || payload.name || "",
  };
  if (payload.description) body.description = payload.description;
  if (payload.location) body.location = payload.location;
  if (payload.firNumber) body.firNumber = payload.firNumber;
  if (payload.date) body.dateOfIncident = payload.date;
  if (payload.caseType) body.caseType = payload.caseType;
  if (payload.type && !payload.caseType) body.caseType = payload.type;

  const raw = await apiRequest<BackendCase>(ENDPOINTS.cases.create, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizeCase(raw);
}

/**
 * Update an existing case.
 */
export async function updateCase(caseId: string, payload: UpdateCasePayload): Promise<Case> {
  const body: Record<string, any> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.name !== undefined) body.title = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.location !== undefined) body.location = payload.location;
  if (payload.firNumber !== undefined) body.firNumber = payload.firNumber;
  if (payload.status !== undefined) body.status = String(payload.status).toLowerCase();
  if (payload.caseType !== undefined) body.caseType = payload.caseType;
  if (payload.type !== undefined && payload.caseType === undefined) body.caseType = payload.type;
  if (payload.date !== undefined) body.dateOfIncident = payload.date;

  const raw = await apiRequest<BackendCase>(ENDPOINTS.cases.update(caseId), {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return normalizeCase(raw);
}

/**
 * Delete a case.
 */
export async function deleteCase(caseId: string): Promise<boolean> {
  await apiRequest(ENDPOINTS.cases.delete(caseId), { method: "DELETE" });
  return true;
}
