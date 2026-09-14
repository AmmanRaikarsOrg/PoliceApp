/**
 * Asset (Audio) Service
 * Handles the 3-step upload flow, listing, and management of audio assets.
 * Works for both 'complaint' and generic docType (panchanamas, firs, etc.).
 */

import { apiRequest, apiUpload } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  CaseAsset,
  AssetUploadUrlResponse,
  ConfirmAssetUploadPayload,
  AssetDownloadResponse,
  GetUploadUrlPayload,
} from "../../utils/types";

/**
 * Backend-supported audio MIME types (from backend utils/validate.js)
 */
export const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/flac",
];

/**
 * Normalizes any incoming MIME type or file extension to an allowed backend MIME type.
 * e.g., 'audio/m4a' -> 'audio/x-m4a', 'Recording-123.m4a' -> 'audio/x-m4a'
 */
export function normalizeAudioMimeType(
  mimeType?: string | null,
  fileName?: string | null
): string {
  const clean = mimeType?.toLowerCase().trim();
  if (clean === "audio/m4a") return "audio/x-m4a";
  if (clean && ALLOWED_AUDIO_MIME_TYPES.includes(clean)) return clean;

  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "m4a") return "audio/x-m4a";
  if (ext === "mp3") return "audio/mp3";
  if (ext === "wav") return "audio/wav";
  if (ext === "aac") return "audio/aac";
  if (ext === "ogg") return "audio/ogg";
  if (ext === "webm") return "audio/webm";
  if (ext === "mp4") return "audio/mp4";
  if (ext === "flac") return "audio/flac";

  return "audio/x-m4a";
}

/** Ensure CaseAsset has both id and _id, and a readable name */
function normalizeAsset(raw: CaseAsset): CaseAsset {
  return {
    ...raw,
    id: raw.id || raw._id,
    name: raw.name || raw.label || raw.originalFileName,
  };
}

/** Build the correct endpoint path based on docType */
function assetEndpoint(caseId: string, docType: string) {
  if (docType === "complaint") {
    return {
      uploadUrl: ENDPOINTS.complaint.uploadUrl(caseId),
      confirm: ENDPOINTS.complaint.confirmAsset(caseId),
      list: ENDPOINTS.complaint.listAssets(caseId),
      patch: (assetId: string) => ENDPOINTS.complaint.patchAsset(caseId, assetId),
      update: (assetId: string) => ENDPOINTS.complaint.updateAsset(caseId, assetId),
      delete: (assetId: string) => ENDPOINTS.complaint.deleteAsset(caseId, assetId),
      download: (assetId: string) => ENDPOINTS.complaint.downloadAsset(caseId, assetId),
    };
  }
  return {
    uploadUrl: ENDPOINTS.docType.uploadUrl(caseId, docType),
    confirm: ENDPOINTS.docType.confirmAsset(caseId, docType),
    list: ENDPOINTS.docType.listAssets(caseId, docType),
    patch: (assetId: string) => ENDPOINTS.docType.patchAsset(caseId, docType, assetId),
    update: (assetId: string) => ENDPOINTS.docType.updateAsset(caseId, docType, assetId),
    delete: (assetId: string) => ENDPOINTS.docType.deleteAsset(caseId, docType, assetId),
    download: (assetId: string) => ENDPOINTS.docType.downloadAsset(caseId, docType, assetId),
  };
}

/**
 * Step 1: Request a pre-signed upload URL from the backend.
 */
export async function getUploadUrl(
  caseId: string,
  docType: string,
  payload: GetUploadUrlPayload
): Promise<AssetUploadUrlResponse> {
  const ep = assetEndpoint(caseId, docType);
  const normalizedMime = normalizeAudioMimeType(payload.mimeType, payload.originalFileName);

  return apiRequest<AssetUploadUrlResponse>(ep.uploadUrl, {
    method: "POST",
    body: JSON.stringify({
      originalFileName: payload.originalFileName,
      mimeType: normalizedMime,
    }),
  });
}

