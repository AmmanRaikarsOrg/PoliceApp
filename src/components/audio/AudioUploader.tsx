import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

import { AudioPlayer } from "./AudioPlayer";

type Props = {
  onFileSelected?: (asset: DocumentPicker.DocumentPickerAsset | null) => void;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function isAudioFile(mimeType?: string | null, name?: string | null): boolean {
  if (mimeType && mimeType.startsWith("audio/")) return true;
  if (name) {
    const lower = name.toLowerCase();
    return (
      lower.endsWith(".mp3") ||
      lower.endsWith(".wav") ||
      lower.endsWith(".m4a") ||
      lower.endsWith(".aac") ||
      lower.endsWith(".ogg") ||
      lower.endsWith(".flac") ||
      lower.endsWith(".wma") ||
      lower.endsWith(".mp4")
    );
  }
  return false;
}

function getFileIcon(name?: string | null): keyof typeof Feather.glyphMap {
  if (!name) return "file";
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "file-text";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "file-text";
  if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".csv")) return "grid";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif")) return "image";
  if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".7z")) return "archive";
  return "file";
}

function getFileExtension(name?: string | null): string {
  if (!name) return "FILE";
  const parts = name.split(".");
  if (parts.length > 1) {
    return parts[parts.length - 1].toUpperCase();
  }
  return "FILE";
}

export function AudioUploader({ onFileSelected }: Props) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      // Enforce 50MB size limit
      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert(
          "File Too Large",
          `The selected file (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 50MB limit. Please select a smaller file.`
        );
        return;
      }

      setSelectedFile(file);
      if (onFileSelected) {
        onFileSelected(file);
      }
    } catch (error) {
      console.warn("Error picking document:", error);
      Alert.alert("Upload Error", "Failed to select document. Please try again.");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  const handleOpenFile = async () => {
    if (!selectedFile?.uri) return;
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(selectedFile.uri);
      } else {
        Alert.alert("Open File", `File path: ${selectedFile.name}`);
      }
    } catch (err) {
      console.warn("Error opening file:", err);
    }
  };

  const isAudio = selectedFile ? isAudioFile(selectedFile.mimeType, selectedFile.name) : false;

  return (
    <View style={styles.wrapper}>
      {/* Upload Button Card */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressed,
        ]}
        onPress={handleUpload}
        accessibilityRole="button"
        accessibilityLabel="Upload File"
      >
        <View style={styles.iconContainer}>
          <Feather name={selectedFile ? getFileIcon(selectedFile.name) : "upload-cloud"} size={24} color="#0F294A" />
          <View style={styles.badgeArrow}>
            <Feather name="arrow-up" size={10} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.primaryText} numberOfLines={1}>
          {selectedFile ? selectedFile.name : "Upload File"}
        </Text>

        <Text style={styles.subText}>
          {selectedFile
            ? `${(selectedFile.size ? (selectedFile.size / (1024 * 1024)).toFixed(1) : 0)} MB • Tap to replace`
            : "PDF, DOCX, Images, MP3, ZIP up to 50MB"}
        </Text>
      </Pressable>

      {/* Render Audio Player if uploaded file is Audio */}
      {selectedFile && isAudio && (
        <AudioPlayer uri={selectedFile.uri} onRemove={handleRemoveFile} />
      )}

      {/* Render Non-Audio File Card if uploaded file is Non-Audio */}
      {selectedFile && !isAudio && (
        <View style={styles.nonAudioCard}>
          <View style={styles.extBadge}>
            <Text style={styles.extBadgeText}>{getFileExtension(selectedFile.name)}</Text>
          </View>

          <View style={styles.nonAudioInfo}>
            <Text style={styles.nonAudioName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.nonAudioSub}>
              {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : "File ready"}
            </Text>
          </View>

          <Pressable
            style={styles.openButton}
            onPress={handleOpenFile}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open file"
          >
            <Feather name="external-link" size={16} color="#0F294A" />
          </Pressable>

          <Pressable
            style={styles.removeButton}
            onPress={handleRemoveFile}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Remove file"
          >
            <Feather name="trash-2" size={16} color="#EF4444" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

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
    paddingHorizontal: 8,
  },

  subText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
  },

  nonAudioCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  extBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#0F294A",
    marginRight: 10,
  },

  extBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  nonAudioInfo: {
    flex: 1,
    marginRight: 8,
  },

  nonAudioName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F294A",
  },

  nonAudioSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },

  openButton: {
    padding: 6,
    marginRight: 4,
  },

  removeButton: {
    padding: 6,
  },
});