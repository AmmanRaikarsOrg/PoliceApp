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
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 20,
    gap: 24,
  },

  title: {
    color: "#0F294A",
    fontSize: 28,
    fontWeight: "800",
  },

  caseId: {
    color: "#475569",
  },

  complaintBlock: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  placeholder: {
    color: "#64748B",
  },
});