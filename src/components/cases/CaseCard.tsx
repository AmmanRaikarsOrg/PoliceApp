import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme";

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
        return {
          bg: colors.status.open.bg,
          border: colors.status.open.border,
          text: colors.status.open.text,
          label: "Open",
        };
      case "closed":
      default:
        return {
          bg: colors.status.closed.bg,
          border: colors.status.closed.border,
          text: colors.status.closed.text,
          label: "Closed",
        };
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
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusStyle.bg,
                borderColor: statusStyle.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.name}>{name}</Text>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{updated}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMuted,
    fontWeight: "700",
  },
  typeBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
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
    color: colors.textMuted,
  },
});