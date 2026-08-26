import { useState } from "react";
import { Alert } from "react-native";
import { useAudioRecorder as useExpoAudioRecorder, RecordingPresets } from "expo-audio";
import { configureAudio, requestAudioPermission } from "../services/audio/audioService";

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isCleared, setIsCleared] = useState(false);

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
      setRecordedUri(null);
      setIsCleared(false);
      return true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Recording Error", "Unable to start recording. Please try again.");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const stop = async (): Promise<string | null> => {
    if (!recorder.isRecording || isProcessing) {
      return isCleared ? null : (recordedUri || recorder.uri || null);
    }
    setIsProcessing(true);
    try {
      await recorder.stop();
      const finalUri = recorder.uri;
      setRecordedUri(finalUri);
      setIsCleared(false);
      return finalUri;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Recording Error", "Failed to stop recording cleanly.");
      const finalUri = recorder.uri || null;
      setRecordedUri(finalUri);
      setIsCleared(false);
      return finalUri;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearRecording = () => {
    setRecordedUri(null);
    setIsCleared(true);
  };

  const activeUri = isCleared ? null : (recordedUri || recorder.uri || null);

  return {
    recorder,
    isRecording: recorder.isRecording,
    isProcessing,
    uri: activeUri,
    start,
    stop,
    clearRecording,
  };
}