import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type StatusOption = {
  key: string;
  label: string;
  color?: string;
  activeBg?: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open", activeBg: "#DC2626" },
  { key: "PROCESSING", label: "Processing", activeBg: "#D97706" },
  { key: "CLOSED", label: "Closed", activeBg: "#475569" },
];

type Props = {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
};

export function CaseStatusFilter({ selectedStatus = "ALL", onSelectStatus }: Props) {
  return (
    <View style={styles.container}>
      {STATUS_OPTIONS.map((opt) => {
        const isActive =
          selectedStatus.toUpperCase() === opt.key.toUpperCase();
        return (
          <Pressable
            key={opt.key}
            style={[
              styles.pill,
              isActive && styles.activePill,
              isActive && opt.activeBg ? { backgroundColor: opt.activeBg } : null,
            ]}
            onPress={() => onSelectStatus(opt.key)}
            hitSlop={6}
          >
            <Text
              style={[
                styles.pillText,
                isActive && styles.activeText,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  activePill: {
    backgroundColor: "#0F294A",
    borderColor: "transparent",
  },
  pillText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  activeText: {
    color: "#FFFFFF",
  },
});