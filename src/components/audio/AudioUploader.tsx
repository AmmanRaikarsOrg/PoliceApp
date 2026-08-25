import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";

export type UploadedAudio = {
  name: string;
  uri: string;
  size?: number;
};

type Props = {
  onAudioSelected?: (audio: UploadedAudio[]) => void;
};

export function AudioUploader({ onAudioSelected }: Props) {
  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });

    if (result.canceled) {
      return;
    }

    onAudioSelected?.(
      result.assets.map(({ name, uri, size }) => ({
        name,
        uri,
        size,
      }))
    );
  };

  return (
    <Pressable style={styles.button} onPress={handleUpload}>
      <Text style={styles.text}>Upload Pre-recorded Audio</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#39424E",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: "#F4F5F7",
    fontWeight: "700",
    fontSize: 15,
  },
});