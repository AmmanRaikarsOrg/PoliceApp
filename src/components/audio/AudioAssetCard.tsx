import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { CaseAsset } from "../../utils/types";

type Props = {
  asset: CaseAsset;
  index?: number;
  totalCount?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: (assetId: string) => void;
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const totalSecs = Math.floor(seconds);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function AudioAssetCard({
  asset,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onRemove,
}: Props) {
  const audioUri = asset.uri || asset.downloadUrl || "";
  const isUploading = asset.uploadStatus === "uploading";
  const isError = asset.uploadStatus === "error";
  const isFetching = !!asset.isFetching;

  const [isDownloading, setIsDownloading] = useState(false);

  // Audio player hook (only active if URI is available)
  const player = useAudioPlayer(audioUri, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [trackWidth, setTrackWidth] = useState(0);

  const isPlaying = status?.playing ?? player.playing ?? false;
  const currentTime = status?.currentTime ?? player.currentTime ?? 0;
  const duration =
    (status?.duration && status.duration > 0 ? status.duration : null) ||
    (player.duration && player.duration > 0 ? player.duration : null) ||
    (asset.durationSec ? asset.durationSec : 0);

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  // YouTube-style spinning animation for the upload indicator
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    if (isUploading) {
      loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    } else {
      spinAnim.setValue(0);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isUploading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleTogglePlay = () => {
    if (!audioUri) {
      console.log(`[AudioAssetCard] Cannot play: No URI available for "${asset.originalFileName}"`);
      return;
    }
    if (isPlaying) {
      console.log(`[AudioAssetCard] ⏸️ Pausing playback for: "${asset.originalFileName}"`);
      player.pause();
    } else {
      console.log(`[AudioAssetCard] ▶️ Starting playback for: "${asset.originalFileName}" (URI: ${audioUri})`);
      player.play();
    }
  };

  const handleSeek = (event: GestureResponderEvent) => {
    if (!duration || trackWidth <= 0) return;
    const clickX = event.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, clickX / trackWidth));
    const targetSeconds = ratio * duration;
    console.log(`[AudioAssetCard] Seeking "${asset.originalFileName}" to ${targetSeconds.toFixed(1)}s`);
    player.seekTo(targetSeconds);
  };

  const handleDelete = () => {
    try {
      if (isPlaying) {
        player.pause();
      }
    } catch {}
    const id = asset.id || asset._id;
    console.log(`[AudioAssetCard] Delete requested for asset: "${asset.originalFileName}" (ID: ${id})`);
    if (onRemove) {
      onRemove(id);
    }
  };

  const handleDownload = async () => {
    console.log(`[AudioAssetCard] Download tapped for: "${asset.originalFileName}"`);
    try {
      setIsDownloading(true);
      let targetFileUri = audioUri;

      if (!targetFileUri) {
        Alert.alert("Please Wait", "Audio file is currently being retrieved from cloud storage.");
        return;
      }

      if (targetFileUri.startsWith("http")) {
        const localTarget = `${FileSystem.cacheDirectory}dl_${asset._id || asset.id}_${(asset.originalFileName || "audio.m4a").replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        console.log(`[AudioAssetCard] Downloading remote file to: ${localTarget}`);
        const downloadRes = await FileSystem.downloadAsync(targetFileUri, localTarget);
        targetFileUri = downloadRes.uri;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        console.log(`[AudioAssetCard] Opening sharing modal for: ${targetFileUri}`);
        await Sharing.shareAsync(targetFileUri, {
          mimeType: asset.mimeType || "audio/mp4",
          dialogTitle: `Download / Save ${asset.originalFileName || "Audio"}`,
        });
      } else {
        Alert.alert("Audio Saved", `Audio file saved at: ${targetFileUri}`);
      }
    } catch (error: any) {
      console.error("[AudioAssetCard] Download failed:", error);
      Alert.alert("Download Error", `Could not download audio: ${error?.message || "Unknown error"}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const sizeKb =
    asset.sizeBytes && asset.sizeBytes > 0
      ? (asset.sizeBytes / 1024).toFixed(0) + " KB"
      : "Audio";

  const isFirst = index === 0;
  const isLast = totalCount !== undefined && index === totalCount - 1;

  return (
    <View style={styles.card}>
      {/* Top row: Order badge, Name, Reorder arrows, Status badge, Download and Delete */}
      <View style={styles.topRow}>
        <View style={styles.iconAndTitle}>
          {/* Order sequence number */}
          {index !== undefined && (
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>#{index + 1}</Text>
            </View>
          )}

          <View style={[styles.typeIconBox, (isUploading || isFetching) && styles.typeIconBoxUploading]}>
            {isUploading ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Feather name="loader" size={18} color="#0F294A" />
              </Animated.View>
            ) : isFetching ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Feather name="music" size={18} color="#0F294A" />
            )}
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.fileName} numberOfLines={1}>
              {asset.label || asset.originalFileName || "Audio Recording"}
            </Text>
            <Text style={styles.fileMeta}>
              {sizeKb} • {asset.source || "Recorded"}
            </Text>
          </View>
        </View>

        {/* Right side controls: Reorder Up/Down, Upload/Fetching Status, Download, and Delete */}
        <View style={styles.rightControls}>
          {/* Reorder Arrows */}
          {(onMoveUp || onMoveDown) && totalCount !== undefined && totalCount > 1 && (
            <View style={styles.reorderGroup}>
              <Pressable
                style={[styles.reorderBtn, isFirst && styles.reorderBtnDisabled]}
                onPress={onMoveUp}
                disabled={isFirst}
                hitSlop={6}
                accessibilityLabel="Move audio up in sequence"
              >
                <Feather
                  name="chevron-up"
                  size={18}
                  color={isFirst ? "#CBD5E1" : "#1E293B"}
                />
              </Pressable>

              <Pressable
                style={[styles.reorderBtn, isLast && styles.reorderBtnDisabled]}
                onPress={onMoveDown}
                disabled={isLast}
                hitSlop={6}
                accessibilityLabel="Move audio down in sequence"
              >
                <Feather
                  name="chevron-down"
                  size={18}
                  color={isLast ? "#CBD5E1" : "#1E293B"}
                />
              </Pressable>
            </View>
          )}

          {/* Upload / Fetching status indicator */}
          <View style={styles.statusBadgeContainer}>
            {isUploading && (
              <View style={styles.uploadingBadge}>
                <Animated.View style={{ transform: [{ rotate: spin }], marginRight: 4 }}>
                  <Feather name="refresh-cw" size={12} color="#D97706" />
                </Animated.View>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}

            {isFetching && (
              <View style={styles.fetchingBadge}>
                <ActivityIndicator size="small" color="#2563EB" style={{ transform: [{ scale: 0.7 }] }} />
                <Text style={styles.fetchingText}>Loading...</Text>
              </View>
            )}

            {!isUploading && !isFetching && !isError && (
              <View style={styles.uploadedBadge}>
                <Feather name="check-circle" size={13} color="#16A34A" />
                <Text style={styles.uploadedText}>Ready</Text>
              </View>
            )}

            {isError && (
              <View style={styles.errorBadge}>
                <Feather name="alert-circle" size={13} color="#DC2626" />
                <Text style={styles.errorText}>Failed</Text>
              </View>
            )}

            {/* Download Button */}
            <Pressable
              style={styles.actionIconBtn}
              onPress={handleDownload}
              disabled={isDownloading}
              hitSlop={8}
              accessibilityLabel="Download audio file"
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Feather name="download" size={16} color="#0F294A" />
              )}
            </Pressable>

            {/* Delete Button */}
            {onRemove && (
              <Pressable
                style={styles.actionIconBtn}
                onPress={handleDelete}
                hitSlop={8}
                accessibilityLabel="Delete audio"
              >
                <Feather name="trash-2" size={16} color="#94A3B8" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Inline Playback Controller */}
      {audioUri ? (
        <View style={styles.playerRow}>
          <Pressable
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handleTogglePlay}
            hitSlop={6}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={15}
              color="#FFFFFF"
            />
          </Pressable>

          {/* Seekable Progress Bar */}
          <Pressable
            style={styles.progressContainer}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            onPress={handleSeek}
          >
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </Pressable>

          {/* Time Display */}
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>
      ) : isFetching ? (
        <View style={styles.playerRowFetching}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.fetchingPlayerText}>Fetching audio file from cloud...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 6,
    gap: 8,
  },
  orderBadge: {
    backgroundColor: "#0F294A",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  orderBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  typeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconBoxUploading: {
    backgroundColor: "#FEF3C7",
  },
  nameBlock: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 2,
  },
  fileMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  rightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reorderGroup: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  reorderBtn: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  reorderBtnDisabled: {
    opacity: 0.35,
  },
  statusBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  uploadingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  uploadingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
  },
  fetchingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  fetchingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  uploadedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  uploadedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },
  errorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  actionIconBtn: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 10,
  },
  playerRowFetching: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  fetchingPlayerText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  playButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0F294A",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonActive: {
    backgroundColor: "#2563EB",
  },
  progressContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 2,
  },
  timeText: {
    fontSize: 11,
    color: "#64748B",
    fontVariant: ["tabular-nums"],
    minWidth: 70,
    textAlign: "right",
  },
});
