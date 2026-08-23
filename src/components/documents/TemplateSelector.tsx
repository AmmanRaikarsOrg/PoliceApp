import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export function TemplateSelector() {
  return (
    <Pressable style={styles.container}>
      <Text style={styles.label}>
        Select Document Template
      </Text>

      <Text style={styles.value}>
        Select template
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
  },

  label: {
    color: "#9AA3AF",
    marginBottom: 6,
  },

  value: {
    color: "#F4F5F7",
    fontWeight: "700",
  },
});