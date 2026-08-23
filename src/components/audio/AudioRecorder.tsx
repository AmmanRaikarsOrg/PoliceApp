import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAudioRecorder } from "../../hooks/useAudioRecorder";

export function AudioRecorder() {
  const {
    isRecording,
    start,
    stop,
  } = useAudioRecorder();

  const handlePress = async () => {
    if (isRecording) {
      await stop();
      return;
    }

    await start();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.recordButton,
          isRecording && styles.recording,
        ]}
        onPress={handlePress}
      >
        <Text style={styles.text}>
          {isRecording
            ? "Stop Recording"
            : "Record Audio"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
  },

  recordButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#15181D",
    borderWidth: 2,
    borderColor: "#F4F5F7",
  },

  recording: {
    borderColor: "#FF5555",
  },

  text: {
    color: "#F4F5F7",
    fontWeight: "700",
  },
});