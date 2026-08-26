import { useCallback, useEffect, useState } from "react";
import {
  DocumentTemplate,
  generateDocument,
  getTemplates,
} from "../services/documents/documentService";

export function useDocuments() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getTemplates();
      setTemplates(list);
    } catch (err) {
      setError("Failed to fetch document templates");
    } finally {
      setLoading(false);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const createDocument = async (caseId: string, payload: { templateId: string; audioUri?: string | null; audioFile?: any }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await generateDocument(caseId, payload);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate document";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (caseId: string, payload: { templateId?: string; audioUri?: string | null }) => {
    try {
      setLoading(true);
      setError(null);
      // Simulate draft save or call API
      return { success: true, caseId };
    } catch (err) {
      setError("Failed to save draft");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    error,
    setError,
    fetchTemplates,
    createDocument,
    saveDraft,
  };
}