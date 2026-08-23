import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";

export function AudioUploader() {
  const handleUpload = async () => {
    const result =
      await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
      });

    if (result.canceled) {
      return;
    }

    console.log(
      "Selected audio:",
      result.assets
    );
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handleUpload}
    >
      <Text style={styles.text}>
        Upload Pre-recorded Audio
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#2B313A",
    alignItems: "center",
  },

  text: {
    color: "#F4F5F7",
    fontWeight: "700",
  },
});