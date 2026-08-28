import React, { useState } from "react";
import {
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
import {
  configureAudio,
  requestAudioPermission,
} from "../services/audio/audioService";
import * as DocumentPicker from "expo-document-picker";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ComplaintRegistration"
>;

type AttachedAudio = {
  id: string;
  name: string;
  source: "Recorded" | "Uploaded";
};

export function ComplaintRegistrationScreen({ navigation, route }: Props) {
  const { caseId } = route.params;
  const insets = useSafeAreaInsets();
  const { isRecording, start, stop } = useAudioRecorder();

  const [isPreparing, setIsPreparing] = useState(false);
  const [recordings, setRecordings] = useState<AttachedAudio[]>([]);

  const handleRecordPress = async () => {
    if (isRecording) {
      const uri = await stop();
      if (uri) {
        setRecordings((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            name: `Complaint Recording ${prev.length + 1}`,
            source: "Recorded",
          },
        ]);
      }
      return;
    }

    try {
      setIsPreparing(true);
      const perm = await requestAudioPermission();
      if (!perm.granted) {
        Alert.alert("Permission required", "Microphone access is needed to record.");
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
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
      });

      if (!res.canceled && res.assets) {
        const newAudios: AttachedAudio[] = res.assets.map((asset, i) => ({
          id: `${Date.now()}-${i}`,
          name: asset.name,
          source: "Uploaded",
        }));
        setRecordings((prev) => [...prev, ...newAudios]);
      }
    } catch {
      Alert.alert("Error", "Could not upload audio file.");
    }
  };

  const handleProcessAudio = () => {
    navigation.replace("CasePage", { caseId });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom + 20, 24) },
      ]}
    >
      <Text style={styles.title}>Complaint Registration</Text>

      {/* Record Card */}
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

      {/* Attached Audio List */}
      {recordings.length > 0 && (
        <View style={styles.attachedContainer}>
          <Text style={styles.attachedHeader}>Attached Files ({recordings.length})</Text>
          {recordings.map((item) => (
            <View key={item.id} style={styles.audioRow}>
              <Feather name="music" size={16} color="#0F294A" />
              <Text style={styles.audioName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.audioSource}>{item.source}</Text>
            </View>
          ))}
        </View>
      )}

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
  attachedContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  attachedHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 2,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  audioName: {
    flex: 1,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
  },
  audioSource: {
    color: "#64748B",
    fontSize: 12,
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