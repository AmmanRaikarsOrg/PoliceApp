import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import {
  AudioRecorder,
  type RecordedAudio,
} from "../components/audio/AudioRecorder";
import {
  AudioUploader,
  type UploadedAudio,
} from "../components/audio/AudioUploader";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ComplaintRegistration"
>;

type ComplaintAudio = {
  id: string;
  name: string;
  uri: string;
  source: "Recorded" | "Uploaded";
};

export function ComplaintRegistrationScreen({ navigation, route }: Props) {
  const { caseId } = route.params;
  const [recordings, setRecordings] = useState<ComplaintAudio[]>([]);
  const [instructions, setInstructions] = useState("");

  const addRecording = (
    recording: RecordedAudio | UploadedAudio,
    source: ComplaintAudio["source"]
  ) => {
    setRecordings((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        name: recording.name,
        uri: recording.uri,
        source,
      },
    ]);
  };

  const handleAudioSelected = (audio: UploadedAudio[]) => {
    setRecordings((current) => [
      ...current,
      ...audio.map((recording, index) => ({
        id: `${Date.now()}-${index}-${Math.random()}`,
        name: recording.name,
        uri: recording.uri,
        source: "Uploaded" as const,
      })),
    ]);
  };

  const removeRecording = (id: string) => {
    setRecordings((current) =>
      current.filter((recording) => recording.id !== id)
    );
  };

  const handleContinue = () => {
    navigation.replace("CasePage", {
      caseId,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>NEW COMPLAINT</Text>
        <Text style={styles.title}>Complaint Registration</Text>
        <Text style={styles.subtitle}>
          Capture the complainant’s statement or attach an existing audio file.
        </Text>
      </View>

      <View style={styles.caseBadge}>
        <Text style={styles.caseLabel}>CASE ID</Text>
        <Text style={styles.caseId}>{caseId}</Text>
      </View>

      <View style={styles.recorderCard}>
        <Text style={styles.sectionTitle}>Record statement</Text>
        <Text style={styles.sectionDescription}>
          Keep the phone close to the speaker for a clear recording.
        </Text>

        <AudioRecorder
          onRecordingComplete={(recording) =>
            addRecording(recording, "Recorded")
          }
        />
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Or upload audio</Text>
        <AudioUploader onAudioSelected={handleAudioSelected} />
      </View>

      <View style={styles.recordingsSection}>
        <View style={styles.recordingsHeader}>
          <Text style={styles.sectionTitle}>Attached audio</Text>
          <Text style={styles.recordingCount}>{recordings.length}</Text>
        </View>

        {recordings.length === 0 ? (
          <Text style={styles.emptyState}>
            No audio has been attached yet.
          </Text>
        ) : (
          recordings.map((recording, index) => (
            <View key={recording.id} style={styles.audioRow}>
              <View style={styles.audioNumber}>
                <Text style={styles.audioNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.audioDetails}>
                <Text numberOfLines={1} style={styles.audioName}>
                  {recording.name}
                </Text>
                <Text style={styles.audioMeta}>
                  {recording.source} audio
                </Text>
              </View>

              <Pressable
                accessibilityLabel={`Remove ${recording.name}`}
                hitSlop={10}
                onPress={() => removeRecording(recording.id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Input
        label="Special Instructions"
        placeholder="Add special commands or extra tweaks..."
        multiline
        value={instructions}
        onChangeText={setInstructions}
      />

      <Button title="Complete Complaint" onPress={handleContinue} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },

  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 20,
  },

  heading: {
    gap: 7,
  },

  eyebrow: {
    color: "#8EA9FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  title: {
    color: "#F4F5F7",
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    color: "#9AA3AF",
    fontSize: 15,
    lineHeight: 22,
  },

  caseBadge: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
    gap: 2,
  },

  caseLabel: {
    color: "#7E8996",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  caseId: {
    color: "#9AA3AF",
    fontSize: 14,
    fontWeight: "700",
  },

  recorderCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
  },

  sectionTitle: {
    color: "#F4F5F7",
    fontSize: 17,
    fontWeight: "800",
  },

  sectionDescription: {
    color: "#9AA3AF",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  uploadSection: {
    gap: 10,
  },

  recordingsSection: {
    gap: 10,
  },

  recordingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  recordingCount: {
    minWidth: 24,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: "hidden",
    borderRadius: 12,
    color: "#C8D2E0",
    backgroundColor: "#252B33",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyState: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#39424E",
    color: "#7E8996",
    textAlign: "center",
  },

  audioRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
  },

  audioNumber: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#252B33",
  },

  audioNumberText: {
    color: "#DDE5EF",
    fontWeight: "800",
  },

  audioDetails: {
    flex: 1,
    gap: 3,
  },

  audioName: {
    color: "#F4F5F7",
    fontSize: 14,
    fontWeight: "700",
  },

  audioMeta: {
    color: "#8994A2",
    fontSize: 12,
  },

  removeText: {
    color: "#FF8585",
    fontSize: 13,
    fontWeight: "700",
  },
});