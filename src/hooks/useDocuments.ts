import { useCallback, useEffect, useState } from "react";
import { DocumentTemplate, GeneratedDocument, GenerateDocumentPayload } from "../utils/types";
import {
  deleteDocument,
  getDocuments,
  getTemplates,
  generateDocument,
  regenerateDocument,
  createDocument,
  renameDocument,
  updateDocument,
} from "../services/documents/documentService";

export function useDocuments(caseId: string, docType: string = "complaint") {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getTemplates();
      setTemplates(list);
      return list;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch document templates";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!caseId) return [];
    try {
      setLoading(true);
      setError(null);
      const docs = await getDocuments(caseId, docType);
      setDocuments(docs);
      return docs;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch documents";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [caseId, docType]);

  const generateNewDocument = useCallback(
    async (payload?: GenerateDocumentPayload) => {
      try {
        setLoading(true);
        setError(null);
        const newDoc = await generateDocument(caseId, docType, payload);
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedDocument(newDoc);
        return newDoc;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate document";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [caseId, docType]);

  const regenerateDoc = useCallback(
    async (documentId: string, prompt?: string) => {
      try {
        setLoading(true);
        setError(null);
        const updatedDoc = await regenerateDocument(caseId, docType, documentId, prompt);
        setDocuments((prev) => prev.map((d) => (d.id === documentId ? updatedDoc : d)));
        setSelectedDocument(updatedDoc);
        return updatedDoc;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to regenerate document";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [caseId, docType]
  );

  const createNewDocument = useCallback(
    async (payload: { docId: string }) => {
      try {
        setLoading(true);
        setError(null);
        const newDoc = await createDocument(caseId, docType, payload);
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedDocument(newDoc);
        return newDoc;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create document";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [caseId, docType]
  );

  const renameDoc = useCallback(
    async (documentId: string, title: string) => {
      try {
        setLoading(true);
        setError(null);
        const renamed = await renameDocument(caseId, docType, documentId, title);
        setDocuments((prev) => prev.map((d) => (d.id === documentId ? renamed : d)));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(renamed);
        }
        return renamed;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to rename document";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [caseId, docType, selectedDocument]
  );

  const updateDoc = useCallback(
    async (documentId: string, content: string) => {
      try {
        setLoading(true);
        setError(null);
        const updated = await updateDocument(caseId, docType, documentId, { content });
        setDocuments((prev) => prev.map((d) => (d.id === documentId ? updated : d)));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updated);
        }
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update document";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [caseId, docType, selectedDocument]
  );

  const removeDocument = useCallback(
    async (documentId: string) => {
      try {
        setLoading(true);
        setError(null);
        await deleteDocument(caseId, docType, documentId);
        setDocuments((prev) => prev.filter((d) => d.id !== documentId));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null);
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete document";
        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [caseId, docType, selectedDocument]
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (caseId) {
      fetchDocuments();
    }
  }, [caseId, fetchDocuments]);

  return {
    loading,
    templates,
    documents,
    selectedTemplate,
    setSelectedTemplate,
    selectedDocument,
    setSelectedDocument,
    error,
    fetchTemplates,
    fetchDocuments,
    generateDocument: generateNewDocument,
    createDocument: createNewDocument,
    regenerateDocument: regenerateDoc,
    renameDocument: renameDoc,
    updateDocument: updateDoc,
    deleteDocument: removeDocument,
  };
}