import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import { TemplateSelector } from "../components/documents/TemplateSelector";
import { AudioRecorder } from "../components/audio/AudioRecorder";
import { AudioUploader } from "../components/audio/AudioUploader";
import { AudioList } from "../components/audio/AudioList";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "DocumentGeneration"
>;

export function DocumentGenerationScreen({
  navigation,
  route,
}: Props) {
  const { caseId } = route.params;

  const handleGenerate = () => {
    navigation.replace("CasePage", {
      caseId,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Document Generation
      </Text>

      <Text style={styles.caseId}>
        Case: {caseId}
      </Text>

      <TemplateSelector />

      <AudioRecorder />

      <AudioUploader />

      <AudioList />

      <Input
        label="Special Instructions"
        placeholder="Add special commands or extra tweaks..."
        multiline
      />

      <Button
        title="Generate Document"
        onPress={handleGenerate}
      />
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
    gap: 20,
  },

  title: {
    color: "#F4F5F7",
    fontSize: 28,
    fontWeight: "800",
  },

  caseId: {
    color: "#9AA3AF",
  },
});