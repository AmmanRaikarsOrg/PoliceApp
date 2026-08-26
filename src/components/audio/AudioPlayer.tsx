import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";

type Props = {
  uri: string;
  onRemove?: () => void;
};

export function AudioPlayer({ uri, onRemove }: Props) {
  const player = useAudioPlayer(uri);

  const handleTogglePlay = () => {
    if (!uri) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleRemove = () => {
    try {
      if (player.playing) {
        player.pause();
      }
    } catch (err) {
      console.warn("Error pausing player on delete:", err);
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.playButton}
        onPress={handleTogglePlay}
        accessibilityRole="button"
        accessibilityLabel={player.playing ? "Pause recorded audio" : "Play recorded audio"}
      >
        <Feather
          name={player.playing ? "pause" : "play"}
          size={16}
          color="#FFFFFF"
        />
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          Recorded Audio
        </Text>
        <Text style={styles.status}>
          {player.playing ? "Playing..." : "Tap to listen"}
        </Text>
      </View>

      {onRemove && (
        <Pressable
          style={styles.removeButton}
          onPress={handleRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Remove recorded audio"
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0F294A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F294A",
  },
  status: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  removeButton: {
    padding: 6,
    marginLeft: 8,
  },
});