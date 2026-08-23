import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function CaseStatusFilter() {
  return (
    <View style={styles.container}>
      <Text style={styles.active}>OPEN</Text>
      <Text style={styles.item}>ONGOING</Text>
      <Text style={styles.item}>CLOSED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#15181D",
    borderRadius: 30,
    padding: 4,
  },

  active: {
    color: "#0B0D10",
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontWeight: "700",
  },

  item: {
    color: "#9AA3AF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: "600",
  },
});