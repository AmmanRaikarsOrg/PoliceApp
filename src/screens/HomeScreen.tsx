import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
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

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [createCaseVisible, setCreateCaseVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const handleCaseCreated = (caseId: string) => {
    setCreateCaseVisible(false);

    navigation.navigate("ComplaintRegistration", {
      caseId,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=68" }}
          style={styles.profile}
        />
        <Pressable>
          <Feather name="bell" size={24} color="#0F172A" />
        </Pressable>
      </View>

      <CaseSearchBar />

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

      <View style={styles.filters}>
        <CaseStatusFilter />
        <CaseTypeFilter />
      </View>

      <CaseGrid
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
    marginTop: 20,
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
    padding: 20,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  createSubtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 16,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: "#0F294A",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  filters: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
});