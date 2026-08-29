export type CachedAudio = {
  id: string;

  caseId: string;

  uri: string;

  filename: string;

  createdAt: number;

  lastAccessedAt: number;
};

export type AudioCacheIndex = Record<
  string,
  CachedAudio
>;