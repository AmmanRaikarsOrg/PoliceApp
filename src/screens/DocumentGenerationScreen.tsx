import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useDocuments } from "../hooks/useDocuments";
import { useAssets } from "../hooks/useAssets";

import { useAudioRecorder } from "../hooks/useAudioRecorder";
import {
  configureAudio,
  requestAudioPermission,
} from "../services/audio/audioService";
import * as DocumentPicker from "expo-document-picker";
import { getInfoAsync } from "expo-file-system/legacy";
import { AudioAssetCard } from "../components/audio/AudioAssetCard";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "DocumentGeneration"
>;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function DocumentGenerationScreen({ navigation, route }: Props) {
  const { caseId, docType: routeDocType } = route.params;
  const insets = useSafeAreaInsets();
  const { isRecording, isPaused, start, pause, resume, stop } = useAudioRecorder();

  const { templates, fetchTemplates, generateDocument, loading: docsLoading } = useDocuments(caseId);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    console.log(`[DocumentGenerationScreen] Loading templates for case "${caseId}"...`);
    fetchTemplates();
  }, [fetchTemplates, caseId]);

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) ||
    templates.find((t) => t.code === routeDocType) ||
    templates[0];
  const selectedDocType = selectedTemplate?.code || routeDocType || "panchanamas";

  const { assets, uploadAsset, removeAsset, moveAsset, loading: assetsLoading } = useAssets(caseId, selectedDocType);

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

  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
    }
  }, [isRecording]);

  const toggleFile = (id: string) => {
    console.log(`[DocumentGenerationScreen] Selected template ID: "${id}"`);
    setSelectedTemplateId(id);
  };

  const handleStartRecording = async () => {
    console.log(`[DocumentGenerationScreen] Starting recording session for docType "${selectedDocType}"...`);
    try {
      setIsPreparing(true);
      const perm = await requestAudioPermission();
      if (!perm.granted) {
        console.warn("[DocumentGenerationScreen] Microphone permission denied");
        Alert.alert("Permission required", "Microphone access is needed.");
        return;
      }
      await configureAudio();
      await start();
      console.log("[DocumentGenerationScreen] ✅ Recording started.");
    } catch (err) {
      console.error("[DocumentGenerationScreen] ❌ Start recording failed:", err);
      Alert.alert("Error", "Unable to start recording.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handlePauseResumePress = async () => {
    if (isPaused) {
      console.log("[DocumentGenerationScreen] Resuming recording...");
      await resume();
    } else {
      console.log("[DocumentGenerationScreen] Pausing recording...");
      await pause();
    }
  };

  const handleStopPress = async () => {
    console.log("[DocumentGenerationScreen] Stopping recording...");
    const uri = await stop();
    if (uri) {
      try {
        console.log(`[DocumentGenerationScreen] File recorded: ${uri.uri}. Getting file size...`);
        const fileInfo = await getInfoAsync(uri.uri);
        const size = fileInfo.exists && typeof fileInfo.size === "number" && fileInfo.size > 0
          ? fileInfo.size
          : 1024;

        console.log(`[DocumentGenerationScreen] Uploading recording to pipeline. Size: ${size} bytes`);
        await uploadAsset(
          uri.uri,
          uri.name || `${selectedDocType}-Audio-${Date.now()}.m4a`,
          "audio/x-m4a",
          size,
          uri.duration,
          "Recorded"
        );
      } catch (error: any) {
        console.error("[DocumentGenerationScreen] ❌ Upload recording error:", error);
        Alert.alert("Upload Error", `Failed to upload recording: ${error.message}`);
      }
    }
  };

  const handleUploadPress = async () => {
    console.log("[DocumentGenerationScreen] User tapped Upload Audio picker...");
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
      });
      if (!res.canceled && res.assets) {
        console.log(`[DocumentGenerationScreen] Selected ${res.assets.length} file(s) from picker`);
        for (const asset of res.assets) {
          const size = asset.size && asset.size > 0 ? asset.size : 1024;
          console.log(`[DocumentGenerationScreen] Uploading picker file: "${asset.name}" (${size} bytes)`);
          await uploadAsset(
            asset.uri,
            asset.name,
            asset.mimeType || "audio/mp3",
            size,
            null,
            "Uploaded"
          );
        }
      }
    } catch (error: any) {
      console.error("[DocumentGenerationScreen] ❌ Picker upload error:", error);
      Alert.alert("Upload Error", `Could not upload audio: ${error.message}`);
    }
  };

  const handleProcessAudio = async () => {
    // Extract asset IDs in the exact user-ordered sequence
    const sourceAssetIds = assets
      .map((a) => a._id || a.id)
      .filter((id): id is string => typeof id === "string" && !id.startsWith("temp_"));

    console.log(`[DocumentGenerationScreen] ==================== START PROCESS AUDIO ====================`);
    console.log(
      `[DocumentGenerationScreen] Case: "${caseId}", Template: "${selectedTemplate?.name}", DocType: "${selectedDocType}". Sending ${sourceAssetIds.length} audio file(s) in sequence:`,
      sourceAssetIds
    );
    try {
      if (!selectedTemplate) {
        Alert.alert("Template Required", "Please select a template from the list.");
        return;
      }
      const newDoc = await generateDocument({ 
        templateId: selectedTemplate.id, 
        docType: selectedTemplate.code as any,
        sourceAssetIds: sourceAssetIds.length > 0 ? sourceAssetIds : undefined,
      });
      const docId = (newDoc as any)?._id || (newDoc as any)?.id;
      console.log(`[DocumentGenerationScreen] ✅ Document generation triggered! Doc ID: "${docId}"`);
      console.log(`[DocumentGenerationScreen] Navigating to CasePageScreen with generatingDocId: "${docId}"`);
      navigation.replace("CasePage", {
        caseId,
        docType: selectedTemplate.code,
        generatingDocId: docId,
      });
    } catch (error: any) {
      console.error("[DocumentGenerationScreen] ❌ Failed to generate document:", error);
      Alert.alert("Error", `Failed to generate document: ${error?.message || "Unknown error"}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom + 20, 24) },
      ]}
    >
      <Text style={styles.title}>Document Generation</Text>

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
          <Text style={styles.cardSubtitle}>Ensure a quiet environment</Text>
        </Pressable>
      )}

      {/* OR Divider */}
      {!isRecording && (
        <>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Upload Card */}
          <Pressable style={styles.card} onPress={handleUploadPress}>
            <View style={styles.uploadIconBox}>
              <Feather name="upload-cloud" size={24} color="#0F294A" />
            </View>
            <Text style={styles.cardTitle}>Upload Audio File</Text>
            <Text style={styles.cardSubtitle}>MP3, WAV, M4A up to 50MB</Text>
          </Pressable>
        </>
      )}

      {/* Attached Audio List with inline playback, YouTube-style spinner & reorder controls */}
      {assets.length > 0 && (
        <View style={styles.attachedSection}>
          <View style={styles.attachedHeaderRow}>
            <Text style={styles.attachedHeader}>
              Attached Audio ({assets.length})
            </Text>
            {assets.length > 1 && (
              <Text style={styles.reorderHint}>Use ▲ / ▼ to reorder sequence</Text>
            )}
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

      {/* Case Files Selector */}
      <View style={styles.matrixContainer}>
        <View style={styles.dropdownHeader}>
          <Text style={styles.dropdownText}>
            Selected Document: {selectedTemplate?.name || "Select Template"}
          </Text>
        </View>

        <Text style={styles.matrixLabel}>AVAILABLE CASE FILES MATRIX</Text>

        <View style={styles.matrixList}>
          {templates.map((item) => {
            const isSelected = item.id === selectedTemplate?.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.matrixItem, isSelected && styles.matrixItemSelected]}
                onPress={() => toggleFile(item.id)}
              >
                <Feather name={(item as any).icon || "file-text"} size={18} color={isSelected ? "#0F294A" : "#64748B"} />
                <Text style={[styles.matrixItemText, isSelected && styles.matrixItemTextSelected]}>
                  {item.name}
                </Text>
                <Feather
                  name={isSelected ? "check" : "chevron-right"}
                  size={16}
                  color={isSelected ? "#0F294A" : "#94A3B8"}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

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
              <Text style={styles.primaryButtonText}>Process Audio & Generate Document</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    gap: 16,
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
    padding: 20,
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F294A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconCircleActive: {
    backgroundColor: "#EF4444",
  },
  uploadIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: {
    color: "#0F294A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#64748B",
    fontSize: 12,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 2,
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
  matrixContainer: {
    gap: 10,
    marginTop: 4,
  },
  dropdownHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 14,
    color: "#64748B",
  },
  matrixLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  matrixList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  matrixItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  matrixItemSelected: {
    backgroundColor: "#F8FAFC",
  },
  matrixItemText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  matrixItemTextSelected: {
    color: "#0F294A",
    fontWeight: "700",
  },
  actions: {
    gap: 12,
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