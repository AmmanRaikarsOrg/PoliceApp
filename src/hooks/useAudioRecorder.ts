import { useAudioRecorder as useExpoAudioRecorder } from "expo-audio";
import { RecordingPresets } from "expo-audio";

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const start = async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stop = async () => {
    await recorder.stop();

    return recorder.uri;
  };

  return {
    recorder,
    isRecording: recorder.isRecording,
    uri: recorder.uri,
    start,
    stop,
  };
}