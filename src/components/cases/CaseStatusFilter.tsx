import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme";

type StatusOption = {
  key: string;
  label: string;
  activeBg: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { key: "ALL", label: "All", activeBg: colors.primary },
  { key: "OPEN", label: "Open", activeBg: colors.status.open.main },
  { key: "CLOSED", label: "Closed", activeBg: colors.status.closed.main },
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
              isActive && [styles.activePill, { backgroundColor: opt.activeBg }],
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  activePill: {
    borderColor: colors.transparent,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  activeText: {
    color: colors.textInverse,
  },
});