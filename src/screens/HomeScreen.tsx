import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "../navigation/types";

import { CaseGrid } from "../components/cases/CaseGrid";
import { CaseSearchBar } from "../components/cases/CaseSearchBar";
import { CaseStatusFilter } from "../components/cases/CaseStatusFilter";
import { CaseTypeFilter } from "../components/cases/CaseTypeFilter";
import { CreateCaseModal } from "../components/cases/CreateCaseModal";
import { useCases } from "../hooks/useCases";
import { useAuth } from "../hooks/useAuth";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [createCaseVisible, setCreateCaseVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const insets = useSafeAreaInsets();
  
  const { user } = useAuth();
  const { cases, loading, refreshCases } = useCases();

  const handleCaseCreated = (caseId: string) => {
    setCreateCaseVisible(false);
    navigation.navigate("ComplaintRegistration", {
      caseId,
    });
  };

  // Collect any custom types already assigned across cases
  const availableTypes = useMemo(() => {
    return Array.from(
      new Set(
        cases
          .map((c) => c.caseType || c.type)
          .filter((t): t is string => Boolean(t && t.trim()))
      )
    );
  }, [cases]);

  // Client & server synchronized filtering
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Status Filter
      if (selectedStatus !== "ALL") {
        const caseStatus = (c.status || "open").toLowerCase();
        const targetStatus = selectedStatus.toLowerCase();
        if (targetStatus === "processing") {
          if (caseStatus !== "processing" && caseStatus !== "in progress") return false;
        } else if (caseStatus !== targetStatus) {
          return false;
        }
      }

      // 2. Case Type Filter
      if (selectedType !== "ALL") {
        const cType = (c.caseType || c.type || "").toLowerCase();
        if (cType !== selectedType.toLowerCase()) return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const num = (c.caseNumber || c.id || "").toLowerCase();
        const name = (c.name || c.title || "").toLowerCase();
        const loc = (c.location || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        const cType = (c.caseType || c.type || "").toLowerCase();

        const match =
          num.includes(q) ||
          name.includes(q) ||
          loc.includes(q) ||
          desc.includes(q) ||
          cType.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [cases, selectedStatus, selectedType, searchQuery]);

  const handleRefresh = () => {
    console.log(
      `[HomeScreen] Refreshing cases with filters: status="${selectedStatus}", type="${selectedType}", search="${searchQuery}"`
    );
    refreshCases({
      status: selectedStatus as any,
      caseType: selectedType !== "ALL" ? selectedType : undefined,
      search: searchQuery || undefined,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=68" }}
            style={styles.profile}
          />
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0F172A" }}>
              {user?.name || "Officer"}
            </Text>
            <Text style={{ fontSize: 13, color: "#64748B" }}>
              Station {user?.policeStationId || "N/A"}
            </Text>
          </View>
        </View>
        <Pressable hitSlop={8} onPress={handleRefresh}>
          <Feather name="rotate-cw" size={20} color="#0F172A" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <CaseSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      {/* Create New Case Card */}
      <View style={styles.createCard}>
        <View style={styles.createCardLeftBorder} />
        <View style={styles.createCardContent}>
          <Text style={styles.createTitle}>CREATE NEW CASE</Text>
          <Text style={styles.createSubtitle}>
            Start a new case and create official documentation.
          </Text>
          <Pressable
            style={styles.createButton}
            onPress={() => setCreateCaseVisible(true)}
          >
            <Text style={styles.createButtonText}>Create New Case</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Filters: Status Filter + Case Type Filter */}
      <View style={styles.filtersSection}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.filterSectionTitle}>CASE STATUS</Text>
          {(selectedStatus !== "ALL" || selectedType !== "ALL" || searchQuery.length > 0) && (
            <Pressable
              onPress={() => {
                setSelectedStatus("ALL");
                setSelectedType("ALL");
                setSearchQuery("");
              }}
              hitSlop={6}
            >
              <Text style={styles.resetFilterText}>Clear Filters</Text>
            </Pressable>
          )}
        </View>

        <CaseStatusFilter
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => {
            console.log(`[HomeScreen] Filter status selected: "${status}"`);
            setSelectedStatus(status);
          }}
        />

        <Text style={[styles.filterSectionTitle, { marginTop: 10 }]}>CASE TYPE</Text>
        <CaseTypeFilter
          selectedType={selectedType}
          onSelectType={(type) => {
            console.log(`[HomeScreen] Filter case type selected: "${type}"`);
            setSelectedType(type);
          }}
          availableTypes={availableTypes}
        />
      </View>

      {/* Results Count & Grid */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCountText}>
          {filteredCases.length} case{filteredCases.length === 1 ? "" : "s"} found
        </Text>
      </View>

      <CaseGrid
        cases={filteredCases}
        loading={loading}
        onRefresh={handleRefresh}
        onCasePress={(caseId) => {
          navigation.navigate("CasePage", {
            caseId,
          });
        }}
      />

      <CreateCaseModal
        visible={createCaseVisible}
        onClose={() => setCreateCaseVisible(false)}
        onCaseCreated={handleCaseCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginTop: 8,
  },
  profile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#CBD5E1",
  },
  createCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  createCardLeftBorder: {
    width: 4,
    backgroundColor: "#0F294A",
  },
  createCardContent: {
    flex: 1,
    padding: 16,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F294A",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  createSubtitle: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 12,
    lineHeight: 18,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F294A",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  filtersSection: {
    marginTop: 12,
    marginBottom: 6,
    gap: 4,
  },
  filterHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  resetFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  resultsInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
});