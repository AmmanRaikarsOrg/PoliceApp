import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export function CaseTypeFilter() {
  return (
    <Pressable style={styles.button}>
      <Feather name="filter" size={20} color="#0F172A" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});