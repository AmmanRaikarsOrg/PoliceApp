export type CachedAudio = {
  id: string;

  caseId: string;

  uri: string;

  filename: string;

  createdAt: number;

  lastAccessedAt: number;

  sizeBytes?: number;

  durationSec?: number | null;
};

export type AudioCacheIndex = Record<
  string,
  CachedAudio
>;