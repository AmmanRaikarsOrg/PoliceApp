import { useState } from "react";
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder as useExpoAudioRecorder,
  RecordingPresets,
} from "expo-audio";

export type RecordingStatus =
  | "idle"
  | "recording"
  | "paused"
  | "finished";

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [uri, setUri] = useState<string | null>(null);

  const start = async () => {
    if (status !== "idle" && status !== "finished") {
      return;
    }

    try {
      const permission = await getRecordingPermissionsAsync();
      const granted = permission.granted
        ? permission
        : await requestRecordingPermissionsAsync();

      if (!granted.granted) {
        console.error("Microphone permission denied");
        return;
      }

      await setAudioModeAsync({ allowsRecording: true });
      setUri(null);
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus("recording");
      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  };

  const pause = () => {
    if (status !== "recording") {
      return;
    }

    try {
      recorder.pause();
      setStatus("paused");
      console.log("Recording paused");
    } catch (error) {
      console.error("Failed to pause recording", error);
    }
  };

  const resume = () => {
    if (status !== "paused") {
      return;
    }

    try {
      recorder.record();
      setStatus("recording");
      console.log("Recording resumed");
    } catch (error) {
      console.error("Failed to resume recording", error);
    }
  };

  const stop = async () => {
    if (status !== "recording" && status !== "paused") {
      return null;
    }

    try {
      await recorder.stop();
      const finalUri = recorder.uri;

      if (!finalUri) {
        console.error("Recording finished without a final URI");
        return null;
      }

      setUri(finalUri);
      setStatus("finished");
      console.log("Recording finished");
      console.log(`Final URI: ${finalUri}`);
      return finalUri;
    } catch (error) {
      console.error("Failed to finish recording", error);
      return null;
    }
  };

  return {
    recorder,
    status,
    isRecording: status === "recording",
    isPaused: status === "paused",
    uri,
    start,
    pause,
    resume,
    stop,
  };
}