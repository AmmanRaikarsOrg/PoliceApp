import { useState } from "react";

export function useDocuments() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    setLoading,
  };
}