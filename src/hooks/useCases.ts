/**
 * ============================================================================
 * Case Management Hook
 * ============================================================================
 * Stateful hook providing cases list, filtered searches, case detail loading,
 * and case creation/update actions.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Case,
  CaseDetails,
  CaseFilterParams,
  CaseStatus,
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
  const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch cases with given filters.
   */
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

  /**
   * Fetch full details for a single case by ID.
   */
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

  /**
   * Create a new case and add it to the top of the local state.
   */
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

  /**
   * Update an existing case status or metadata.
   */
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

  /**
   * Delete a case.
   */
  const removeCase = useCallback(
    async (caseId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const success = await deleteCase(caseId);
        if (success) {
          setCases((prev) =>
            prev.filter((c) => c.id !== caseId && c.caseNumber !== caseId)
          );
          if (selectedCase && (selectedCase.id === caseId || selectedCase.caseNumber === caseId)) {
            setSelectedCase(null);
          }
        }
        return success;
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
  }, [fetchCases]);

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
    refreshCases: () => fetchCases(initialFilters),
  };
}