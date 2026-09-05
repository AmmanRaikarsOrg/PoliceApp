import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  id?: string;
  name?: string;
  date?: string;
  updated?: string;
  status?: string;
  caseType?: string;
  onPress?: () => void;
};

export function CaseCard({
  id = "CR-0812",
  name = "Downtown Traffic Incident",
  date = "Oct 24, 2024",
  updated = "Updated 2h ago",
  status = "Open",
  caseType,
  onPress,
}: Props) {
  const normalizedStatus = (status || "open").toLowerCase();

  const getStatusStyles = () => {
    switch (normalizedStatus) {
      case "open":
        return { bg: "#FEE2E2", text: "#991B1B", label: "Open" };
      case "processing":
      case "in progress":
        return { bg: "#FEF3C7", text: "#B45309", label: "Processing" };
      case "closed":
        return { bg: "#E2E8F0", text: "#475569", label: "Closed" };
      default:
        return { bg: "#F1F5F9", text: "#64748B", label: status };
    }
  };

  const statusStyle = getStatusStyles();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.id}>{id}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {caseType && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{caseType}</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.name}>{name}</Text>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={14} color="#64748B" />
          <Text style={styles.metaText}>{date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={14} color="#64748B" />
          <Text style={styles.metaText}>{updated}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  id: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
  typeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F294A",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
  },
});