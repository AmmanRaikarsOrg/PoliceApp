import { useCallback, useEffect, useState } from "react";
import {
  Case,
  CaseDetails,
  CaseFilterParams,
  CreateCasePayload,
  UpdateCasePayload,
} from "../utils/types";
import {
  createCase,
  deleteCase,
  getCaseById,
  getCases,
  updateCase,
} from "../services/cases/caseService";

export function useCases(initialFilters?: CaseFilterParams) {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(
    async (filters?: CaseFilterParams) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCases(filters);
        setCases(data);
        return data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to fetch cases";
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCaseById = useCallback(async (caseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCaseById(caseId);
      setSelectedCase(data);
      return data;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load case details";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewCase = useCallback(
    async (payload: CreateCasePayload): Promise<Case> => {
      try {
        setLoading(true);
        setError(null);
        const newCase = await createCase(payload);
        setCases((prev) => [newCase, ...prev]);
        return newCase;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to create case";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateExistingCase = useCallback(
    async (caseId: string, payload: UpdateCasePayload): Promise<Case> => {
      try {
        setLoading(true);
        setError(null);
        const updated = await updateCase(caseId, payload);
        setCases((prev) =>
          prev.map((c) => (c.id === caseId || c.caseNumber === caseId ? updated : c))
        );
        if (selectedCase && (selectedCase.id === caseId || selectedCase.caseNumber === caseId)) {
          setSelectedCase((prev) => (prev ? { ...prev, ...updated } : null));
        }
        return updated;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to update case";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedCase]
  );

  const removeCase = useCallback(
    async (caseId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await deleteCase(caseId);
        setCases((prev) =>
          prev.filter((c) => c.id !== caseId && c.caseNumber !== caseId)
        );
        if (selectedCase && (selectedCase.id === caseId || selectedCase.caseNumber === caseId)) {
          setSelectedCase(null);
        }
        return true;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to delete case";
        setError(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedCase]
  );

  useEffect(() => {
    fetchCases(initialFilters);
  }, [fetchCases, initialFilters]);

  return {
    cases,
    selectedCase,
    loading,
    error,
    fetchCases,
    fetchCaseById,
    createNewCase,
    updateCase: updateExistingCase,
    deleteCase: removeCase,
    refreshCases: (filters?: CaseFilterParams) => fetchCases(filters || initialFilters),
  };
}