/**
 * Step 2: Upload the binary file to the pre-signed URL (S3/Backblaze).
 */
export async function uploadFileToStorage(
  uploadUrl: string,
  fileUri: string,
  mimeType: string
): Promise<void> {
  return apiUpload(uploadUrl, fileUri, mimeType);
}

/**
 * Step 3: Confirm the asset upload with the backend.
 */
export async function confirmAssetUpload(
  caseId: string,
  docType: string,
  payload: ConfirmAssetUploadPayload
): Promise<CaseAsset> {
  const ep = assetEndpoint(caseId, docType);
  const normalizedMime = normalizeAudioMimeType(payload.mimeType, payload.originalFileName);
  const validSize =
    typeof payload.sizeBytes === "number" && payload.sizeBytes > 0
      ? Math.round(payload.sizeBytes)
      : 1024;

  const raw = await apiRequest<CaseAsset>(ep.confirm, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      mimeType: normalizedMime,
      sizeBytes: validSize,
      durationSec: payload.durationSec ? Math.round(payload.durationSec) : null,
    }),
  });
  return normalizeAsset(raw);
}

/**
 * Convenience: Full 3-step upload in one call.
 */
export async function uploadAsset(
  caseId: string,
  docType: string,
  fileUri: string,
  originalFileName: string,
  mimeType: string,
  sizeBytes: number,
  durationSec?: number | null
): Promise<CaseAsset> {
  const normalizedMime = normalizeAudioMimeType(mimeType, originalFileName);
  const validSize =
    typeof sizeBytes === "number" && sizeBytes > 0 ? Math.round(sizeBytes) : 1024;

  // Step 1: Get pre-signed URL
  const { uploadUrl, storageKey } = await getUploadUrl(caseId, docType, {
    originalFileName,
    mimeType: normalizedMime,
  });

  // Step 2: Upload binary to storage (Content-Type MUST match what was signed in Step 1)
  await uploadFileToStorage(uploadUrl, fileUri, normalizedMime);

  // Step 3: Confirm with backend
  return confirmAssetUpload(caseId, docType, {
    storageKey,
    originalFileName,
    mimeType: normalizedMime,
    sizeBytes: validSize,
    durationSec: durationSec ? Math.round(durationSec) : null,
  });
}

/**
 * List all assets for a case + docType.
 */
export async function listAssets(
  caseId: string,
  docType: string
): Promise<CaseAsset[]> {
  const ep = assetEndpoint(caseId, docType);
  const result = await apiRequest<CaseAsset[]>(ep.list);
  const list = Array.isArray(result) ? result : [];
  return list.map(normalizeAsset);
}

/**
 * Patch asset metadata (e.g. label).
 */
export async function patchAsset(
  caseId: string,
  docType: string,
  assetId: string,
  patch: Partial<Pick<CaseAsset, "label">>
): Promise<CaseAsset> {
  const ep = assetEndpoint(caseId, docType);
  const raw = await apiRequest<CaseAsset>(ep.patch(assetId), {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return normalizeAsset(raw);
}

/**
 * Full update of an asset.
 */
export async function updateAsset(
  caseId: string,
  docType: string,
  assetId: string,
  data: Partial<CaseAsset>
): Promise<CaseAsset> {
  const ep = assetEndpoint(caseId, docType);
  const raw = await apiRequest<CaseAsset>(ep.update(assetId), {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return normalizeAsset(raw);
}

/**
 * Delete an asset.
 */
export async function deleteAsset(
  caseId: string,
  docType: string,
  assetId: string
): Promise<boolean> {
  const ep = assetEndpoint(caseId, docType);
  await apiRequest(ep.delete(assetId), { method: "DELETE" });
  return true;
}

/**
 * Get a pre-signed download URL for an asset.
 */
export async function getAssetDownloadUrl(
  caseId: string,
  docType: string,
  assetId: string
): Promise<AssetDownloadResponse> {
  const ep = assetEndpoint(caseId, docType);
  return apiRequest<AssetDownloadResponse>(ep.download(assetId));
}
