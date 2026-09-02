/**
 * ============================================================================
 * Document Generation & Management Hook
 * ============================================================================
 * Stateful hook for fetching templates, listing case documents, generating
 * new markdown documents (Panchanama, FIR, etc.), and managing document state.
 */

import { useCallback, useEffect, useState } from "react";
import {
  DocumentTemplate,
  GenerateDocumentPayload,
  GeneratedDocument,
} from "../utils/types";
import {
  deleteDocument,
  getDocument,
  getDocuments,
  getTemplates,
  generateDocument,
  regenerateDocument,
} from "../services/documents/documentService";

export function useDocuments(caseId?: string) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<GeneratedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load available document templates from backend / mock store.
   */
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getTemplates();
      setTemplates(list);
      return list;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch document templates";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load all generated documents for the given caseId.
   */
  const fetchDocuments = useCallback(async (targetCaseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const docs = await getDocuments(targetCaseId);
      setDocuments(docs);
      return docs;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch case documents";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single document with full markdown content.
   */
  const fetchDocumentById = useCallback(
    async (targetCaseId: string, documentId: string) => {
      try {
        setLoading(true);
        setError(null);
        const doc = await getDocument(targetCaseId, documentId);
        setSelectedDocument(doc);
        return doc;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch document";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Generate a new document for a case using selected template and audio/case data.
   */
  const generateNewDocument = useCallback(
    async (
      targetCaseId: string,
      payload: GenerateDocumentPayload
    ): Promise<GeneratedDocument> => {
      try {
        setLoading(true);
        setError(null);
        const newDoc = await generateDocument(targetCaseId, payload);
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedDocument(newDoc);
        return newDoc;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to generate document";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Regenerate document.
   */
  const regenerateDoc = useCallback(
    async (
      targetCaseId: string,
      documentId: string,
      instructions?: string
    ): Promise<GeneratedDocument> => {
      try {
        setLoading(true);
        setError(null);
        const updatedDoc = await regenerateDocument(
          targetCaseId,
          documentId,
          instructions
        );
        setDocuments((prev) =>
          prev.map((d) => (d.id === documentId ? updatedDoc : d))
        );
        setSelectedDocument(updatedDoc);
        return updatedDoc;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to regenerate document";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete a document.
   */
  const removeDocument = useCallback(
    async (targetCaseId: string, documentId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const success = await deleteDocument(targetCaseId, documentId);
        if (success) {
          setDocuments((prev) => prev.filter((d) => d.id !== documentId));
          if (selectedDocument?.id === documentId) {
            setSelectedDocument(null);
          }
        }
        return success;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to delete document";
        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedDocument]
  );

  useEffect(() => {
    fetchTemplates();
    if (caseId) {
      fetchDocuments(caseId);
    }
  }, [caseId, fetchTemplates, fetchDocuments]);

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
    fetchDocumentById,
    generateNewDocument,
    createDocument: generateNewDocument, // Alias for backward compatibility
    regenerateDocument: regenerateDoc,
    deleteDocument: removeDocument,
  };
}