import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";

export async function requestAudioPermission() {
  return requestRecordingPermissionsAsync();
}

export async function configureAudio() {
  await setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: true,
  });
}

export { RecordingPresets };