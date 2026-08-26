import { useState } from "react";
import { Alert } from "react-native";
import { useAudioRecorder as useExpoAudioRecorder, RecordingPresets } from "expo-audio";
import { configureAudio, requestAudioPermission } from "../services/audio/audioService";

export type RecordedAudio = {
  id: string;
  uri: string;
  name: string;
  duration: number; // in seconds
  createdAt: string;
};

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordings, setRecordings] = useState<RecordedAudio[]>([]);

  const start = async (): Promise<boolean> => {
    if (recorder.isRecording || isProcessing) {
      return false;
    }
    setIsProcessing(true);
    try {
      const permission = await requestAudioPermission();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Microphone permission is required to record audio. Please enable it in your device settings."
        );
        return false;
      }

      await configureAudio();
      await recorder.prepareToRecordAsync();
      recorder.record();
      return true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Recording Error", "Unable to start recording. Please try again.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const stop = async (save: boolean = true): Promise<RecordedAudio | null> => {
    if (!recorder.isRecording || isProcessing) {
      return null;
    }
    setIsProcessing(true);
    try {
      await recorder.stop();
      const finalUri = recorder.uri;

      if (!save || !finalUri) {
        return null;
      }

      const durationSecs = Math.max(1, Math.round((recorder.currentTime || 1)));

      const newRecording: RecordedAudio = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        uri: finalUri,
        name: `Recording ${recordings.length + 1}`,
        duration: durationSecs,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setRecordings((prev) => [...prev, newRecording]);
      return newRecording;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Recording Error", "Failed to stop recording cleanly.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const removeRecording = (id: string) => {
    setRecordings((prev) => prev.filter((item) => item.id !== id));
  };

  const clearRecordings = () => {
    setRecordings([]);
  };

  const latestRecording = recordings.length > 0 ? recordings[recordings.length - 1] : null;

  return {
    recorder,
    isRecording: recorder.isRecording,
    isProcessing,
    recordings,
    latestUri: latestRecording?.uri || null,
    start,
    stop,
    removeRecording,
    clearRecordings,
  };
}