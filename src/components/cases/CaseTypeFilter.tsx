import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export function CaseTypeFilter() {
  return (
    <Pressable style={styles.button}>
      <Text style={styles.text}>
        Filter
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
  },

  text: {
    color: "#F4F5F7",
    fontWeight: "600",
  },
});