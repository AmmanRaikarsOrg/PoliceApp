import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useDocuments } from "../hooks/useDocuments";

import { useAudioRecorder } from "../hooks/useAudioRecorder";
import {
  configureAudio,
  requestAudioPermission,
} from "../services/audio/audioService";
import * as DocumentPicker from "expo-document-picker";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "DocumentGeneration"
>;

type CaseFileOption = {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
};

export function DocumentGenerationScreen({ navigation, route }: Props) {
  const { caseId } = route.params;
  const insets = useSafeAreaInsets();
  const { isRecording, start, stop } = useAudioRecorder();

  const [isPreparing, setIsPreparing] = useState(false);
  const [caseFiles, setCaseFiles] = useState<CaseFileOption[]>([
    { id: "1", title: "Complaint Form", icon: "file-text", selected: true },
    { id: "2", title: "First Information Report (FIR)", icon: "file", selected: false },
    { id: "3", title: "Panchanama / Seizure Memo", icon: "check-square", selected: false },
    { id: "4", title: "Witness Statements", icon: "users", selected: false },
  ]);

  const toggleFile = (id: string) => {
    setCaseFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      await stop();
      return;
    }

    try {
      setIsPreparing(true);
      const perm = await requestAudioPermission();
      if (!perm.granted) {
        Alert.alert("Permission required", "Microphone access is needed.");
        return;
      }
      await configureAudio();
      await start();
    } catch {
      Alert.alert("Error", "Unable to start recording.");
    } finally {
      setIsPreparing(false);
    }
  };

  const handleUploadPress = async () => {
    try {
      await DocumentPicker.getDocumentAsync({
        type: "audio/*",
      });
    } catch {
      // Handled silently
    }
  };

  const handleProcessAudio = () => {
    const selectedFile = caseFiles.find((f) => f.selected)?.title || "Generated Document";
    navigation.replace("CasePage", {
      caseId,
      newDocumentName: selectedFile,
    });
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

      {/* Record Audio Card */}
      <Pressable style={styles.card} onPress={handleRecordPress} disabled={isPreparing}>
        <View style={[styles.iconCircle, isRecording && styles.iconCircleActive]}>
          {isPreparing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Feather name="mic" size={24} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.cardTitle}>
          {isRecording ? "Tap to stop recording" : "Tap to start recording"}
        </Text>
        <Text style={styles.cardSubtitle}>
          {isRecording ? "Recording audio..." : "Ensure a quiet environment"}
        </Text>
      </Pressable>

      {/* OR Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Upload Card */}
      <Pressable style={styles.card} onPress={handleUploadPress}>
        <View style={styles.uploadIconBox}>
          <Feather name="file-text" size={24} color="#0F294A" />
        </View>
        <Text style={styles.cardTitle}>Upload Audio File</Text>
        <Text style={styles.cardSubtitle}>MP3, WAV, M4A up to 50MB</Text>
      </Pressable>

      {/* Case Files Selector */}
      <View style={styles.matrixContainer}>
        <Pressable style={styles.dropdownHeader}>
          <Text style={styles.dropdownText}>Dropdown to select case files...</Text>
          <Feather name="chevron-down" size={18} color="#64748B" />
        </Pressable>

        <Text style={styles.matrixLabel}>AVAILABLE CASE FILES MATRIX</Text>

        <View style={styles.matrixList}>
          {caseFiles.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.matrixItem, item.selected && styles.matrixItemSelected]}
              onPress={() => toggleFile(item.id)}
            >
              <Feather name={item.icon} size={18} color={item.selected ? "#0F294A" : "#64748B"} />
              <Text style={[styles.matrixItemText, item.selected && styles.matrixItemTextSelected]}>
                {item.title}
              </Text>
              <Feather
                name={item.selected ? "check" : "chevron-right"}
                size={16}
                color={item.selected ? "#0F294A" : "#94A3B8"}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleProcessAudio}>
          <Text style={styles.primaryButtonText}>Process Audio</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleProcessAudio}>
          <Text style={styles.secondaryButtonText}>Save as Draft</Text>
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