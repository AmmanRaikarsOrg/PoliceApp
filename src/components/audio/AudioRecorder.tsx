import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioRecorderState } from "expo-audio";
import { RecordedAudio, useAudioRecorder } from "../../hooks/useAudioRecorder";
import { AudioPlayer } from "./AudioPlayer";

type Props = {
  onRecordingsChange?: (recordings: RecordedAudio[]) => void;
  onRecordingComplete?: (uri: string | null) => void;
};

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  onRecordingsChange,
  onRecordingComplete,
}: Props) {
  const {
    recorder,
    isRecording,
    isProcessing,
    recordings,
    start,
    stop,
    removeRecording,
    clearRecordings,
  } = useAudioRecorder();

  const recorderState = useAudioRecorderState(recorder, 500);

  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Pulse animation for recording mic button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let pulseAnimation: Animated.CompositeAnimation;

    if (isRecording) {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    } else {
      pulseAnim.setValue(1);
      setRecordingSeconds(0);
    }

    return () => {
      clearInterval(timer);
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    if (isProcessing) return;
    await start();
  };

  const handleStopRecording = async () => {
    if (isProcessing) return;
    const newRecord = await stop(true);
    if (newRecord) {
      const updatedList = [...recordings, newRecord];
      onRecordingsChange?.(updatedList);
      onRecordingComplete?.(newRecord.uri);
    }
  };

  const handleCancelRecording = async () => {
    if (isProcessing) return;
    await stop(false);
  };

  const handleRemoveSingleRecording = (id: string) => {
    removeRecording(id);
    const updated = recordings.filter((r) => r.id !== id);
    onRecordingsChange?.(updated);
    onRecordingComplete?.(updated.length > 0 ? updated[updated.length - 1].uri : null);
  };

  const handleClearAll = () => {
    clearRecordings();
    onRecordingsChange?.([]);
    onRecordingComplete?.(null);
  };

  const currentSecs = recorderState?.durationMillis
    ? Math.floor(recorderState.durationMillis / 1000)
    : recordingSeconds;

  return (
    <View style={styles.card}>
      {isRecording ? (
        /* --- Original Recording UI --- */
        <View style={styles.recordingContainer}>
          {/* Top Header: RECORDING Live Badge & Timer */}
          <View style={styles.recordingHeader}>
            <View style={styles.liveBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.liveBadgeText}>RECORDING</Text>
            </View>

            <Text style={styles.timerText}>{formatDuration(currentSecs)}</Text>
          </View>

          {/* Center: Pulsing Mic Circle */}
          <View style={styles.activeMicWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.activeMicButton}>
              <Feather name="mic" size={32} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.recordingStatusText}>Recording audio...</Text>
          <Text style={styles.recordingSubText}>Speak clearly into your microphone</Text>

          {/* Action Controls Row */}
          <View style={styles.controlsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
              onPress={handleCancelRecording}
              accessibilityRole="button"
              accessibilityLabel="Cancel recording"
            >
              <Feather name="x" size={18} color="#64748B" />
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.stopButton,
                pressed && styles.pressed,
              ]}
              onPress={handleStopRecording}
              accessibilityRole="button"
              accessibilityLabel="Stop and save recording"
            >
              <Feather name="square" size={14} color="#FFFFFF" style={styles.stopIcon} />
              <Text style={styles.stopText}>Stop & Save</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* --- Idle Mic & Preserved Recordings List --- */
        <View style={styles.idleContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.micCircleButton,
              pressed && !isProcessing && styles.buttonPressed,
              isProcessing && styles.buttonDisabled,
            ]}
            onPress={handleStartRecording}
            disabled={isProcessing}
            accessibilityRole="button"
            accessibilityLabel="Start recording"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="mic" size={28} color="#FFFFFF" />
            )}
          </Pressable>

          <Text style={styles.primaryText}>
            {isProcessing
              ? "Preparing microphone..."
              : recordings.length > 0
              ? "Tap mic to add another recording"
              : "Tap to start recording"}
          </Text>

          <Text style={styles.subText}>Ensure a quiet environment</Text>

          {/* Preserved Recordings List */}
          {recordings.length > 0 && (
            <View style={styles.recordingsListContainer}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                  PRESERVED RECORDINGS ({recordings.length})
                </Text>
                {recordings.length > 1 && (
                  <Pressable onPress={handleClearAll} hitSlop={6}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </Pressable>
                )}
              </View>

              {recordings.map((item) => (
                <View key={item.id} style={styles.recordingItemWrapper}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {formatDuration(item.duration)} • {item.createdAt}
                    </Text>
                  </View>
                  <AudioPlayer
                    uri={item.uri}
                    onRemove={() => handleRemoveSingleRecording(item.id)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
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
  idleContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
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
  recordingContainer: {
    width: "100%",
    alignItems: "center",
  },
  recordingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
    fontVariant: ["tabular-nums"],
  },
  activeMicWrapper: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: "#FCA5A5",
  },
  activeMicButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingStatusText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 4,
    textAlign: "center",
  },
  recordingSubText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  stopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#0F294A",
    shadowColor: "#0F294A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  stopIcon: {
    marginRight: 6,
  },
  stopText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  recordingsListContainer: {
    width: "100%",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.6,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EF4444",
  },
  recordingItemWrapper: {
    marginBottom: 12,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F294A",
  },
  itemMeta: {
    fontSize: 11,
    color: "#64748B",
  },
  pressed: {
    opacity: 0.88,
  },
});