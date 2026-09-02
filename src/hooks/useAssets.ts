import { useState, useCallback } from "react";
import * as assetService from "../services/assets/assetService";
import { CaseAsset } from "../utils/types";

export function useAssets(caseId: string, docType: string = "complaint") {
  const [assets, setAssets] = useState<CaseAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assetService.listAssets(caseId, docType);
      setAssets(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  }, [caseId, docType]);

  const uploadAsset = async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    durationSec?: number
  ) => {
    try {
      setLoading(true);
      const newAsset = await assetService.uploadAsset(
        caseId,
        docType,
        fileUri,
        fileName,
        mimeType,
        sizeBytes,
        durationSec
      );
      setAssets((prev) => [...prev, newAsset]);
      return newAsset;
    } catch (err: any) {
      setError(err.message || "Upload failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeAsset = async (assetId: string) => {
    try {
      await assetService.deleteAsset(caseId, docType, assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (err: any) {
      setError(err.message || "Delete failed");
      throw err;
    }
  };

  const getDownloadUrl = async (assetId: string) => {
    return assetService.getAssetDownloadUrl(caseId, docType, assetId);
  };

  return {
    assets,
    loading,
    error,
    fetchAssets,
    uploadAsset,
    removeAsset,
    getDownloadUrl,
  };
}
