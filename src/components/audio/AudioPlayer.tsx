import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

type Props = {
  uri: string;
};

export function AudioPlayer({ uri }: Props) {
  const player = useAudioPlayer(uri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);

  const handlePlay = () => {
    if (status.didJustFinish) {
      player.seekTo(0);
    }

    if (status.playing) {
      player.pause();
      return;
    }

    player.play();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePlay} style={styles.button}>
        <Text style={styles.buttonText}>
          {status.playing ? "Pause" : "Play"}
        </Text>
      </Pressable>
      <Text style={styles.time}>
        {formatTime(status.currentTime)} / {formatTime(status.duration)}
      </Text>
      <Text style={styles.duration}>
        Duration: {formatTime(status.duration)}
      </Text>
    </View>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#15181D",
    borderWidth: 1,
    borderColor: "#F4F5F7",
  },

  buttonText: {
    color: "#f5f3f3",
    fontWeight: "700",
  },

  time: {
    color: "#050505",
    marginTop: 10,
    fontWeight: "700",
  },

  duration: {
    color: "#050505",
    marginTop: 8,
  },
});