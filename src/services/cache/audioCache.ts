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

// 3 minutes for testing (was 10 days)
const CACHE_TTL = 3 * 60 * 1000;

async function getCacheIndex(): Promise<AudioCacheIndex> {
  const raw =
    await AsyncStorage.getItem(
      CACHE_KEY
    );

  if (!raw) {
    console.log(
      "[AudioCache] No cache index found, returning empty index"
    );
    return {};
  }

  try {
    const index = JSON.parse(raw);
    console.log(
      `[AudioCache] Loaded cache index with ${Object.keys(index).length} entries`
    );
    return index;
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
  console.log(
    `[AudioCache] Saved cache index (${Object.keys(index).length} entries)`
  );
}

function isExpired(
  audio: CachedAudio,
  now = Date.now()
): boolean {
  const elapsed =
    now - audio.lastAccessedAt;
  const expired = elapsed >= CACHE_TTL;
  const remainingSecs = Math.max(
    0,
    Math.round(
      (CACHE_TTL - elapsed) / 1000
    )
  );

  console.log(
    `[AudioCache] Expiry check for "${audio.filename}" — ` +
      `elapsed: ${Math.round(elapsed / 1000)}s, ` +
      `TTL: ${CACHE_TTL / 1000}s, ` +
      `remaining: ${remainingSecs}s, ` +
      `expired: ${expired}`
  );

  return expired;
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

  console.log(
    `[AudioCache] ✅ Registered audio "${audio.filename}" (id: ${audio.id}) ` +
      `— will expire in ${CACHE_TTL / 1000}s (${CACHE_TTL / 60000} min) ` +
      `if not accessed`
  );

  return entry;
}

export async function touchAudio(
  audioId: string
): Promise<CachedAudio | null> {
  const index =
    await getCacheIndex();

  const audio = index[audioId];

  if (!audio) {
    console.log(
      `[AudioCache] touchAudio: id "${audioId}" not found in cache`
    );
    return null;
  }

  const now = Date.now();

  if (isExpired(audio, now)) {
    console.log(
      `[AudioCache] ⏰ Audio "${audio.filename}" has expired on touch — removing`
    );
    await removeAudio(
      audioId,
      index
    );

    return null;
  }

  audio.lastAccessedAt = now;

  await saveCacheIndex(index);

  console.log(
    `[AudioCache] 🔄 Touched audio "${audio.filename}" — timer reset, ` +
      `new expiry in ${CACHE_TTL / 1000}s`
  );

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
      console.log(
        `[AudioCache] ⏰ Audio "${audio.filename}" expired during case touch — deleting file`
      );
      await deleteAudioFile(audio);

      delete index[audio.id];

      changed = true;

      continue;
    }

    audio.lastAccessedAt = now;

    console.log(
      `[AudioCache] 🔄 Touched audio "${audio.filename}" via case touch`
    );

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
      console.log(
        `[AudioCache] 🗑️  Deleted file from disk: ${audio.uri}`
      );
    } else {
      console.log(
        `[AudioCache] File already missing from disk: ${audio.uri}`
      );
    }
  } catch (error) {
    console.warn(
      "[AudioCache] Failed to delete audio file:",
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
    console.log(
      `[AudioCache] removeAudio: id "${audioId}" not found, nothing to remove`
    );
    return;
  }

  console.log(
    `[AudioCache] 🗑️  Removing audio "${audio.filename}" (id: ${audioId}) from cache`
  );

  await deleteAudioFile(audio);

  delete index[audioId];

  await saveCacheIndex(index);
}