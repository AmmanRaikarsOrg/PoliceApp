/**
 * ============================================================================
 * Application Data Models & Type Definitions (Postman Backend Aligned)
 * ============================================================================
 * Matches the official Police_Project backend schema with backward compatibility
 * and frontend normalization helpers.
 */

// ----------------------------------------------------------------------------
// 1. User & Authentication Models
// ----------------------------------------------------------------------------

export type UserRole = "officer" | "admin" | "supervisor";

export type User = {
  _id?: string;
  id: string;
  name: string;
  email: string;
  policeStationId: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

// ----------------------------------------------------------------------------
// 2. Case Models (Matching /api/cases)
// ----------------------------------------------------------------------------

export type CaseStatus = "open" | "closed" | "deleted" | "OPEN" | "CLOSED" | "DELETED";

/**
 * Backend Case response shape as returned by MongoDB / Express API
 */
export type BackendCase = {
  _id: string;
  policeStationId?: string;
  officerId?: string;
  title: string;
  firNumber?: string | null;
  location?: string | null;
  description?: string | null;
  dateOfIncident?: string | null;
  status: "open" | "closed" | "deleted";
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

/**
 * Frontend Normalized Case Model
 */
export type Case = {
  id: string;
  _id?: string;
  caseNumber: string; // e.g. "CR-2026-0046" or firNumber or _id
  name: string; // title in backend
  title?: string;
  description?: string;
  type?: string;
  date: string;
  status: CaseStatus;
  location?: string;
  firNumber?: string | null;
  policeStationId?: string;
  officerId?: string;
  assignedOfficer?: string;
  complaintDetails?: string;
  audioCount?: number;
  documentCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CaseTimelineEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  officerName?: string;
};

export type CaseDetails = Case & {
  audioList: CaseAsset[];
  documents: BackendDoc[];
  timeline?: CaseTimelineEvent[];
};

export type CreateCasePayload = {
  title: string; // Backend field
  name?: string; // Frontend alias
  description?: string;
  type?: string;
  date?: string;
  location?: string;
  firNumber?: string;
};

export type UpdateCasePayload = Partial<CreateCasePayload> & {
  status?: CaseStatus;
  firNumber?: string;
};

export type CaseFilterParams = {
  status?: CaseStatus | "ALL";
  search?: string;
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// ----------------------------------------------------------------------------
// 3. Assets & Audio Models (Matching /api/cases/:caseId/complaint/assets)
// ----------------------------------------------------------------------------

export type DocType = "complaint" | "panchanamas" | "firs" | "statements" | "reports" | "letters";

export type GetUploadUrlPayload = {
  originalFileName: string;
  mimeType: string;
};

export type AssetUploadUrlResponse = {
  uploadUrl: string;
  storageKey: string;
  expiresAt: string;
};

export type ConfirmAssetUploadPayload = {
  sizeBytes: number;
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  durationSec?: number | null;
};

export type CaseAsset = {
  _id: string;
  id?: string;
  caseId: string;
  docType: string; // e.g. "complaint"
  label: string; // e.g. "audio-1"
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  durationSec?: number | null;
  createdBy?: string;
  status: "active" | "deleted" | "processing";
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  // Frontend convenience aliases
  name?: string;
  uri?: string;
  source?: "Recorded" | "Uploaded";
  transcription?: string;
};

export type AssetDownloadResponse = {
  downloadUrl: string;
  expiresAt: string;
};

// ----------------------------------------------------------------------------
// 4. Documents & Generation Models (Matching /api/cases/:caseId/complaint/docs)
// ----------------------------------------------------------------------------

export type DocumentTemplate = {
  id: string;
  name: string;
  kannadaName?: string;
  code: string;
  description?: string;
  icon?: string;
  category?: string;
};

export type BackendDoc = {
  _id: string;
  id?: string;
  caseId: string;
  docType: string; // e.g. "complaint"
  title: string;
  status: "draft" | "final" | "DRAFT" | "FINAL";
  content: string; // Markdown text (containing Kannada Nudi or Unicode text)
  markdown?: string; // Frontend alias for content
  templateId?: string;
  sourceAssetIds?: string[];
  parentDocumentId?: string | null;
  generation?: {
    provider?: string;
    model?: string;
    correctionPrompt?: string;
  };
  acceptedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  templateName?: string;
  kannadaTitle?: string;
  meta?: string;
  type?: "PDF" | "DOCX" | "MARKDOWN";
};

export type FinalizeDocPayload = {
  docId: string;
};

export type RenameDocPayload = {
  title: string;
};

export type GenerateDocumentPayload = {
  templateId?: string;
  sourceAssetIds?: string[];
  correctionPrompt?: string;
  docType?: DocType;
};

export type EditDocContentPayload = {
  content: string;
  status?: "draft" | "final";
};

// ----------------------------------------------------------------------------
// 5. Generic API Envelope
// ----------------------------------------------------------------------------

export type ApiResponse<T> = {
  success?: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// Legacy compatibility aliases
export type Recording = CaseAsset;
export type Document = BackendDoc;
export type GeneratedDocument = BackendDoc;
export type CaseAudio = CaseAsset;
