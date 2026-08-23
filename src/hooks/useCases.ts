import { useCallback, useState } from "react";

import { getCases } from "../services/cases/caseService";

export function useCases() {
  const [cases, setCases] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCases = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getCases();

      setCases(data as unknown[]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cases,
    loading,
    refreshCases,
  };
}