import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { Audio } from 'expo-av';
import { startRecording, stopRecording, requestAudioPermissions } from '../utils/audioRecording';

const { width, height } = Dimensions.get('window');
const TOTAL_STEPS = 5;

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [minAge, setMinAge] = useState('21');
  const [maxAge, setMaxAge] = useState('35');
  const [maxDistance, setMaxDistance] = useState('25');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const recording = useRef<Audio.Recording | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({ x: width * nextStep, animated: true });
    } else {
      // Complete onboarding
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({ x: width * prevStep, animated: true });
    }
  };

  const handleStartRecording = async () => {
    try {
      const newRecording = await startRecording();
      recording.current = newRecording;
      setIsRecording(true);
      setRecordingTime(0);

      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            handleStopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please enable microphone permissions.');
    }
  };

  const handleStopRecording = async () => {
    if (!recording.current) return;

    try {
      await stopRecording(recording.current);
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }

      if (recordingTime >= 5) {
        setHasRecording(true);
      } else {
        Alert.alert('Recording Too Short', 'Please record at least 5 seconds.');
      }

      recording.current = null;
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
      setIsRecording(false);
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome screen
      case 1:
        return hasRecording;
      case 2:
        return name.length > 0 && age.length > 0 && parseInt(age) >= 18;
      case 3:
        return true; // Preferences
      case 4:
        return true; // Permissions
      default:
        return false;
    }
  };

  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.iconGradient}
        >
          <Ionicons name="mic" size={80} color={colors.white} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Welcome to VoiceFirst</Text>
      <Text style={styles.stepSubtitle}>
        The dating app where personality comes first
      </Text>
      <Text style={styles.stepDescription}>
        Skip the superficiality. Connect through conversation. Fall for the voice, not just the face.
      </Text>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Ionicons name="mic-outline" size={24} color={colors.primary} />
          <Text style={styles.featureText}>Voice-only profiles</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="eye-off-outline" size={24} color={colors.primary} />
          <Text style={styles.featureText}>Photos unlock gradually</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="heart-outline" size={24} color={colors.primary} />
          <Text style={styles.featureText}>Meaningful connections</Text>
        </View>
      </View>
    </View>
  );

  const renderRecordingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={isRecording ? ['#EF4444', '#DC2626'] : colors.gradient.primary}
          style={styles.iconGradient}
        >
          <Ionicons
            name={isRecording ? 'stop' : hasRecording ? 'checkmark' : 'mic'}
            size={60}
            color={colors.white}
          />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Record Your Voice Intro</Text>
      <Text style={styles.stepSubtitle}>
        Tell us about yourself in 30 seconds
      </Text>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.pulsingDot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}

      {isRecording || hasRecording ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
          </Text>
          <Text style={styles.timerLimit}>/ 0:30</Text>
        </View>
      ) : null}

      <View style={styles.promptCard}>
        <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
        <Text style={styles.promptText}>
          "Tell us about yourself - what do you love doing, and what makes you unique?"
        </Text>
      </View>

      <TouchableOpacity
        style={styles.recordButton}
        onPress={isRecording ? handleStopRecording : handleStartRecording}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isRecording ? ['#EF4444', '#DC2626'] : colors.gradient.primary}
          style={styles.recordButtonGradient}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : hasRecording ? 'Re-record' : 'Start Recording'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {hasRecording && (
        <Text style={styles.successText}>✓ Voice intro recorded!</Text>
      )}
    </View>
  );

  const renderProfileStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.iconGradient}
        >
          <Ionicons name="person" size={60} color={colors.white} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Basic Info</Text>
      <Text style={styles.stepSubtitle}>
        Tell us a bit about yourself
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.gray[400]}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="18+"
            placeholderTextColor={colors.gray[400]}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="A few words about you..."
            placeholderTextColor={colors.gray[400]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.iconGradient}
        >
          <Ionicons name="options" size={60} color={colors.white} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Your Preferences</Text>
      <Text style={styles.stepSubtitle}>
        Who are you interested in meeting?
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.preferenceCard}>
          <Text style={styles.preferenceLabel}>Age Range</Text>
          <View style={styles.rangeInputs}>
            <TextInput
              style={styles.rangeInput}
              placeholder="Min"
              placeholderTextColor={colors.gray[400]}
              value={minAge}
              onChangeText={setMinAge}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.rangeSeparator}>-</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="Max"
              placeholderTextColor={colors.gray[400]}
              value={maxAge}
              onChangeText={setMaxAge}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>

        <View style={styles.preferenceCard}>
          <Text style={styles.preferenceLabel}>Maximum Distance</Text>
          <View style={styles.distanceRow}>
            <TextInput
              style={styles.distanceInput}
              value={maxDistance}
              onChangeText={setMaxDistance}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.distanceUnit}>miles</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPermissionsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.iconGradient}
        >
          <Ionicons name="shield-checkmark" size={60} color={colors.white} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Almost There!</Text>
      <Text style={styles.stepSubtitle}>
        We need a few permissions to make the magic happen
      </Text>

      <View style={styles.permissionsList}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="mic" size={24} color={colors.primary} />
          </View>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Microphone Access</Text>
            <Text style={styles.permissionDescription}>
              Record and play voice intros
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="location" size={24} color={colors.primary} />
          </View>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Location (Optional)</Text>
            <Text style={styles.permissionDescription}>
              Find matches near you
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
          </View>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Notifications (Optional)</Text>
            <Text style={styles.permissionDescription}>
              Get notified about new matches
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </View>
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderRecordingStep();
      case 2:
        return renderProfileStep();
      case 3:
        return renderPreferencesStep();
      case 4:
        return renderPermissionsStep();
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a3e', '#0f0f23']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={handlePrevious} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
          <View style={styles.headerSpacer} />
          {currentStep < TOTAL_STEPS - 1 && (
            <TouchableOpacity onPress={() => onComplete()} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress */}
        {renderProgressDots()}

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          scrollEventThrottle={16}
        >
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
            onPress={handleNext}
            disabled={!canContinue()}
          >
            <LinearGradient
              colors={canContinue() ? colors.gradient.primary : [colors.gray[300], colors.gray[400]]}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {currentStep === TOTAL_STEPS - 1 ? "Let's Go!" : 'Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresList: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.white,
    marginLeft: 16,
    fontWeight: '600',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.white,
  },
  timerLimit: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 4,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    color: colors.white,
    marginLeft: 12,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  recordButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.lg,
  },
  recordButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  successText: {
    fontSize: 16,
    color: colors.success,
    marginTop: 16,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
    gap: 20,
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    minHeight: 80,
  },
  preferenceCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rangeSeparator: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distanceInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  distanceUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  permissionsList: {
    width: '100%',
    gap: 12,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  termsContainer: {
    marginTop: 24,
  },
  termsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.lg,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});
