import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

type Props = {
  onFileSelected?: (asset: DocumentPicker.DocumentPickerAsset | null) => void;
};

export function AudioUploader({ onFileSelected }: Props) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*", "audio/mpeg", "audio/wav", "audio/m4a", "audio/mp4", "audio/x-m4a"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile(file);
      if (onFileSelected) {
        onFileSelected(file);
      }
    } catch (error) {
      console.warn("Error picking document:", error);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={handleUpload}
      accessibilityRole="button"
      accessibilityLabel="Upload audio file"
    >
      <View style={styles.iconContainer}>
        <Feather name="file-text" size={24} color="#0F294A" />
        <View style={styles.badgeArrow}>
          <Feather name="arrow-up" size={10} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.primaryText}>
        {selectedFile ? selectedFile.name : "Upload Audio File"}
      </Text>

      <Text style={styles.subText}>
        {selectedFile
          ? `${(selectedFile.size ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0)} MB • Tap to replace`
          : "MP3, WAV, M4A up to 50MB"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    backgroundColor: "#F8FAFC",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },

  badgeArrow: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0F294A",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: "#0F294A",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },

  subText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
  },
});