import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CasePage">;

type CaseDoc = {
  id: string;
  title: string;
  meta: string;
  type: string;
};

const INITIAL_DOCS: CaseDoc[] = [
  {
    id: "1",
    title: "Initial FIR Draft",
    meta: "Uploaded: Oct 25, 2023 • PDF",
    type: "PDF",
  },
  {
    id: "2",
    title: "Witness Statement - J. Doe",
    meta: "Uploaded: Oct 26, 2023 • DOCX",
    type: "DOCX",
  },
  {
    id: "3",
    title: "Crime Scene Evidence Log",
    meta: "Uploaded: Oct 26, 2023 • PDF",
    type: "PDF",
  },
];

export function CasePageScreen({ navigation, route }: Props) {
  const { caseId, newDocumentName } = route.params;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"documents" | "audio" | "info">("documents");
  const [documents, setDocuments] = useState<CaseDoc[]>(INITIAL_DOCS);

  useEffect(() => {
    if (newDocumentName) {
      const formattedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      setDocuments((prev) => [
        {
          id: String(Date.now()),
          title: newDocumentName,
          meta: `Uploaded: ${formattedDate} • PDF`,
          type: "PDF",
        },
        ...prev,
      ]);
    }
  }, [newDocumentName]);

  const handleGenerateDocument = () => {
    navigation.navigate("DocumentGeneration", { caseId });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom + 20, 24) },
      ]}
    >
      {/* Case Info Header Card */}
      <View style={styles.caseHeaderCard}>
        <View style={styles.caseHeaderTop}>
          <View style={styles.caseIdBadge}>
            <Text style={styles.caseIdText}>{caseId || "CR-2023-0492"}</Text>
          </View>
          <View style={styles.iconActions}>
            <Pressable style={styles.iconBtn}>
              <Feather name="edit-3" size={15} color="#475569" />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Feather name="rotate-cw" size={15} color="#475569" />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Feather name="download" size={15} color="#475569" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.caseTitle}>State vs. Doe - Burglary</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Active Investigation</Text>
        </View>
      </View>

      {/* Complaint Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsLabel}>COMPLAINT DETAILS</Text>
        <Text style={styles.detailsText}>
          On October 12, 2023, officers responded to a reported burglary at 142 Elm St.
          The homeowner reported forced entry through the rear patio door. Preliminary assessment
          indicates several high-value electronic items were removed from the premises. Awaiting full
          inventory from the victim.
        </Text>
      </View>

      {/* Segmented Navigation Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "documents" && styles.activeTab]}
          onPress={() => setActiveTab("documents")}
        >
          <Feather name="file-text" size={15} color={activeTab === "documents" ? "#0F294A" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "documents" && styles.activeTabText]}>Documents</Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "audio" && styles.activeTab]}
          onPress={() => setActiveTab("audio")}
        >
          <Feather name="mic" size={15} color={activeTab === "audio" ? "#0F294A" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "audio" && styles.activeTabText]}>Audio</Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "info" && styles.activeTab]}
          onPress={() => setActiveTab("info")}
        >
          <Feather name="info" size={15} color={activeTab === "info" ? "#0F294A" : "#64748B"} />
          <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>Information</Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      {activeTab === "documents" && (
        <View style={styles.docsSection}>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.docIconBox}>
                <Feather name="file-text" size={20} color="#0F294A" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docMeta}>{doc.meta}</Text>
              </View>
              <Pressable hitSlop={10}>
                <Feather name="more-vertical" size={18} color="#64748B" />
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.generateButton} onPress={handleGenerateDocument}>
            <Feather name="plus" size={16} color="#0F294A" />
            <Text style={styles.generateButtonText}>GENERATE NEW DOCUMENT</Text>
          </Pressable>
        </View>
      )}

      {activeTab === "audio" && (
        <View style={styles.emptyTabContent}>
          <Feather name="mic" size={32} color="#94A3B8" />
          <Text style={styles.emptyTabText}>No audio recordings attached yet.</Text>
        </View>
      )}

      {activeTab === "info" && (
        <View style={styles.emptyTabContent}>
          <Feather name="info" size={32} color="#94A3B8" />
          <Text style={styles.emptyTabText}>Officer in charge: Det. Smith #402</Text>
        </View>
      )}
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
  caseHeaderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  caseHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caseIdBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  caseIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  iconActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  caseTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F294A",
    letterSpacing: -0.3,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  detailsLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  detailsText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    marginVertical: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  activeTab: {
    borderColor: "#0F294A",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: "#0F294A",
    fontWeight: "700",
  },
  docsSection: {
    gap: 12,
  },
  docCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: {
    flex: 1,
    gap: 2,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F294A",
  },
  docMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    marginTop: 4,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F294A",
    letterSpacing: 0.5,
  },
  emptyTabContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 8,
  },
  emptyTabText: {
    color: "#64748B",
    fontSize: 14,
  },
});