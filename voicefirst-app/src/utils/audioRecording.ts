import { Audio } from 'expo-av';
import { Paths, Directory, File } from 'expo-file-system';

const RECORDING_OPTIONS_PRESET_HIGH_QUALITY: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

export interface AudioRecordingService {
  recording: Audio.Recording | null;
  uri: string | null;
  duration: number;
  metering: number[];
}

/**
 * Requests audio recording permissions
 */
export async function requestAudioPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

/**
 * Prepares audio mode for recording
 */
export async function prepareAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
}

/**
 * Starts a new audio recording
 */
export async function startRecording(): Promise<Audio.Recording> {
  try {
    // Request permissions
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      throw new Error('Audio recording permission not granted');
    }

    // Prepare audio mode
    await prepareAudioMode();

    // Create and start recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();

    return recording;
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}

/**
 * Stops the current recording and returns the URI
 */
export async function stopRecording(
  recording: Audio.Recording
): Promise<{ uri: string; duration: number }> {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const status = await recording.getStatusAsync();

    if (!uri) {
      throw new Error('No recording URI found');
    }

    const duration = status.isRecording
      ? 0
      : status.durationMillis / 1000;

    return { uri, duration };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    throw error;
  }
}

/**
 * Gets the current recording status including metering data
 */
export async function getRecordingStatus(
  recording: Audio.Recording
): Promise<{
  isRecording: boolean;
  durationMillis: number;
  metering?: number;
}> {
  try {
    const status = await recording.getStatusAsync();
    return {
      isRecording: status.isRecording || false,
      durationMillis: status.durationMillis || 0,
      metering: status.metering,
    };
  } catch (error) {
    console.error('Failed to get recording status:', error);
    return { isRecording: false, durationMillis: 0 };
  }
}

/**
 * Creates a sound object from a URI for playback
 */
export async function createSound(uri: string): Promise<Audio.Sound> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false }
    );
    return sound;
  } catch (error) {
    console.error('Failed to create sound:', error);
    throw error;
  }
}

/**
 * Plays an audio file from a URI
 */
export async function playSound(sound: Audio.Sound): Promise<void> {
  try {
    await sound.playAsync();
  } catch (error) {
    console.error('Failed to play sound:', error);
    throw error;
  }
}

/**
 * Pauses audio playback
 */
export async function pauseSound(sound: Audio.Sound): Promise<void> {
  try {
    await sound.pauseAsync();
  } catch (error) {
    console.error('Failed to pause sound:', error);
    throw error;
  }
}

/**
 * Stops audio playback and resets position
 */
export async function stopSound(sound: Audio.Sound): Promise<void> {
  try {
    await sound.stopAsync();
    await sound.setPositionAsync(0);
  } catch (error) {
    console.error('Failed to stop sound:', error);
    throw error;
  }
}

/**
 * Unloads sound from memory
 */
export async function unloadSound(sound: Audio.Sound): Promise<void> {
  try {
    await sound.unloadAsync();
  } catch (error) {
    console.error('Failed to unload sound:', error);
  }
}

/**
 * Gets the current playback status
 */
export async function getSoundStatus(sound: Audio.Sound): Promise<{
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  didJustFinish: boolean;
}> {
  try {
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) {
      return {
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 0,
        didJustFinish: false,
      };
    }
    return {
      isPlaying: status.isPlaying,
      positionMillis: status.positionMillis,
      durationMillis: status.durationMillis || 0,
      didJustFinish: status.didJustFinish || false,
    };
  } catch (error) {
    console.error('Failed to get sound status:', error);
    return {
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 0,
      didJustFinish: false,
    };
  }
}

/**
 * Saves a recording to a permanent location
 */
export async function saveRecording(
  uri: string,
  userId: string
): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileName = `voice_intro_${userId}_${timestamp}.m4a`;

    // Create directory if needed
    const voiceIntrosDir = new Directory(Paths.document, 'voice_intros');
    if (!voiceIntrosDir.exists) {
      voiceIntrosDir.create();
    }

    // Create target file and move
    const sourceFile = new File(uri);
    const targetFile = new File(voiceIntrosDir, fileName);
    sourceFile.move(targetFile);

    return targetFile.uri;
  } catch (error) {
    console.error('Failed to save recording:', error);
    throw error;
  }
}

/**
 * Deletes a recording file
 */
export async function deleteRecording(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error('Failed to delete recording:', error);
  }
}

/**
 * Gets the file size of a recording in bytes
 */
export async function getRecordingSize(uri: string): Promise<number> {
  try {
    const file = new File(uri);
    if (file.exists) {
      return file.size || 0;
    }
    return 0;
  } catch (error) {
    console.error('Failed to get recording size:', error);
    return 0;
  }
}

/**
 * Formats duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generates waveform data from metering values
 */
export function generateWaveformFromMetering(
  meteringValues: number[]
): number[] {
  // Normalize metering values to 0-1 range
  // Metering is typically in dB (negative values, e.g., -160 to 0)
  return meteringValues.map((value) => {
    // Convert dB to 0-1 scale
    const normalized = (value + 160) / 160;
    return Math.max(0, Math.min(1, normalized));
  });
}
