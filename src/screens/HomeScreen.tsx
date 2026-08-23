import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

import { CaseSearchBar } from "../components/cases/CaseSearchBar";
import { CaseStatusFilter } from "../components/cases/CaseStatusFilter";
import { CaseTypeFilter } from "../components/cases/CaseTypeFilter";
import { CaseGrid } from "../components/cases/CaseGrid";
import { CreateCaseModal } from "../components/cases/CreateCaseModal";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [createCaseVisible, setCreateCaseVisible] = useState(false);

  const handleCaseCreated = (caseId: string) => {
    setCreateCaseVisible(false);

    navigation.navigate("ComplaintRegistration", {
      caseId,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable>
          <Text style={styles.profile}>◯</Text>
        </Pressable>
      </View>

      <CaseSearchBar />

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

      <Pressable
        style={styles.newCaseButton}
        onPress={() => setCreateCaseVisible(true)}
      >
        <Text style={styles.newCaseText}>Make New Case</Text>
      </Pressable>
      <Pressable
        style={{
          marginTop: 10,
          padding: 15,
          position: "absolute",
          top: 180,
          left: 24,
          backgroundColor: "#2B313A",
          borderRadius: 12,
        }}
        onPress={() => {
          navigation.navigate("MarkdownDocxTest");
        }}
      >
        <Text
          style={{
            color: "#F4F5F7",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          Test Markdown → DOCX
        </Text>
      </Pressable>
      <Pressable
        style={{
          marginTop: 10,
          padding: 15,
          position: "absolute",
          top: 250,
          left: 24,
          backgroundColor: "#333a2b",
          borderRadius: 15,
        }}
        onPress={() => {
          navigation.navigate("MarkdownPreview");
        }}
      >
        <Text
          style={{
            color: "#F4F5F7",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          Test Markdown Preview
        </Text>
      </Pressable>
      <Pressable
        style={{
          marginTop: 10,
          padding: 15,
          position: "absolute",
          top: 330,
          left: 24,
          backgroundColor: "#2b3a37",
          borderRadius: 15,
        }}
        onPress={() => {
          navigation.navigate("NudiFontTest");
        }}
      >
        <Text
          style={{
            color: "#F4F5F7",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          Test Font Preview
        </Text>
      </Pressable>

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
    backgroundColor: "#0B0D10",
    padding: 16,
  },

  header: {
    height: 48,
    justifyContent: "center",
  },

  profile: {
    color: "#F4F5F7",
    fontSize: 28,
  },

  filters: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 8,
  },

  newCaseButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: "#F4F5F7",
  },

  newCaseText: {
    color: "#0B0D10",
    fontWeight: "700",
  },
});