import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import {
  configureAudio,
  requestAudioPermission,
} from "../../services/audio/audioService";

export type RecordedAudio = {
  name: string;
  uri: string;
};

type Props = {
  onRecordingComplete?: (recording: RecordedAudio) => void;
};

export function AudioRecorder({ onRecordingComplete }: Props) {
  const { isRecording, start, stop } = useAudioRecorder();

  const [isPreparing, setIsPreparing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || startedAt.current === null) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - startedAt.current!) / 1000)
      );
    }, 250);

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainder
    ).padStart(2, "0")}`;
  };

  const handlePress = async () => {
    if (isRecording) {
      const uri = await stop();
      const recordedAt = new Date();

      startedAt.current = null;
      setElapsedSeconds(0);

      if (uri) {
        onRecordingComplete?.({
          uri,
          name: `Complaint recording ${recordedAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
        });
      }

      return;
    }

    try {
      setIsPreparing(true);

      const permission = await requestAudioPermission();

      if (!permission.granted) {
        Alert.alert(
          "Microphone access required",
          "Allow microphone access to record a complaint."
        );
        return;
      }

      await configureAudio();
      await start();

      startedAt.current = Date.now();
      setElapsedSeconds(0);
    } catch {
      Alert.alert(
        "Unable to start recording",
        "Please try recording the complaint again."
      );
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.recordButton,
          isRecording && styles.recording,
        ]}
        onPress={handlePress}
        disabled={isPreparing}
      >
        {isPreparing ? (
          <ActivityIndicator color="#0B0D10" />
        ) : (
          <>
            <View style={styles.microphone} />

            <Text style={styles.text}>
              {isRecording ? "Stop recording" : "Tap to record"}
            </Text>

            <Text style={styles.hint}>
              {isRecording
                ? formatDuration(elapsedSeconds)
                : "Record complaint audio"}
            </Text>
          </>
        )}
      </Pressable>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            isRecording && styles.statusDotActive,
          ]}
        />

        <Text style={styles.status}>
          {isRecording
            ? "Recording in progress"
            : "Ready to record"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 10,
  },

  recordButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    borderWidth: 8,
    borderColor: "#252B33",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  recording: {
    backgroundColor: "#FF6262",
    borderColor: "#5B2528",
  },

  text: {
    color: "#0B0D10",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 12,
  },

  hint: {
    color: "#4E5764",
    fontSize: 12,
    marginTop: 5,
  },

  microphone: {
    width: 28,
    height: 38,
    borderRadius: 16,
    backgroundColor: "#0B0D10",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C8795",
  },

  statusDotActive: {
    backgroundColor: "#FF6262",
  },

  status: {
    color: "#9AA3AF",
    fontSize: 13,
  },
});