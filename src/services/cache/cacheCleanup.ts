import {
  File,
} from "expo-file-system";

import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AudioCacheIndex,
} from "./cacheTypes";

const CACHE_KEY =
  "@case-files/audio-cache";

const CACHE_TTL =
  10 * 24 * 60 * 60 * 1000;

export async function cleanupAudioCache() {
  const raw =
    await AsyncStorage.getItem(
      CACHE_KEY
    );

  if (!raw) {
    return;
  }

  let index: AudioCacheIndex;

  try {
    index = JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem(
      CACHE_KEY
    );

    return;
  }

  const now = Date.now();

  for (const [
    id,
    audio,
  ] of Object.entries(index)) {
    if (
      now - audio.lastAccessedAt <
      CACHE_TTL
    ) {
      continue;
    }

    try {
      const file =
        new File(audio.uri);

      if (file.exists) {
        file.delete();
      }
    } catch (error) {
      console.warn(
        `Failed to delete expired audio ${id}`,
        error
      );
    }

    delete index[id];
  }

  await AsyncStorage.setItem(
    CACHE_KEY,
    JSON.stringify(index)
  );
}