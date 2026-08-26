import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  id?: string;
  name?: string;
  date?: string;
  updated?: string;
  status?: string;
  onPress?: () => void;
};

export function CaseCard({
  id = "rgba(255, 255, 255, 0.27)-0812",
  name = "Downtown Traffic Incident",
  date = "Oct 24, 2024",
  updated = "Updated 2h ago",
  status = "Open",
  onPress,
}: Props) {
  const getStatusStyles = () => {
    switch (status) {
      case "Open":
        return { bg: "#FEE2E2", text: "#991B1B" };
      case "In Progress":
        return { bg: "#DBEAFE", text: "#1E40AF" };
      case "Closed":
        return { bg: "#E2E8F0", text: "#475569" };
      default:
        return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  const statusStyle = getStatusStyles();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.id}>{id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {status}
          </Text>
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
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#475569",
  },
});