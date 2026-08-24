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

import { DocumentList } from "../components/documents/DocumentList";
import { Button } from "../components/common/Button";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "CasePage"
>;

export function CasePageScreen({ navigation, route }: Props) {
  const { caseId } = route.params;
  const insets = useSafeAreaInsets();

  const handleGenerateDocument = () => {
    navigation.navigate("DocumentGeneration", {
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
      <Text style={styles.title}>Case</Text>

      <Text style={styles.caseId}>
        Case ID: {caseId}
      </Text>

      {/* Complaint information */}
      <View style={styles.complaintBlock}>
        <Text style={styles.sectionTitle}>
          Complaint Information
        </Text>

        <Text style={styles.placeholder}>
          Complaint information will appear here.
        </Text>
      </View>

      {/* Generated documents */}
      <View>
        <Text style={styles.sectionTitle}>
          Generated Documents
        </Text>

        <DocumentList />
      </View>

      <Button
        title="Generate New Document"
        onPress={handleGenerateDocument}
      />

      {/* Case type and status controls will be added here. */}
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
    gap: 24,
  },

  title: {
    color: "#F4F5F7",
    fontSize: 28,
    fontWeight: "800",
  },

  caseId: {
    color: "#9AA3AF",
  },

  complaintBlock: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#15181D",
  },

  sectionTitle: {
    color: "#F4F5F7",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  placeholder: {
    color: "#9AA3AF",
  },
});