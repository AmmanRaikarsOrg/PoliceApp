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
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<RecordedAudio[]>([]);

  const start = async (): Promise<boolean> => {
    if (recorder.isRecording || isProcessing) {
      console.log("[AudioRecorder] Start ignored: already recording or processing");
      return false;
    }
    setIsProcessing(true);
    try {
      console.log("[AudioRecorder] Step 1: Checking microphone permission...");
      const permission = await requestAudioPermission();
      if (!permission.granted) {
        console.warn("[AudioRecorder] Microphone permission denied");
        Alert.alert(
          "Permission Required",
          "Microphone permission is required to record audio. Please enable it in your device settings."
        );
        return false;
      }
      console.log("[AudioRecorder] Permission granted. Configuring audio mode...");
      await configureAudio();
      console.log("[AudioRecorder] Preparing recorder...");
      await recorder.prepareToRecordAsync();
      console.log("[AudioRecorder] Beginning recording session...");
      recorder.record();
      setIsPaused(false);
      console.log("[AudioRecorder] ✅ Recording is now ACTIVE");
      return true;
    } catch (error) {
      console.error("[AudioRecorder] ❌ Failed to start recording:", error);
      Alert.alert("Recording Error", "Unable to start recording. Please try again.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const pause = async (): Promise<boolean> => {
    if (!recorder.isRecording || isPaused || isProcessing) {
      console.log("[AudioRecorder] Pause ignored: not recording, already paused, or processing");
      return false;
    }
    try {
      console.log("[AudioRecorder] Pausing active recording...");
      recorder.pause();
      setIsPaused(true);
      console.log(`[AudioRecorder] ⏸️ Recording PAUSED at ${recorder.currentTime?.toFixed(1) || 0}s`);
      return true;
    } catch (error) {
      console.error("[AudioRecorder] ❌ Failed to pause recording:", error);
      return false;
    }
  };

  const resume = async (): Promise<boolean> => {
    if (!isPaused || isProcessing) {
      console.log("[AudioRecorder] Resume ignored: not paused or processing");
      return false;
    }
    try {
      console.log("[AudioRecorder] Resuming recording...");
      recorder.record();
      setIsPaused(false);
      console.log("[AudioRecorder] ▶️ Recording RESUMED");
      return true;
    } catch (error) {
      console.error("[AudioRecorder] ❌ Failed to resume recording:", error);
      return false;
    }
  };

  const stop = async (save: boolean = true): Promise<RecordedAudio | null> => {
    if (!recorder.isRecording && !isPaused) {
      console.log("[AudioRecorder] Stop ignored: not currently recording or paused");
      return null;
    }
    if (isProcessing) {
      return null;
    }
    setIsProcessing(true);
    try {
      console.log("[AudioRecorder] Stopping recording session...");
      await recorder.stop();
      setIsPaused(false);
      const finalUri = recorder.uri;

      if (!save || !finalUri) {
        console.log("[AudioRecorder] Recording stopped without saving");
        return null;
      }

      const durationSecs = Math.max(1, Math.round(recorder.currentTime || 1));
      console.log(`[AudioRecorder] ⏹️ Recording STOPPED. File: ${finalUri}, Duration: ${durationSecs}s`);

      const newRecording: RecordedAudio = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        uri: finalUri,
        name: `Recording ${recordings.length + 1}`,
        duration: durationSecs,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setRecordings((prev) => [...prev, newRecording]);
      console.log("[AudioRecorder] Saved recording to hook state:", newRecording.name);
      return newRecording;
    } catch (error) {
      console.error("[AudioRecorder] ❌ Failed to stop recording cleanly:", error);
      Alert.alert("Recording Error", "Failed to stop recording cleanly.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const removeRecording = (id: string) => {
    console.log("[AudioRecorder] Removing recording from state:", id);
    setRecordings((prev) => prev.filter((item) => item.id !== id));
  };

  const clearRecordings = () => {
    console.log("[AudioRecorder] Clearing all recordings from state");
    setRecordings([]);
  };

  const latestRecording = recordings.length > 0 ? recordings[recordings.length - 1] : null;

  return {
    recorder,
    isRecording: recorder.isRecording || isPaused,
    isPaused,
    isProcessing,
    recordings,
    latestUri: latestRecording?.uri || null,
    start,
    pause,
    resume,
    stop,
    removeRecording,
    clearRecordings,
  };
}