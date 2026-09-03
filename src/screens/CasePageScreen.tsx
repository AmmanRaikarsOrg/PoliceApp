import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useCases } from "../hooks/useCases";
import { useDocuments } from "../hooks/useDocuments";
import { useAssets } from "../hooks/useAssets";
import { getDocument } from "../services/documents/documentService";
import { AudioAssetCard } from "../components/audio/AudioAssetCard";

type Props = NativeStackScreenProps<RootStackParamList, "CasePage">;

export function CasePageScreen({ navigation, route }: Props) {
  const { caseId, docType: routeDocType, generatingDocId } = route.params;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"documents" | "audio" | "info">("documents");
  const [activeGeneratingDocId, setActiveGeneratingDocId] = useState<string | null>(
    generatingDocId || null
  );

  const docType = routeDocType || "complaint";

  const { fetchCaseById, selectedCase, loading: caseLoading } = useCases();
  const { documents, fetchDocuments, loading: docsLoading } = useDocuments(caseId, docType);
  const { assets, fetchAssets, removeAsset, loading: assetsLoading } = useAssets(caseId, docType);

  useEffect(() => {
    console.log(`[CasePageScreen] Initializing case screen for caseId: "${caseId}", docType: "${docType}"`);
    fetchCaseById(caseId);
    fetchAssets();
    fetchDocuments();
  }, [caseId, docType, fetchCaseById, fetchAssets, fetchDocuments]);

  // Document Generation Status Polling
  useEffect(() => {
    if (!activeGeneratingDocId) return;

    console.log(`[CasePageScreen] ==================== START STATUS POLLING ====================`);
    console.log(`[CasePageScreen] Polling generation status for Document ID: "${activeGeneratingDocId}"...`);

    let attempts = 0;
    const maxAttempts = 30; // 30 * 2.5s = 75s

    const interval = setInterval(async () => {
      attempts++;
      console.log(`[CasePageScreen] Poll #${attempts}: Checking document "${activeGeneratingDocId}"...`);
      try {
        const doc = await getDocument(caseId, docType, activeGeneratingDocId);
        const hasContent = !!(doc?.content || (doc as any)?.markdown);
        const isDone = doc?.status === "draft" || doc?.status === "final";

        console.log(`[CasePageScreen] Status check: status="${doc?.status}", hasContent=${hasContent}`);
        if (isDone && hasContent) {
          console.log(`[CasePageScreen] 🎉 AI Generation COMPLETE! Document "${doc.title}" is ready.`);
          setActiveGeneratingDocId(null);
          await fetchDocuments();
        }
      } catch (pollErr: any) {
        console.warn(`[CasePageScreen] Poll check warning:`, pollErr.message);
      }

      if (attempts >= maxAttempts) {
        console.warn(`[CasePageScreen] Polling reached max attempts. Stopping active polling.`);
        setActiveGeneratingDocId(null);
        fetchDocuments();
      }
    }, 2500);

    return () => {
      console.log(`[CasePageScreen] Clearing polling interval for Document ID: "${activeGeneratingDocId}"`);
      clearInterval(interval);
    };
  }, [activeGeneratingDocId, caseId, docType, fetchDocuments]);

  const handleGenerateDocument = () => {
    console.log(`[CasePageScreen] User tapped Generate New Document for docType "${docType}"`);
    navigation.navigate("DocumentGeneration", { caseId, docType });
  };

  const handleOpenMarkdownViewer = (doc: any) => {
    const docId = doc._id || doc.id;
    console.log(`[CasePageScreen] User tapped document "${doc.title}" (ID: ${docId}). Opening Markdown Viewer...`);
    navigation.navigate("MarkdownPreview", {
      caseId,
      documentId: docId,
      title: doc.title || "Case Document",
      subtitle: `${(doc.docType || docType).toUpperCase()} • ${doc.status?.toUpperCase() || "READY"}`,
      markdown: doc.content || doc.markdown || "",
    });
  };

  // Check for any complaint document to display in complaint section
  const complaintDoc =
    documents.find((d) => d.docType === "complaint") ||
    (docType === "complaint" && documents.length > 0 ? documents[0] : null);

  if (caseLoading && !selectedCase) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0F294A" />
      </View>
    );
  }

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
            <Text style={styles.caseIdText}>{selectedCase?.caseNumber || caseId}</Text>
          </View>
          <View style={styles.iconActions}>
            <Pressable style={styles.iconBtn}>
              <Feather name="edit-3" size={15} color="#475569" />
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                console.log("[CasePageScreen] Manual refresh triggered by officer");
                fetchCaseById(caseId);
                fetchAssets();
                fetchDocuments();
              }}
            >
              <Feather name="rotate-cw" size={15} color="#475569" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.caseTitle}>
          {selectedCase?.name || selectedCase?.title || "Unknown Case"}
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {selectedCase?.status?.toUpperCase() || "OPEN"}
          </Text>
        </View>
      </View>

      {/* Complaint Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsLabel}>COMPLAINT DETAILS</Text>
        <Text style={styles.detailsText}>
          {selectedCase?.description ||
            selectedCase?.complaintDetails ||
            "No details provided for this case."}
        </Text>

        {/* Action to view the complaint document in markdown if generated */}
        {complaintDoc && (
          <Pressable
            style={styles.viewComplaintDocBtn}
            onPress={() => handleOpenMarkdownViewer(complaintDoc)}
          >
            <Feather name="file-text" size={16} color="#0F294A" />
            <Text style={styles.viewComplaintDocText}>
              View Formatted Complaint Document
            </Text>
            <Feather name="arrow-right" size={15} color="#0F294A" />
          </Pressable>
        )}
      </View>

      {/* Segmented Navigation Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "documents" && styles.activeTab]}
          onPress={() => setActiveTab("documents")}
        >
          <Feather
            name="file-text"
            size={15}
            color={activeTab === "documents" ? "#0F294A" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "documents" && styles.activeTabText]}>
            Documents ({documents.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "audio" && styles.activeTab]}
          onPress={() => setActiveTab("audio")}
        >
          <Feather
            name="mic"
            size={15}
            color={activeTab === "audio" ? "#0F294A" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "audio" && styles.activeTabText]}>
            Audio ({assets.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "info" && styles.activeTab]}
          onPress={() => setActiveTab("info")}
        >
          <Feather
            name="info"
            size={15}
            color={activeTab === "info" ? "#0F294A" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
            Information
          </Text>
        </Pressable>
      </View>

      {/* Tab Content: Documents */}
      {activeTab === "documents" && (
        <View style={styles.docsSection}>
          {/* Active AI Generation Processing Card */}
          {activeGeneratingDocId && (
            <View style={styles.processingCard}>
              <View style={styles.processingSpinnerContainer}>
                <ActivityIndicator size="small" color="#2563EB" />
              </View>
              <View style={styles.processingInfo}>
                <Text style={styles.processingTitle}>AI Document Generation in Progress</Text>
                <Text style={styles.processingSubtext}>
                  Analyzing audio context and structuring Markdown...
                </Text>
                <View style={styles.docIdBadge}>
                  <Text style={styles.docIdBadgeText}>Doc ID: {activeGeneratingDocId}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Document List */}
          {documents.map((doc) => (
            <Pressable
              key={doc._id || (doc as any).id}
              style={styles.docCard}
              onPress={() => handleOpenMarkdownViewer(doc)}
            >
              <View style={styles.docIconBox}>
                <Feather name="file-text" size={20} color="#0F294A" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docMeta}>
                  Status: {doc.status?.toUpperCase() || "READY"} • {doc.docType || "Document"}
                </Text>
              </View>
              <View style={styles.viewDocBadge}>
                <Text style={styles.viewDocBadgeText}>View</Text>
                <Feather name="chevron-right" size={14} color="#2563EB" />
              </View>
            </Pressable>
          ))}

          {documents.length === 0 && !docsLoading && !activeGeneratingDocId && (
            <View style={styles.emptyTabContent}>
              <Feather name="file" size={32} color="#94A3B8" />
              <Text style={styles.emptyTabText}>No documents generated yet.</Text>
            </View>
          )}

          <Pressable style={styles.generateButton} onPress={handleGenerateDocument}>
            <Feather name="plus" size={16} color="#0F294A" />
            <Text style={styles.generateButtonText}>GENERATE NEW DOCUMENT</Text>
          </Pressable>
        </View>
      )}

      {/* Tab Content: Audio (with playback & loaders) */}
      {activeTab === "audio" && (
        <View style={styles.docsSection}>
          {assets.map((asset) => (
            <AudioAssetCard
              key={asset._id || asset.id}
              asset={asset}
              onRemove={(id) => removeAsset(id)}
            />
          ))}

          {assets.length === 0 && !assetsLoading && (
            <View style={styles.emptyTabContent}>
              <Feather name="mic" size={32} color="#94A3B8" />
              <Text style={styles.emptyTabText}>No audio recordings attached yet.</Text>
            </View>
          )}
        </View>
      )}

      {/* Tab Content: Info */}
      {activeTab === "info" && (
        <View style={styles.infoCard}>
          <Text style={styles.infoRowTitle}>Police Station</Text>
          <Text style={styles.infoRowValue}>{selectedCase?.policeStationId || "Central Station"}</Text>

          <Text style={styles.infoRowTitle}>FIR Number</Text>
          <Text style={styles.infoRowValue}>{selectedCase?.firNumber || "N/A"}</Text>

          <Text style={styles.infoRowTitle}>Location of Incident</Text>
          <Text style={styles.infoRowValue}>{selectedCase?.location || "Not specified"}</Text>

          <Text style={styles.infoRowTitle}>Date of Incident</Text>
          <Text style={styles.infoRowValue}>{selectedCase?.date || "N/A"}</Text>
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
  viewComplaintDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  viewComplaintDocText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F294A",
  },
  processingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#93C5FD",
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  processingSpinnerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  processingInfo: {
    flex: 1,
    gap: 4,
  },
  processingTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E40AF",
  },
  processingSubtext: {
    fontSize: 12,
    color: "#3B82F6",
  },
  docIdBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#BFDBFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  docIdBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E3A8A",
    fontVariant: ["tabular-nums"],
  },
  viewDocBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  viewDocBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 6,
  },
  infoRowTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F294A",
  },
});