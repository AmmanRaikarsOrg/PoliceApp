import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useAssets } from "../hooks/useAssets";
import { useDocuments } from "../hooks/useDocuments";
import {
  configureAudio,
  requestAudioPermission,
} from "../services/audio/audioService";
import * as DocumentPicker from "expo-document-picker";
import { getInfoAsync } from "expo-file-system/legacy";
import { AudioAssetCard } from "../components/audio/AudioAssetCard";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ComplaintRegistration"
>;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function ComplaintRegistrationScreen({ navigation, route }: Props) {
  const { caseId } = route.params;
  const insets = useSafeAreaInsets();
  const { isRecording, isPaused, start, pause, resume, stop } = useAudioRecorder();

  const { assets, uploadAsset, removeAsset, moveAsset, loading: assetsLoading } = useAssets(caseId, "complaint");
  const { generateDocument, loading: docsLoading } = useDocuments(caseId);

  const [isPreparing, setIsPreparing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Timer while recording and not paused
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Reset timer on stop
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
    }
  }, [isRecording]);

  const handleStartRecording = async () => {
    console.log("[ComplaintRegistrationScreen] User tapped Start Recording...");
    try {
      setIsPreparing(true);
      const perm = await requestAudioPermission();
      if (!perm.granted) {
        console.warn("[ComplaintRegistrationScreen] Microphone permission denied");
        Alert.alert("Permission required", "Microphone access is needed to record.");
        return;
      }
      await configureAudio();
      await start();
      console.log("[ComplaintRegistrationScreen] ✅ Recording started.");
    } catch (err) {
      console.error("[ComplaintRegistrationScreen] ❌ Start recording failed:", err);
      Alert.alert("Error", "Unable to start recording.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handlePauseResumePress = async () => {
    if (isPaused) {
      console.log("[ComplaintRegistrationScreen] User tapped Resume...");
      await resume();
    } else {
      console.log("[ComplaintRegistrationScreen] User tapped Pause...");
      await pause();
    }
  };

  const handleStopPress = async () => {
    console.log("[ComplaintRegistrationScreen] User tapped Stop & Save...");
    const uri = await stop();
    if (uri) {
      try {
        console.log(`[ComplaintRegistrationScreen] File recorded: ${uri.uri}. Getting file size...`);
        const fileInfo = await getInfoAsync(uri.uri);
        const size = fileInfo.exists && typeof fileInfo.size === "number" && fileInfo.size > 0
          ? fileInfo.size
          : 1024;

        console.log(`[ComplaintRegistrationScreen] Uploading recording to pipeline. Size: ${size} bytes`);
        await uploadAsset(
          uri.uri,
          uri.name || `Complaint-Audio-${Date.now()}.m4a`,
          "audio/x-m4a",
          size,
          uri.duration,
          "Recorded"
        );
      } catch (error: any) {
        console.error("[ComplaintRegistrationScreen] ❌ Upload recording error:", error);
        Alert.alert("Upload Error", `Failed to upload recording: ${error.message}`);
      }
    }
  };

  const handleUploadPress = async () => {
    console.log("[ComplaintRegistrationScreen] User tapped Upload Audio File picker...");
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
      });

      if (!res.canceled && res.assets) {
        console.log(`[ComplaintRegistrationScreen] Selected ${res.assets.length} file(s) from picker`);
        for (const asset of res.assets) {
          const size = asset.size && asset.size > 0 ? asset.size : 1024;
          console.log(`[ComplaintRegistrationScreen] Starting upload for picker file: "${asset.name}" (${size} bytes)`);
          await uploadAsset(
            asset.uri,
            asset.name,
            asset.mimeType || "audio/mp3",
            size,
            null,
            "Uploaded"
          );
        }
      } else {
        console.log("[ComplaintRegistrationScreen] File picker was cancelled");
      }
    } catch (error: any) {
      console.error("[ComplaintRegistrationScreen] ❌ Document picker upload error:", error);
      Alert.alert("Error", `Could not upload audio file: ${error.message}`);
    }
  };

  const handleProcessAudio = async () => {
    // Extract asset IDs in the exact user-ordered sequence
    const sourceAssetIds = assets
      .map((a) => a._id || a.id)
      .filter((id): id is string => typeof id === "string" && !id.startsWith("temp_"));

    console.log(`[ComplaintRegistrationScreen] ==================== START PROCESS AUDIO ====================`);
    console.log(
      `[ComplaintRegistrationScreen] Case ID: "${caseId}". Sending ${sourceAssetIds.length} audio file(s) to AI in sequence:`,
      sourceAssetIds
    );
    try {
      const newDoc = await generateDocument({
        docType: "complaint",
        sourceAssetIds: sourceAssetIds.length > 0 ? sourceAssetIds : undefined,
      });
      const docId = (newDoc as any)?._id || (newDoc as any)?.id;
      console.log(`[ComplaintRegistrationScreen] ✅ Document generation triggered! Document ID: "${docId}"`);
      console.log(`[ComplaintRegistrationScreen] Navigating to CasePageScreen with generatingDocId: "${docId}"`);
      navigation.replace("CasePage", {
        caseId,
        generatingDocId: docId,
      });
    } catch (error: any) {
      console.error(`[ComplaintRegistrationScreen] ❌ Failed to generate document:`, error);
      Alert.alert("Error", `Failed to generate document: ${error?.message || "Unknown error"}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom + 20, 24) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Complaint Registration</Text>

        {/* Active Recording Controller OR Start Record Card */}
        {isRecording ? (
          <View style={styles.recordingCard}>
            <View style={styles.recordingHeader}>
              <View style={[styles.recordingDot, isPaused && styles.recordingDotPaused]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recordingStatusText}>
                  {isPaused ? "Recording Paused" : "Recording Audio..."}
                </Text>
                <Text style={styles.recordingSubtext}>
                  {isPaused ? "Tap Resume to continue" : "Speak clearly into the microphone"}
                </Text>
              </View>
              <Text style={styles.recordingTimer}>{formatTime(recordingSeconds)}</Text>
            </View>

            <View style={styles.recordingControlRow}>
              <Pressable
                style={[styles.recordingControlBtn, isPaused ? styles.resumeBtn : styles.pauseBtn]}
                onPress={handlePauseResumePress}
              >
                <Feather name={isPaused ? "play" : "pause"} size={18} color="#0F294A" />
                <Text style={styles.recordingControlBtnText}>
                  {isPaused ? "Resume" : "Pause"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.recordingControlBtn, styles.stopSaveBtn]}
                onPress={handleStopPress}
              >
                <Feather name="square" size={16} color="#FFFFFF" />
                <Text style={styles.stopSaveBtnText}>Stop & Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.card} onPress={handleStartRecording} disabled={isPreparing}>
            <View style={styles.iconCircle}>
              {isPreparing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Feather name="mic" size={24} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.cardTitle}>Tap to start recording</Text>
            <Text style={styles.cardSubtitle}>Ensure a quiet environment for best accuracy</Text>
          </Pressable>
        )}

        {/* Divider & Upload Card */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Upload Audio Card */}
        <Pressable style={styles.card} onPress={handleUploadPress}>
          <View style={styles.uploadIconBox}>
            <Feather name="upload-cloud" size={24} color="#0F294A" />
          </View>
          <Text style={styles.cardTitle}>Upload Audio File</Text>
          <Text style={styles.cardSubtitle}>MP3, WAV, M4A up to 50MB</Text>
        </Pressable>

        {/* Attached Audio List with inline playback, YouTube-style spinner & reorder controls */}
        {assets.length > 0 && (
          <View style={styles.attachedSection}>
            <View style={styles.attachedHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                <Text style={styles.attachedHeader}>
                  Attached Audio ({assets.length})
                </Text>
                {assets.length > 1 && (
                  <Text style={styles.reorderHint}>• Use ▲ / ▼ to reorder</Text>
                )}
              </View>
              <Pressable
                style={styles.headerUploadBtn}
                onPress={handleUploadPress}
                hitSlop={8}
              >
                <Feather name="plus" size={13} color="#0F294A" />
                <Text style={styles.headerUploadBtnText}>Upload File</Text>
              </Pressable>
            </View>

            {assets.map((item, index) => (
              <AudioAssetCard
                key={item.id || item._id}
                asset={item}
                index={index}
                totalCount={assets.length}
                onMoveUp={() => moveAsset(index, index - 1)}
                onMoveDown={() => moveAsset(index, index + 1)}
                onRemove={(id) => removeAsset(id)}
              />
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.primaryButton, (docsLoading || assetsLoading) && { opacity: 0.7 }]}
            onPress={handleProcessAudio}
            disabled={docsLoading || assetsLoading}
          >
            {docsLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Process Audio & Generate Complaint</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleProcessAudio}
            disabled={docsLoading || assetsLoading}
          >
            <Text style={styles.secondaryButtonText}>Save as Draft & Continue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    color: "#0F294A",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0F294A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconCircleActive: {
    backgroundColor: "#EF4444",
  },
  uploadIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    color: "#0F294A",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#64748B",
    fontSize: 13,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  recordingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    gap: 16,
  },
  recordingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#EF4444",
  },
  recordingDotPaused: {
    backgroundColor: "#F59E0B",
  },
  recordingStatusText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F294A",
  },
  recordingSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  recordingTimer: {
    fontSize: 18,
    fontWeight: "800",
    color: "#EF4444",
    fontVariant: ["tabular-nums"],
  },
  recordingControlRow: {
    flexDirection: "row",
    gap: 12,
  },
  recordingControlBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  pauseBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  resumeBtn: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  stopSaveBtn: {
    backgroundColor: "#DC2626",
  },
  recordingControlBtnText: {
    color: "#0F294A",
    fontSize: 14,
    fontWeight: "700",
  },
  stopSaveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  attachedSection: {
    gap: 10,
  },
  attachedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  attachedHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  reorderHint: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  headerUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerUploadBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F294A",
  },
  actions: {
    gap: 14,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#0F294A",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "600",
  },
});