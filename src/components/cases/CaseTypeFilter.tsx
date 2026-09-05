import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

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
            color={selectedType.toUpperCase() === "ALL" ? "#FFFFFF" : "#64748B"}
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
                <Feather name="x" size={12} color="#FFFFFF" style={{ marginLeft: 2 }} />
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  activeChip: {
    backgroundColor: "#0F294A",
    borderColor: "#0F294A",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  activeChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});