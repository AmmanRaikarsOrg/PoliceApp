import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
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
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "CasePage">;

// Strictly OPEN and CLOSED status options
const STATUS_CHOICES = [
  {
    key: "open",
    label: "OPEN",
    dot: colors.status.open.dot,
    bg: colors.status.open.bg,
    border: colors.status.open.border,
    text: colors.status.open.text,
    description: "Active police investigation",
  },
  {
    key: "closed",
    label: "CLOSED",
    dot: colors.status.closed.dot,
    bg: colors.status.closed.bg,
    border: colors.status.closed.border,
    text: colors.status.closed.text,
    description: "Case resolved and filed",
  },
];

const PRESET_CASE_TYPES = [
  "Theft",
  "Assault",
  "Cybercrime",
  "Fraud",
  "Missing Person",
  "Narcotics",
  "Traffic",
  "Domestic Dispute",
  "Robbery",
  "Homicide",
  "Other",
];

export function CasePageScreen({ navigation, route }: Props) {
  const { caseId, docType: routeDocType, generatingDocId } = route.params;
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"documents" | "audio" | "info">("documents");
  const [isPollingDoc, setIsPollingDoc] = useState<boolean>(!!generatingDocId);
  const [polledDocStatus, setPolledDocStatus] = useState<string>("generating");

  // Status dropdown & Case Type state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [caseTypeModalVisible, setCaseTypeModalVisible] = useState(false);
  const [caseTypeInput, setCaseTypeInput] = useState("");
  const [savingCaseType, setSavingCaseType] = useState(false);

  const docType = routeDocType || "complaint";

  const { fetchCaseById, selectedCase, updateCase: updateCaseDetails, loading: caseLoading } = useCases();
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
    if (!generatingDocId) return;

    console.log(`[CasePageScreen] Starting status polling for generating document: "${generatingDocId}"...`);
    setIsPollingDoc(true);
    setPolledDocStatus("generating");

    let pollCount = 0;
    const maxPolls = 30; // poll for up to ~75 seconds

    const pollInterval = setInterval(async () => {
      pollCount++;
      console.log(`[CasePageScreen] Polling status (#${pollCount}) for document "${generatingDocId}"...`);
      try {
        const doc = await getDocument(caseId, docType, generatingDocId);
        console.log(`[CasePageScreen] Poll result: status="${doc.status}", hasContent=${Boolean(doc.content)}`);

        if (doc && (doc.status === "final" || (doc.status as any) === "completed" || Boolean(doc.content))) {
          console.log(`[CasePageScreen] ✅ Document generation finished! Refreshing document list.`);
          clearInterval(pollInterval);
          setIsPollingDoc(false);
          setPolledDocStatus("completed");
          fetchDocuments();
        } else if (pollCount >= maxPolls) {
          console.warn(`[CasePageScreen] Polling reached max attempts. Stopping.`);
          clearInterval(pollInterval);
          setIsPollingDoc(false);
          fetchDocuments();
        }
      } catch (err: any) {
        console.warn(`[CasePageScreen] Polling error on attempt #${pollCount}:`, err.message);
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setIsPollingDoc(false);
          fetchDocuments();
        }
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [generatingDocId, caseId, docType, fetchDocuments]);

  const handleOpenMarkdownViewer = (doc: any) => {
    console.log(`[CasePageScreen] Opening Markdown Preview for document "${doc.title || doc._id}"`);
    navigation.navigate("MarkdownPreview", {
      markdown: doc.content || "# No content available",
      title: doc.title || "Generated Document",
      subtitle: `Case: ${selectedCase?.caseNumber || caseId}`,
      caseId,
      documentId: doc._id || doc.id,
    });
  };

  const handleSelectStatus = async (newStatus: string) => {
    setStatusDropdownOpen(false);
    const validStatus = newStatus.toLowerCase() === "closed" ? "closed" : "open";
    console.log(`[CasePageScreen] Officer changed status to "${validStatus}" for case "${caseId}"`);
    try {
      setUpdatingStatus(true);
      await updateCaseDetails(caseId, { status: validStatus as any });
      console.log(`[CasePageScreen] ✅ Case status successfully updated to "${validStatus}" in backend.`);
    } catch (err: any) {
      console.error(`[CasePageScreen] ❌ Failed to update case status:`, err);
      Alert.alert("Error", `Could not update case status: ${err?.message || "Unknown error"}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveCaseType = async (typeToSave?: string) => {
    const finalType = (typeToSave !== undefined ? typeToSave : caseTypeInput).trim();
    if (!finalType) {
      Alert.alert("Case Type Required", "Please enter or select a case category.");
      return;
    }
    console.log(`[CasePageScreen] Officer updating case type to "${finalType}" for case "${caseId}"`);
    try {
      setSavingCaseType(true);
      await updateCaseDetails(caseId, { caseType: finalType });
      setCaseTypeModalVisible(false);
      setCaseTypeInput("");
      console.log(`[CasePageScreen] ✅ Case type successfully updated to "${finalType}" in backend.`);
    } catch (err: any) {
      console.error(`[CasePageScreen] ❌ Failed to update case type:`, err);
      Alert.alert("Error", `Could not update case type: ${err?.message || "Unknown error"}`);
    } finally {
      setSavingCaseType(false);
    }
  };

  const complaintDoc = documents.find(
    (d) => d.docType === "complaint" || d.title?.toLowerCase().includes("complaint")
  );

  const rawStatus = (selectedCase?.status || "open").toLowerCase();
  const currentStatus = rawStatus === "closed" ? "closed" : "open";
  const currentStatusChoice =
    STATUS_CHOICES.find((s) => s.key === currentStatus) || STATUS_CHOICES[0];

  if (caseLoading && !selectedCase) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={colors.primary} />
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
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                setCaseTypeInput(selectedCase?.caseType || selectedCase?.type || "");
                setCaseTypeModalVisible(true);
              }}
              hitSlop={8}
            >
              <Feather name="tag" size={15} color={colors.textMuted} />
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                console.log("[CasePageScreen] Manual refresh triggered by officer");
                fetchCaseById(caseId);
                fetchAssets();
                fetchDocuments();
              }}
              hitSlop={8}
            >
              <Feather name="rotate-cw" size={15} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.caseTitle}>
          {selectedCase?.name || selectedCase?.title || "Unknown Case"}
        </Text>

        {/* STATUS DROPDOWN & CASE TYPE ROW (JUST BELOW CASE TITLE) */}
        <View style={styles.statusAndTypeRow}>
          {/* Status Dropdown Trigger (Only OPEN & CLOSED) */}
          <Pressable
            style={[
              styles.statusDropdownTrigger,
              { backgroundColor: currentStatusChoice.bg, borderColor: currentStatusChoice.border },
            ]}
            onPress={() => setStatusDropdownOpen((prev) => !prev)}
            hitSlop={6}
          >
            <View style={[styles.statusDot, { backgroundColor: currentStatusChoice.dot }]} />
            <Text style={[styles.statusDropdownText, { color: currentStatusChoice.text }]}>
              {currentStatusChoice.label}
            </Text>
            {updatingStatus ? (
              <ActivityIndicator size="small" color={currentStatusChoice.text} style={{ marginLeft: 4 }} />
            ) : (
              <Feather
                name={statusDropdownOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color={currentStatusChoice.text}
              />
            )}
          </Pressable>

          {/* Case Type Tag / Button */}
          <Pressable
            style={styles.caseTypeTagBtn}
            onPress={() => {
              setCaseTypeInput(selectedCase?.caseType || selectedCase?.type || "");
              setCaseTypeModalVisible(true);
            }}
            hitSlop={6}
          >
            <Feather name="folder" size={12} color={colors.primary} />
            <Text style={styles.caseTypeTagText} numberOfLines={1}>
              {selectedCase?.caseType || selectedCase?.type || "+ Add Case Type"}
            </Text>
            <Feather name="edit-2" size={11} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Inline Status Dropdown Menu (Only OPEN and CLOSED) */}
        {statusDropdownOpen && (
          <View style={styles.statusDropdownMenu}>
            <Text style={styles.dropdownHeaderTitle}>UPDATE CASE STATUS</Text>
            {STATUS_CHOICES.map((choice) => {
              const isSelected = choice.key === currentStatus;
              return (
                <Pressable
                  key={choice.key}
                  style={[
                    styles.statusDropdownItem,
                    isSelected && { backgroundColor: choice.bg },
                  ]}
                  onPress={() => handleSelectStatus(choice.key)}
                >
                  <View style={[styles.statusDot, { backgroundColor: choice.dot }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusChoiceLabel, { color: choice.text }]}>
                      {choice.label}
                    </Text>
                    <Text style={styles.statusChoiceSub}>{choice.description}</Text>
                  </View>
                  {isSelected && <Feather name="check" size={16} color={choice.text} />}
                </Pressable>
              );
            })}
          </View>
        )}
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
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text style={styles.viewComplaintDocText}>
              View Formatted Complaint Document
            </Text>
            <Feather name="arrow-right" size={15} color={colors.primary} />
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
            color={activeTab === "documents" ? colors.primary : colors.textMuted}
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
            name="music"
            size={15}
            color={activeTab === "audio" ? colors.primary : colors.textMuted}
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
            color={activeTab === "info" ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
            Case Info
          </Text>
        </Pressable>
      </View>

      {/* Tab Content: Documents */}
      {activeTab === "documents" && (
        <View style={styles.docsSection}>
          {/* Active AI Document Generation Progress Card */}
          {isPollingDoc && (
            <View style={styles.processingCard}>
              <View style={styles.processingSpinnerContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
              <View style={styles.processingInfo}>
                <Text style={styles.processingTitle}>AI Document Generation in Progress</Text>
                <Text style={styles.processingSubtext}>
                  Analyzing audio context and structuring Markdown...
                </Text>
                {generatingDocId && (
                  <View style={styles.docIdBadge}>
                    <Text style={styles.docIdBadgeText}>Doc ID: {generatingDocId}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {documents.map((doc) => (
            <Pressable
              key={doc._id || doc.id}
              style={styles.docCard}
              onPress={() => handleOpenMarkdownViewer(doc)}
            >
              <View style={styles.docIconBox}>
                <Feather name="file-text" size={20} color={colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {doc.title || "Untitled Document"}
                </Text>
                <Text style={styles.docMeta}>
                  {doc.docType?.toUpperCase() || "DOC"} • {doc.status || "Draft"} •{" "}
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Recent"}
                </Text>
              </View>
              <View style={styles.viewDocBadge}>
                <Text style={styles.viewDocBadgeText}>View</Text>
                <Feather name="chevron-right" size={15} color={colors.accent} />
              </View>
            </Pressable>
          ))}

          {documents.length === 0 && !docsLoading && !isPollingDoc && (
            <View style={styles.emptyTabContent}>
              <Feather name="folder" size={32} color={colors.borderDark} />
              <Text style={styles.emptyTabText}>No documents generated yet.</Text>
            </View>
          )}

          {/* Generate Document Shortcut Button */}
          <Pressable
            style={styles.generateButton}
            onPress={() => {
              navigation.navigate("DocumentGeneration", {
                caseId,
                docType,
              });
            }}
          >
            <Feather name="plus-circle" size={18} color={colors.primary} />
            <Text style={styles.generateButtonText}>GENERATE NEW DOCUMENT</Text>
          </Pressable>
        </View>
      )}

      {/* Tab Content: Audio (with playback, loaders & download) */}
      {activeTab === "audio" && (
        <View style={styles.docsSection}>
          {assets.map((asset, index) => (
            <AudioAssetCard
              key={asset._id || asset.id}
              asset={asset}
              index={index}
              totalCount={assets.length}
              onRemove={(id) => removeAsset(id)}
            />
          ))}

          {assets.length === 0 && !assetsLoading && (
            <View style={styles.emptyTabContent}>
              <Feather name="mic" size={32} color={colors.borderDark} />
              <Text style={styles.emptyTabText}>No audio recordings attached yet.</Text>
            </View>
          )}
        </View>
      )}

      {/* Tab Content: Case Info */}
      {activeTab === "info" && (
        <View style={styles.infoCard}>
          <Text style={styles.infoRowTitle}>Police Station</Text>
          <Text style={styles.infoRowValue}>
            {selectedCase?.policeStationId || "Not specified"}
          </Text>

          <Text style={styles.infoRowTitle}>FIR / Case Number</Text>
          <Text style={styles.infoRowValue}>
            {selectedCase?.firNumber || selectedCase?.caseNumber || "Pending"}
          </Text>

          <Text style={styles.infoRowTitle}>Case Type / Category</Text>
          <Text style={styles.infoRowValue}>
            {selectedCase?.caseType || selectedCase?.type || "Not specified"}
          </Text>

          <Text style={styles.infoRowTitle}>Incident Location</Text>
          <Text style={styles.infoRowValue}>
            {selectedCase?.location || "Not specified"}
          </Text>

          <Text style={styles.infoRowTitle}>Date of Incident</Text>
          <Text style={styles.infoRowValue}>
            {selectedCase?.date
              ? new Date(selectedCase.date).toLocaleDateString()
              : "Not recorded"}
          </Text>

          <Text style={styles.infoRowTitle}>Officer in Charge</Text>
          <Text style={styles.infoRowValue}>
            {selectedCase?.assignedOfficer || selectedCase?.officerId || "Assigned Officer"}
          </Text>
        </View>
      )}

      {/* Modal for Setting / Updating Case Type */}
      <Modal
        visible={caseTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCaseTypeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCaseTypeModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Feather name="tag" size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>Set Case Type</Text>
              </View>
              <Pressable
                onPress={() => setCaseTypeModalVisible(false)}
                hitSlop={8}
              >
                <Feather name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              Select a standard police category or enter a custom type:
            </Text>

            {/* Preset chips */}
            <View style={styles.presetChipsWrapper}>
              {PRESET_CASE_TYPES.map((preset) => {
                const isSelected =
                  caseTypeInput.toLowerCase() === preset.toLowerCase();
                return (
                  <Pressable
                    key={preset}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipSelected,
                    ]}
                    onPress={() => setCaseTypeInput(preset)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextSelected,
                      ]}
                    >
                      {preset}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Input */}
            <TextInput
              style={styles.caseTypeTextInput}
              placeholder="Or type custom category..."
              placeholderTextColor={colors.textPlaceholder}
              value={caseTypeInput}
              onChangeText={setCaseTypeInput}
              autoCapitalize="words"
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setCaseTypeModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveTypeBtn}
                onPress={() => handleSaveCaseType()}
                disabled={savingCaseType}
              >
                {savingCaseType ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.saveTypeBtnText}>Save Case Type</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  caseHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  caseHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caseIdBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  caseIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.status.closed.text,
  },
  iconActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  caseTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  statusAndTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  statusDropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDropdownText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  caseTypeTagBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  caseTypeTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    maxWidth: 160,
  },
  statusDropdownMenu: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginTop: 6,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownHeaderTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textPlaceholder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    letterSpacing: 0.5,
  },
  statusDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 10,
  },
  statusChoiceLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  statusChoiceSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  detailsLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  detailsText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "700",
  },
  docsSection: {
    gap: 12,
  },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
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
    color: colors.primary,
  },
  docMeta: {
    fontSize: 12,
    color: colors.textMuted,
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
    borderColor: colors.borderMedium,
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  emptyTabContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 8,
  },
  emptyTabText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  viewComplaintDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
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
    color: colors.primary,
  },
  processingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.info.bg,
    borderWidth: 1.5,
    borderColor: colors.info.border,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  processingSpinnerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentLight,
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
    color: colors.primaryLight,
  },
  processingSubtext: {
    fontSize: 12,
    color: colors.accent,
  },
  docIdBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.info.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  docIdBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryLight,
    fontVariant: ["tabular-nums"],
  },
  viewDocBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.info.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  viewDocBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.accent,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  infoRowTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  presetChipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 4,
  },
  presetChip: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  presetChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.status.closed.text,
  },
  presetChipTextSelected: {
    color: colors.textInverse,
    fontWeight: "700",
  },
  caseTypeTextInput: {
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  saveTypeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  saveTypeBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: "700",
  },
});