import React from "react";
import { StyleSheet, TextInput } from "react-native";

export function CaseSearchBar() {
  return (
    <TextInput
      placeholder="Search cases..."
      placeholderTextColor="#6F7782"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#15181D",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: "#F4F5F7",
    borderWidth: 1,
    borderColor: "#2B313A",
  },
});