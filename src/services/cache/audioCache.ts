import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  File,
  Paths,
} from "expo-file-system";

import type {
  AudioCacheIndex,
  CachedAudio,
} from "./cacheTypes";

const CACHE_KEY =
  "@case-files/audio-cache";

const CACHE_TTL =
  10 * 24 * 60 * 60 * 1000;

async function getCacheIndex(): Promise<AudioCacheIndex> {
  const raw =
    await AsyncStorage.getItem(
      CACHE_KEY
    );

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    console.warn(
      "Audio cache metadata was corrupted. Resetting."
    );

    return {};
  }
}

async function saveCacheIndex(
  index: AudioCacheIndex
) {
  await AsyncStorage.setItem(
    CACHE_KEY,
    JSON.stringify(index)
  );
}

function isExpired(
  audio: CachedAudio,
  now = Date.now()
): boolean {
  return (
    now - audio.lastAccessedAt >=
    CACHE_TTL
  );
}

export async function registerAudio(
  audio: Omit<
    CachedAudio,
    "createdAt" | "lastAccessedAt"
  >
): Promise<CachedAudio> {
  const now = Date.now();

  const entry: CachedAudio = {
    ...audio,
    createdAt: now,
    lastAccessedAt: now,
  };

  const index =
    await getCacheIndex();

  index[audio.id] = entry;

  await saveCacheIndex(index);

  return entry;
}

export async function touchAudio(
  audioId: string
): Promise<CachedAudio | null> {
  const index =
    await getCacheIndex();

  const audio = index[audioId];

  if (!audio) {
    return null;
  }

  const now = Date.now();

  if (isExpired(audio, now)) {
    await removeAudio(
      audioId,
      index
    );

    return null;
  }

  audio.lastAccessedAt = now;

  await saveCacheIndex(index);

  return audio;
}

export async function touchCase(
  caseId: string
): Promise<void> {
  const index =
    await getCacheIndex();

  const now = Date.now();

  let changed = false;

  for (const audio of Object.values(index)) {
    if (audio.caseId !== caseId) {
      continue;
    }

    if (isExpired(audio, now)) {
      await deleteAudioFile(audio);

      delete index[audio.id];

      changed = true;

      continue;
    }

    audio.lastAccessedAt = now;

    changed = true;
  }

  if (changed) {
    await saveCacheIndex(index);
  }
}

async function deleteAudioFile(
  audio: CachedAudio
): Promise<void> {
  try {
    const file =
      new File(audio.uri);

    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn(
      "Failed to delete audio file:",
      audio.uri,
      error
    );
  }
}

export async function removeAudio(
  audioId: string,
  existingIndex?: AudioCacheIndex
): Promise<void> {
  const index =
    existingIndex ??
    (await getCacheIndex());

  const audio = index[audioId];

  if (!audio) {
    return;
  }

  await deleteAudioFile(audio);

  delete index[audioId];

  await saveCacheIndex(index);
}