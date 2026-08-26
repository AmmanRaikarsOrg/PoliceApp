import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { AudioPlayer } from "./AudioPlayer";

type Props = {
  onRecordingComplete?: (uri: string | null) => void;
};

export function AudioRecorder({ onRecordingComplete }: Props) {
  const {
    isRecording,
    isProcessing,
    start,
    stop,
    uri,
    clearRecording,
  } = useAudioRecorder();

  const handlePress = async () => {
    if (isProcessing) return;

    if (isRecording) {
      const recordedUri = await stop();
      if (onRecordingComplete) {
        onRecordingComplete(recordedUri || uri);
      }
      return;
    }

    const started = await start();
    if (!started && onRecordingComplete) {
      // If start failed, clear any existing recorded URI
      onRecordingComplete(null);
    }
  };

  const handleRemoveRecorded = () => {
    clearRecording();
    if (onRecordingComplete) {
      onRecordingComplete(null);
    }
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [
          styles.micCircleButton,
          isRecording && styles.recordingActiveButton,
          pressed && !isProcessing && styles.buttonPressed,
          isProcessing && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={isProcessing}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Feather
            name={isRecording ? "square" : "mic"}
            size={28}
            color="#FFFFFF"
          />
        )}
      </Pressable>

      <Text style={styles.primaryText}>
        {isRecording
          ? "Recording in progress..."
          : isProcessing
          ? "Preparing microphone..."
          : uri
          ? "Audio recorded! Tap mic to re-record"
          : "Tap to start recording"}
      </Text>

      <Text style={styles.subText}>
        {isRecording ? "Tap button again to stop" : "Ensure a quiet environment"}
      </Text>

      {/* Render playback bar if audio has been recorded and not actively recording */}
      {uri && !isRecording && (
        <AudioPlayer uri={uri} onRemove={handleRemoveRecorded} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },

  micCircleButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#06162E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#06162E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  recordingActiveButton: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  primaryText: {
    color: "#0F294A",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },

  subText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
  },
});