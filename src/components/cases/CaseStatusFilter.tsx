import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function CaseStatusFilter() {
  return (
    <View style={styles.container}>
      <View style={styles.activePill}>
        <Text style={styles.activeText}>All</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>Open</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>In Progress</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>Closed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activePill: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  pill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
});