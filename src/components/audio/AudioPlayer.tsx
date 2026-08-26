import React, { useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

type Props = {
  uri: string;
  onRemove?: () => void;
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function AudioPlayer({ uri, onRemove }: Props) {
  const player = useAudioPlayer(uri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [trackWidth, setTrackWidth] = useState(0);

  const isPlaying = status?.playing ?? player.playing ?? false;
  const currentTime = status?.currentTime ?? player.currentTime ?? 0;
  const duration = status?.duration ?? player.duration ?? 0;

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  const handleTogglePlay = () => {
    if (!uri) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (event: GestureResponderEvent) => {
    if (!duration || trackWidth <= 0) return;
    const clickX = event.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, clickX / trackWidth));
    const targetSeconds = ratio * duration;
    player.seekTo(targetSeconds);
  };

  const handleRemove = () => {
    try {
      if (isPlaying) {
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
      {/* Play / Pause button */}
      <Pressable
        style={styles.playButton}
        onPress={handleTogglePlay}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause recorded audio" : "Play recorded audio"}
      >
        <Feather
          name={isPlaying ? "pause" : "play"}
          size={16}
          color="#FFFFFF"
        />
      </Pressable>

      {/* Progress Bar */}
      <Pressable
        style={styles.progressContainer}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        onPress={handleSeek}
        accessibilityRole="adjustable"
        accessibilityLabel="Playback progress"
      >
        <View style={styles.progressTrackBackground}>
          <View
            style={[
              styles.progressTrackFilled,
              { width: `${progressPercent}%` },
            ]}
          />
          <View
            style={[
              styles.progressThumb,
              { left: `${progressPercent}%` },
            ]}
          />
        </View>
      </Pressable>

      {/* Time Display */}
      <Text style={styles.timeText}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>

      {/* Delete button */}
      {onRemove && (
        <Pressable
          style={styles.removeButton}
          onPress={handleRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Remove recorded audio"
        >
          <Feather name="trash-2" size={18} color="#EF4444" />
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0F294A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
    height: 24,
    justifyContent: "center",
    marginRight: 10,
  },
  progressTrackBackground: {
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
    position: "relative",
    justifyContent: "center",
  },
  progressTrackFilled: {
    height: "100%",
    backgroundColor: "#0F294A",
    borderRadius: 2,
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0F294A",
    position: "absolute",
    top: -4,
    marginLeft: -6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
});