import {
  File,
} from "expo-file-system";

import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AudioCacheIndex,
} from "./cacheTypes";

const CACHE_KEY =
  "@case-files/audio-cache";

// 3 minutes for testing (was 10 days)
const CACHE_TTL = 3 * 60 * 1000;

// Check every 30 seconds
const EVICTION_INTERVAL = 30 * 1000;

let evictionTimer: ReturnType<typeof setInterval> | null =
  null;

export async function cleanupAudioCache() {
  console.log(
    "[AudioCache] 🧹 Running cache cleanup sweep..."
  );

  const raw =
    await AsyncStorage.getItem(
      CACHE_KEY
    );

  if (!raw) {
    console.log(
      "[AudioCache] No cache index found — nothing to clean"
    );
    return;
  }

  let index: AudioCacheIndex;

  try {
    index = JSON.parse(raw);
  } catch {
    console.warn(
      "[AudioCache] Cache index corrupted — removing"
    );
    await AsyncStorage.removeItem(
      CACHE_KEY
    );

    return;
  }

  const now = Date.now();
  const ids = Object.keys(index);
  let removedCount = 0;

  console.log(
    `[AudioCache] Checking ${ids.length} cached entries...`
  );

  for (const [
    id,
    audio,
  ] of Object.entries(index)) {
    const elapsed =
      now - audio.lastAccessedAt;
    const remainingSecs = Math.max(
      0,
      Math.round(
        (CACHE_TTL - elapsed) / 1000
      )
    );

    if (elapsed < CACHE_TTL) {
      console.log(
        `[AudioCache]   ✓ "${audio.filename}" — ` +
          `${remainingSecs}s remaining`
      );
      continue;
    }

    console.log(
      `[AudioCache]   ⏰ "${audio.filename}" EXPIRED ` +
        `(${Math.round(elapsed / 1000)}s since last access, ` +
        `TTL is ${CACHE_TTL / 1000}s) — deleting file`
    );

    try {
      const file =
        new File(audio.uri);

      if (file.exists) {
        file.delete();
        console.log(
          `[AudioCache]   🗑️  Deleted file: ${audio.uri}`
        );
      } else {
        console.log(
          `[AudioCache]   File already gone: ${audio.uri}`
        );
      }
    } catch (error) {
      console.warn(
        `[AudioCache]   Failed to delete expired audio ${id}`,
        error
      );
    }

    delete index[id];
    removedCount++;
  }

  await AsyncStorage.setItem(
    CACHE_KEY,
    JSON.stringify(index)
  );

  const remaining = Object.keys(index).length;

  console.log(
    `[AudioCache] 🧹 Cleanup complete — removed: ${removedCount}, remaining: ${remaining}`
  );
}

/**
 * Starts a periodic eviction timer that runs cleanup
 * every 30 seconds. Call this once at app startup.
 */
export function startCacheEvictionTimer() {
  if (evictionTimer !== null) {
    console.log(
      "[AudioCache] Eviction timer already running"
    );
    return;
  }

  console.log(
    `[AudioCache] ⏱️  Starting eviction timer ` +
      `(interval: ${EVICTION_INTERVAL / 1000}s, ` +
      `TTL: ${CACHE_TTL / 1000}s / ${CACHE_TTL / 60000} min)`
  );

  // Run once immediately on start
  cleanupAudioCache();

  evictionTimer = setInterval(() => {
    console.log(
      "[AudioCache] ⏱️  Eviction timer tick"
    );
    cleanupAudioCache();
  }, EVICTION_INTERVAL);
}

/**
 * Stops the periodic eviction timer.
 */
export function stopCacheEvictionTimer() {
  if (evictionTimer !== null) {
    clearInterval(evictionTimer);
    evictionTimer = null;
    console.log(
      "[AudioCache] ⏱️  Eviction timer stopped"
    );
  }
}