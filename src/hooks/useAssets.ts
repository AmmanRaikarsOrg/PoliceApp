import { useState, useCallback } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as assetService from "../services/assets/assetService";
import * as audioCache from "../services/cache/audioCache";
import { CaseAsset } from "../utils/types";

export function useAssets(caseId: string, docType: string = "complaint") {
  const [assets, setAssets] = useState<CaseAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    console.log(`[useAssets] Fetching assets for caseId: "${caseId}", docType: "${docType}"...`);
    setLoading(true);
    setError(null);
    try {
      const rawData = await assetService.listAssets(caseId, docType);
      console.log(`[useAssets] Fetched ${rawData.length} assets successfully from backend.`);

      // Sort chronologically ascending so the first recorded/uploaded audio is always at pos 1 (#1)
      const sortedData = [...rawData].sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tA - tB;
      });

      // Cache-first inspection for each asset
      const initialProcessed: CaseAsset[] = [];
      const needsBackgroundFetch: CaseAsset[] = [];

      for (const item of sortedData) {
        const assetId = item._id || (item as any).id;
        const cached = await audioCache.getCachedAudio(assetId);

        if (cached && cached.uri) {
          console.log(`[useAssets] ⚡ CACHE HIT for asset "${item.originalFileName}". Local file: ${cached.uri}`);
          initialProcessed.push({
            ...item,
            uri: cached.uri,
            uploadStatus: "uploaded",
            isFetching: false,
          });
        } else {
          console.log(`[useAssets] ⏳ CACHE MISS for asset "${item.originalFileName}". Marked isFetching: true`);
          const pendingItem: CaseAsset = {
            ...item,
            uploadStatus: "uploaded",
            isFetching: true,
          };
          initialProcessed.push(pendingItem);
          needsBackgroundFetch.push(pendingItem);
        }
      }

      // Render assets immediately
      setAssets(initialProcessed);
      setLoading(false);

      // Download missing audio files in background with progress
      if (needsBackgroundFetch.length > 0) {
        for (const missing of needsBackgroundFetch) {
          const id = missing._id || (missing as any).id;
          (async () => {
            try {
              console.log(`[useAssets] 🌐 Fetching pre-signed download URL for missing asset "${missing.originalFileName}"...`);
              const downloadResp = await assetService.getAssetDownloadUrl(caseId, docType, id);
              const downloadUrl = downloadResp?.downloadUrl;

              if (downloadUrl) {
                const sanitizedName = (missing.originalFileName || "audio.m4a").replace(/[^a-zA-Z0-9._-]/g, "_");
                const localTarget = `${FileSystem.cacheDirectory}audio_${id}_${sanitizedName}`;

                console.log(`[useAssets] 📥 Downloading audio file to cache: ${localTarget}`);
                const downloadResult = await FileSystem.downloadAsync(downloadUrl, localTarget);

                await audioCache.registerAudio({
                  id,
                  caseId,
                  filename: missing.originalFileName,
                  uri: downloadResult.uri,
                  sizeBytes: missing.sizeBytes,
                  durationSec: missing.durationSec,
                });

                console.log(`[useAssets] ✅ Successfully cached downloaded audio: ${downloadResult.uri}`);

                setAssets((prev) =>
                  prev.map((a) =>
                    (a._id === id || a.id === id)
                      ? { ...a, uri: downloadResult.uri, isFetching: false }
                      : a
                  )
                );
              } else {
                setAssets((prev) =>
                  prev.map((a) =>
                    (a._id === id || a.id === id)
                      ? { ...a, isFetching: false }
                      : a
                  )
                );
              }
            } catch (dlErr: any) {
              console.warn(`[useAssets] ⚠️ Could not download asset "${missing.originalFileName}":`, dlErr?.message);
              setAssets((prev) =>
                prev.map((a) =>
                  (a._id === id || a.id === id)
                    ? { ...a, isFetching: false }
                    : a
                )
              );
            }
          })();
        }
      }
    } catch (err: any) {
      console.error(`[useAssets] ❌ Failed to fetch assets:`, err);
      setError(err.message || "Failed to fetch assets");
      setLoading(false);
    }
  }, [caseId, docType]);

  const uploadAsset = async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    durationSec?: number | null,
    source: "Recorded" | "Uploaded" = "Recorded"
  ): Promise<CaseAsset> => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const normalizedMime = assetService.normalizeAudioMimeType(mimeType, fileName);
    const validSize = Math.max(1, sizeBytes || 1024);

    console.log(`[useAssets] ==================== START AUDIO PIPELINE ====================`);
    console.log(`[useAssets] Audio Name: "${fileName}", Size: ${validSize} bytes, MIME: ${normalizedMime}`);

    // 1. Phone Cache
    try {
      console.log(`[useAssets] Step 1: Saving audio to local phone cache index...`);
      await audioCache.registerAudio({
        id: tempId,
        caseId,
        uri: fileUri,
        filename: fileName,
        sizeBytes: validSize,
        durationSec: durationSec ? Math.round(durationSec) : null,
      });
      console.log(`[useAssets] ✅ Saved to local cache with id "${tempId}".`);
    } catch (cacheErr) {
      console.warn(`[useAssets] ⚠️ Could not register in local cache index:`, cacheErr);
    }

    // 2. Immediately append to screen UI with 'uploading' status
    // User requirement: First recorded is pos 1, subsequent recordings append to end (...prev, placeholderAsset)
    const placeholderAsset: CaseAsset = {
      _id: tempId,
      id: tempId,
      caseId,
      docType,
      label: fileName,
      storageKey: "",
      originalFileName: fileName,
      mimeType: normalizedMime,
      sizeBytes: validSize,
      durationSec: durationSec ?? null,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uri: fileUri,
      source,
      uploadStatus: "uploading",
      isFetching: false,
    };

    setAssets((prev) => [...prev, placeholderAsset]);
    console.log(`[useAssets] Step 2: Appended audio to end of list with status: "uploading" (YouTube spinner active).`);

    try {
      // 3. Request pre-signed URL from backend
      console.log(`[useAssets] Step 3: Requesting pre-signed URL from backend for "${fileName}"...`);
      const { uploadUrl, storageKey } = await assetService.getUploadUrl(caseId, docType, {
        originalFileName: fileName,
        mimeType: normalizedMime,
      });
      console.log(`[useAssets] ✅ Pre-signed URL received. StorageKey: "${storageKey}"`);

      // 4. Binary upload to object storage
      console.log(`[useAssets] Step 4: Uploading binary audio to object storage (PUT)...`);
      await assetService.uploadFileToStorage(uploadUrl, fileUri, normalizedMime);
      console.log(`[useAssets] ✅ Binary storage PUT completed successfully.`);

      // 5. Confirm asset upload with backend database
      console.log(`[useAssets] Step 5: Confirming asset upload with backend DB...`);
      const confirmedAsset = await assetService.confirmAssetUpload(caseId, docType, {
        storageKey,
        originalFileName: fileName,
        mimeType: normalizedMime,
        sizeBytes: validSize,
        durationSec: durationSec ? Math.round(durationSec) : null,
      });
      console.log(`[useAssets] ✅ Backend confirmed asset. New DB Asset ID: "${confirmedAsset._id}"`);

      // Also register confirmed asset ID in local cache so cache-first lookup finds it by backend ID
      try {
        await audioCache.registerAudio({
          id: confirmedAsset._id || (confirmedAsset as any).id,
          caseId,
          uri: fileUri,
          filename: fileName,
          sizeBytes: validSize,
          durationSec: durationSec ? Math.round(durationSec) : null,
        });
      } catch {}

      // 6. Update item in local state to 'uploaded' in-place
      const finalizedAsset: CaseAsset = {
        ...confirmedAsset,
        uri: fileUri, // preserve local file URI for immediate offline playback
        source,
        uploadStatus: "uploaded",
        isFetching: false,
      };

      setAssets((prev) =>
        prev.map((item) => (item._id === tempId || item.id === tempId ? finalizedAsset : item))
      );
      console.log(`[useAssets] ==================== AUDIO PIPELINE COMPLETE ====================`);
      return finalizedAsset;
    } catch (err: any) {
      console.error(`[useAssets] ❌ Upload pipeline failed:`, err);
      // Mark this item as error in UI
      setAssets((prev) =>
        prev.map((item) =>
          item._id === tempId || item.id === tempId
            ? { ...item, uploadStatus: "error", isFetching: false }
            : item
        )
      );
      setError(err.message || "Upload failed");
      throw err;
    }
  };

  const removeAsset = async (assetId: string) => {
    console.log(`[useAssets] Deleting asset "${assetId}"...`);
    try {
      if (!assetId.startsWith("temp_")) {
        await assetService.deleteAsset(caseId, docType, assetId);
        console.log(`[useAssets] ✅ Deleted asset "${assetId}" on backend.`);
      }
      // Remove from cache as well
      await audioCache.removeAudio(assetId);
      setAssets((prev) => prev.filter((a) => (a.id || a._id) !== assetId));
      console.log(`[useAssets] Removed asset "${assetId}" from UI state.`);
    } catch (err: any) {
      console.error(`[useAssets] ❌ Delete failed for "${assetId}":`, err);
      setError(err.message || "Delete failed");
      throw err;
    }
  };

  const moveAsset = useCallback((fromIndex: number, toIndex: number) => {
    setAssets((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      console.log(
        `[useAssets] ↕️ Reordered audio asset "${movedItem.label || movedItem.originalFileName}" from position #${fromIndex + 1} to #${toIndex + 1}`
      );
      return updated;
    });
  }, []);

  const reorderAssets = useCallback((newAssets: CaseAsset[]) => {
    console.log(`[useAssets] ↕️ Setting new audio assets order (${newAssets.length} items)`);
    setAssets(newAssets);
  }, []);

  const getDownloadUrl = async (assetId: string) => {
    console.log(`[useAssets] Requesting download URL for asset "${assetId}"...`);
    return assetService.getAssetDownloadUrl(caseId, docType, assetId);
  };

  return {
    assets,
    loading,
    error,
    fetchAssets,
    uploadAsset,
    removeAsset,
    moveAsset,
    reorderAssets,
    getDownloadUrl,
  };
}
