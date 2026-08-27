import { File } from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { AudioPlayer } from "./AudioPlayer";

export function AudioRecorder() {
  const {
    status,
    start,
    pause,
    resume,
    stop,
    uri,
  } = useAudioRecorder();
  const [fileSize, setFileSize] = useState<number | null>(null);

  useEffect(() => {
    if (!uri) {
      setFileSize(null);
      return;
    }

    try {
      setFileSize(new File(uri).size);
    } catch (error) {
      console.error("Failed to read recording file size", error);
      setFileSize(null);
    }
  }, [uri]);

  return (
    <View style={styles.container}>
      {status === "idle" || status === "finished" ? (
        <Pressable style={styles.recordButton} onPress={start}>
          <Text style={styles.text}>Record Audio</Text>
        </Pressable>
      ) : (
        <>
          <Pressable
            style={[styles.recordButton, styles.recording]}
            onPress={status === "recording" ? pause : resume}
          >
            <Text style={styles.text}>
              {status === "recording" ? "Pause" : "Resume"}
            </Text>
          </Pressable>
          <Pressable style={styles.finishButton} onPress={stop}>
            <Text style={styles.text}>Finish Recording</Text>
          </Pressable>
        </>
      )}

      {status === "finished" && uri ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Recording</Text>
          <AudioPlayer uri={uri} />
          <Text style={styles.size}>
            Size: {fileSize === null ? "Unavailable" : formatFileSize(fileSize)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
  },

  recordButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#15181D",
    borderWidth: 2,
    borderColor: "#F4F5F7",
  },

  recording: {
    borderColor: "#FF5555",
  },

  finishButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#F4F5F7",
  },

  result: {
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },

  size: {
    color: "#050505",
    marginTop: 8,
  },

  resultTitle: {
    color: "#050505",
    fontWeight: "700",
  },

  text: {
    color: "#F4F5F7",
    fontWeight: "700",
  },
});

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Unavailable";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}