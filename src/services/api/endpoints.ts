export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  cases: {
    list: "/cases",
    create: "/cases",
    get: (caseId: string) => `/cases/${caseId}`,
    update: (caseId: string) => `/cases/${caseId}`,
    delete: (caseId: string) => `/cases/${caseId}`,
  },
  complaint: {
    uploadUrl: (caseId: string) => `/cases/${caseId}/complaint/assets/upload-url`,
    confirmAsset: (caseId: string) => `/cases/${caseId}/complaint/assets`,
    patchAsset: (caseId: string, assetId: string) => `/cases/${caseId}/complaint/assets/${assetId}`,
    listAssets: (caseId: string) => `/cases/${caseId}/complaint/assets`,
    updateAsset: (caseId: string, assetId: string) => `/cases/${caseId}/complaint/assets/${assetId}`,
    deleteAsset: (caseId: string, assetId: string) => `/cases/${caseId}/complaint/assets/${assetId}`,
    downloadAsset: (caseId: string, assetId: string) => `/cases/${caseId}/complaint/assets/${assetId}/download`,
    get: (caseId: string) => `/cases/${caseId}/complaint`,
    generate: (caseId: string) => `/cases/${caseId}/complaint/generate`,
    regenerate: (caseId: string, docId: string) => `/cases/${caseId}/complaint/docs/${docId}/regenerate`,
    listDocs: (caseId: string) => `/cases/${caseId}/complaint/docs`,
    getDoc: (caseId: string, docId: string) => `/cases/${caseId}/complaint/docs/${docId}`,
    createDoc: (caseId: string) => `/cases/${caseId}/complaint/docs`,
    patchDoc: (caseId: string, docId: string) => `/cases/${caseId}/complaint/docs/${docId}`,
    updateDoc: (caseId: string, docId: string) => `/cases/${caseId}/complaint/docs/${docId}`,
    deleteDoc: (caseId: string, docId: string) => `/cases/${caseId}/complaint/docs/${docId}`,
    downloadDoc: (caseId: string, docId: string) => `/cases/${caseId}/complaint/docs/${docId}/download`,
  },
  docType: {
    uploadUrl: (caseId: string, docType: string) => `/cases/${caseId}/${docType}/assets/upload-url`,
    confirmAsset: (caseId: string, docType: string) => `/cases/${caseId}/${docType}/assets`,
    patchAsset: (caseId: string, docType: string, assetId: string) => `/cases/${caseId}/${docType}/assets/${assetId}`,
    listAssets: (caseId: string, docType: string) => `/cases/${caseId}/${docType}/assets`,
    updateAsset: (caseId: string, docType: string, assetId: string) => `/cases/${caseId}/${docType}/assets/${assetId}`,
    deleteAsset: (caseId: string, docType: string, assetId: string) => `/cases/${caseId}/${docType}/assets/${assetId}`,
    downloadAsset: (caseId: string, docType: string, assetId: string) => `/cases/${caseId}/${docType}/assets/${assetId}/download`,
    get: (caseId: string, docType: string) => `/cases/${caseId}/${docType}`,
    generate: (caseId: string, docType: string) => `/cases/${caseId}/${docType}/generate`,
    regenerate: (caseId: string, docType: string, docId: string) => `/cases/${caseId}/${docType}/docs/${docId}/regenerate`,
    listDocs: (caseId: string, docType: string) => `/cases/${caseId}/${docType}/docs`,
    getDoc: (caseId: string, docType: string, docId: string) => `/cases/${caseId}/${docType}/docs/${docId}`,
    createDoc: (caseId: string, docType: string) => `/cases/${caseId}/${docType}/docs`,
    patchDoc: (caseId: string, docType: string, docId: string) => `/cases/${caseId}/${docType}/docs/${docId}`,
    updateDoc: (caseId: string, docType: string, docId: string) => `/cases/${caseId}/${docType}/docs/${docId}`,
    deleteDoc: (caseId: string, docType: string, docId: string) => `/cases/${caseId}/${docType}/docs/${docId}`,
    downloadDoc: (caseId: string, docType: string, docId: string) => `/cases/${caseId}/${docType}/docs/${docId}/download`,
  },
  templates: {
    list: "/templates",
    get: (templateId: string) => `/templates/${templateId}`,
  },
};

