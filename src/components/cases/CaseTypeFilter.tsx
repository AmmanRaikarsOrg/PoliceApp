import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme";

export const DEFAULT_CASE_TYPES = [
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

type Props = {
  selectedType: string;
  onSelectType: (type: string) => void;
  availableTypes?: string[];
};

export function CaseTypeFilter({
  selectedType = "ALL",
  onSelectType,
  availableTypes,
}: Props) {
  // Combine default types with any custom types from existing cases
  const allTypes = Array.from(
    new Set([
      ...DEFAULT_CASE_TYPES,
      ...(availableTypes ? availableTypes.filter(Boolean) : []),
    ])
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          style={[
            styles.chip,
            selectedType.toUpperCase() === "ALL" && styles.activeChip,
          ]}
          onPress={() => onSelectType("ALL")}
          hitSlop={6}
        >
          <Feather
            name="layers"
            size={12}
            color={
              selectedType.toUpperCase() === "ALL"
                ? colors.textInverse
                : colors.textMuted
            }
          />
          <Text
            style={[
              styles.chipText,
              selectedType.toUpperCase() === "ALL" && styles.activeChipText,
            ]}
          >
            All Types
          </Text>
        </Pressable>

        {allTypes.map((type) => {
          const isActive =
            selectedType.toLowerCase() === type.toLowerCase();
          return (
            <Pressable
              key={type}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => onSelectType(isActive ? "ALL" : type)}
              hitSlop={6}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.activeChipText,
                ]}
              >
                {type}
              </Text>
              {isActive && (
                <Feather
                  name="x"
                  size={12}
                  color={colors.textInverse}
                  style={{ marginLeft: 2 }}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  activeChipText: {
    color: colors.textInverse,
    fontWeight: "700",
  },
});