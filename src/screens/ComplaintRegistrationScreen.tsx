import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import { AudioRecorder } from "../components/audio/AudioRecorder";
import { AudioUploader } from "../components/audio/AudioUploader";
import { AudioList } from "../components/audio/AudioList";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ComplaintRegistration"
>;

export function ComplaintRegistrationScreen({ navigation, route }: Props) {
  const { caseId } = route.params;
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    navigation.replace("CasePage", {
      caseId,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 20 + insets.bottom },
      ]}
    >
      <Text style={styles.title}>Complaint Registration</Text>

      <Text style={styles.caseId}>
        Case: {caseId}
      </Text>

      <AudioRecorder />

      <AudioUploader />

      <AudioList />

      <Input
        label="Special Instructions"
        placeholder="Add special commands or extra tweaks..."
        multiline
      />

      <Button
        title="Complete Complaint"
        onPress={handleContinue}
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