/**
 * Resolves endpoints for a given docType. Uses complaint-specific endpoints
 * for 'complaint', and generic docType endpoints for everything else.
 */
export function getDocTypeEndpoints(caseId: string, docType: string) {
  if (docType === "complaint") {
    return {
      uploadUrl: () => ENDPOINTS.complaint.uploadUrl(caseId),
      confirmAsset: () => ENDPOINTS.complaint.confirmAsset(caseId),
      patchAsset: (assetId: string) => ENDPOINTS.complaint.patchAsset(caseId, assetId),
      listAssets: () => ENDPOINTS.complaint.listAssets(caseId),
      updateAsset: (assetId: string) => ENDPOINTS.complaint.updateAsset(caseId, assetId),
      deleteAsset: (assetId: string) => ENDPOINTS.complaint.deleteAsset(caseId, assetId),
      downloadAsset: (assetId: string) => ENDPOINTS.complaint.downloadAsset(caseId, assetId),
      get: () => ENDPOINTS.complaint.get(caseId),
      generate: () => ENDPOINTS.complaint.generate(caseId),
      regenerate: (docId: string) => ENDPOINTS.complaint.regenerate(caseId, docId),
      listDocs: () => ENDPOINTS.complaint.listDocs(caseId),
      getDoc: (docId: string) => ENDPOINTS.complaint.getDoc(caseId, docId),
      createDoc: () => ENDPOINTS.complaint.createDoc(caseId),
      patchDoc: (docId: string) => ENDPOINTS.complaint.patchDoc(caseId, docId),
      updateDoc: (docId: string) => ENDPOINTS.complaint.updateDoc(caseId, docId),
      deleteDoc: (docId: string) => ENDPOINTS.complaint.deleteDoc(caseId, docId),
      downloadDoc: (docId: string) => ENDPOINTS.complaint.downloadDoc(caseId, docId),
    };
  }
  return {
    uploadUrl: () => ENDPOINTS.docType.uploadUrl(caseId, docType),
    confirmAsset: () => ENDPOINTS.docType.confirmAsset(caseId, docType),
    patchAsset: (assetId: string) => ENDPOINTS.docType.patchAsset(caseId, docType, assetId),
    listAssets: () => ENDPOINTS.docType.listAssets(caseId, docType),
    updateAsset: (assetId: string) => ENDPOINTS.docType.updateAsset(caseId, docType, assetId),
    deleteAsset: (assetId: string) => ENDPOINTS.docType.deleteAsset(caseId, docType, assetId),
    downloadAsset: (assetId: string) => ENDPOINTS.docType.downloadAsset(caseId, docType, assetId),
    get: () => ENDPOINTS.docType.get(caseId, docType),
    generate: () => ENDPOINTS.docType.generate(caseId, docType),
    regenerate: (docId: string) => ENDPOINTS.docType.regenerate(caseId, docType, docId),
    listDocs: () => ENDPOINTS.docType.listDocs(caseId, docType),
    getDoc: (docId: string) => ENDPOINTS.docType.getDoc(caseId, docType, docId),
    createDoc: () => ENDPOINTS.docType.createDoc(caseId, docType),
    patchDoc: (docId: string) => ENDPOINTS.docType.patchDoc(caseId, docType, docId),
    updateDoc: (docId: string) => ENDPOINTS.docType.updateDoc(caseId, docType, docId),
    deleteDoc: (docId: string) => ENDPOINTS.docType.deleteDoc(caseId, docType, docId),
    downloadDoc: (docId: string) => ENDPOINTS.docType.downloadDoc(caseId, docType, docId),
  };
}