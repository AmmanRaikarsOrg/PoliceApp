/**
 * ============================================================================
 * Backend API Endpoints Configuration
 * ============================================================================
 * Centralized endpoint URLs for all police application services.
 * Modify these paths or query patterns if your backend team updates the route schema.
 */

export const ENDPOINTS = {
  // --------------------------------------------------------------------------
  // Authentication & Officer Profile
  // --------------------------------------------------------------------------
  auth: {
    login: "/auth/login",
    profile: "/auth/me",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh",
  },

  // --------------------------------------------------------------------------
  // Cases & Investigation Management
  // --------------------------------------------------------------------------
  cases: {
    list: "/cases",
    create: "/cases",
    get: (caseId: string) => `/cases/${encodeURIComponent(caseId)}`,
    update: (caseId: string) => `/cases/${encodeURIComponent(caseId)}`,
    delete: (caseId: string) => `/cases/${encodeURIComponent(caseId)}`,
    timeline: (caseId: string) => `/cases/${encodeURIComponent(caseId)}/timeline`,
  },

  // --------------------------------------------------------------------------
  // Audio Recordings & Speech-to-Text
  // --------------------------------------------------------------------------
  audio: {
    upload: "/audio/upload",
    listByCase: (caseId: string) => `/cases/${encodeURIComponent(caseId)}/audio`,
    get: (audioId: string) => `/audio/${encodeURIComponent(audioId)}`,
    delete: (audioId: string) => `/audio/${encodeURIComponent(audioId)}`,
    transcribe: (audioId: string) => `/audio/${encodeURIComponent(audioId)}/transcribe`,
  },

  // --------------------------------------------------------------------------
  // Documents & Markdown/DOCX Generation
  // --------------------------------------------------------------------------
  documents: {
    templates: "/templates",
    listByCase: (caseId: string) => `/cases/${encodeURIComponent(caseId)}/documents`,
    get: (caseId: string, documentId: string) =>
      `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(documentId)}`,
    generate: "/documents/generate",
    regenerate: (caseId: string, documentId: string) =>
      `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(documentId)}/regenerate`,
    update: (caseId: string, documentId: string) =>
      `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(documentId)}`,
    delete: (caseId: string, documentId: string) =>
      `/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(documentId)}`,
  },
};