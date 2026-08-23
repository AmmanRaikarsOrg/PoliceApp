import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function AudioList() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Recordings
      </Text>

      <Text style={styles.empty}>
        No recordings yet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#15181D",
  },

  title: {
    color: "#F4F5F7",
    fontSize: 18,
    fontWeight: "700",
  },

  empty: {
    color: "#9AA3AF",
    marginTop: 12,
  },
});