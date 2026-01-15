import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  saveOnboardingComplete,
  saveUserProfile,
  saveUserPreferences,
  saveVoiceIntroUri,
} from '../utils/storageUtils';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Step components
const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.stepContainer}>
      <Animated.View
        style={[
          styles.stepContent,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#E63946', '#F4A261']}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mic" size={80} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.stepTitle}>Welcome to VoiceFirst</Text>
        <Text style={styles.stepSubtitle}>
          Where Voices Connect Before Faces
        </Text>

        <View style={styles.featureList}>
          <FeatureItem
            icon="heart-outline"
            text="Connect through authentic conversations"
          />
          <FeatureItem
            icon="lock-closed-outline"
            text="Photos reveal as you chat and build connection"
          />
          <FeatureItem
            icon="people-outline"
            text="Match based on personality, not just looks"
          />
          <FeatureItem
            icon="star-outline"
            text="Find genuine relationships that last"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon as any} size={24} color="#E63946" />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const VoiceIntroStep = ({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleRecord = () => {
    setIsRecording(true);
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 3000);
  };

  return (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#F4A261', '#E76F51']}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mic-outline" size={80} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.stepTitle}>Record Your Voice Intro</Text>
        <Text style={styles.stepDescription}>
          Let others hear your personality! Record a short intro about yourself.
        </Text>

        <View style={styles.recordingTips}>
          <TipItem text="Introduce yourself and what you're looking for" />
          <TipItem text="Share your hobbies or interests" />
          <TipItem text="Keep it natural and authentic" />
        </View>

        <View style={styles.recordButtonContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={handleRecord}
            disabled={isRecording}
          >
            <Animated.View
              style={[
                styles.recordButtonInner,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons
                name={isRecording ? 'stop' : hasRecorded ? 'checkmark' : 'mic'}
                size={48}
                color="#fff"
              />
            </Animated.View>
          </TouchableOpacity>
          {isRecording && (
            <Text style={styles.recordingText}>Recording...</Text>
          )}
          {hasRecorded && !isRecording && (
            <Text style={styles.recordedText}>Great! You can re-record or continue</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onSkip}>
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
          {hasRecorded && (
            <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const TipItem = ({ text }: { text: string }) => (
  <View style={styles.tipItem}>
    <Ionicons name="bulb-outline" size={18} color="#F4A261" />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const ProfileInfoStep = ({ onNext }: { onNext: () => void }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const canContinue = name.length > 0 && age.length > 0 && bio.length > 10;

  const handleNext = async () => {
    await saveUserProfile({
      name,
      age: parseInt(age, 10),
      bio,
    });
    onNext();
  };

  return (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#2A9D8F', '#264653']}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person" size={80} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.stepTitle}>Tell Us About You</Text>
        <Text style={styles.stepDescription}>
          Help others get to know you better
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor="#9CA3AF"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself, your interests, what you're looking for..."
              placeholderTextColor="#9CA3AF"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={250}
            />
            <Text style={styles.charCount}>{bio.length}/250</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !canContinue && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

const PreferencesStep = ({ onNext }: { onNext: () => void }) => {
  const [ageRange, setAgeRange] = useState([25, 35]);
  const [distance, setDistance] = useState(25);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = async () => {
    await saveUserPreferences({
      ageRange: [ageRange[0], ageRange[1]] as [number, number],
      maxDistance: distance,
    });
    onNext();
  };

  return (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="options" size={80} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.stepTitle}>Set Your Preferences</Text>
        <Text style={styles.stepDescription}>
          Tell us who you'd like to meet
        </Text>

        <View style={styles.preferenceContainer}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceHeader}>
              <Ionicons name="calendar-outline" size={24} color="#1D3557" />
              <Text style={styles.preferenceLabel}>Age Range</Text>
            </View>
            <View style={styles.rangeDisplay}>
              <View style={styles.rangeValue}>
                <Text style={styles.rangeText}>{ageRange[0]}</Text>
              </View>
              <Text style={styles.rangeSeparator}>to</Text>
              <View style={styles.rangeValue}>
                <Text style={styles.rangeText}>{ageRange[1]}</Text>
              </View>
            </View>
            <View style={styles.rangeControls}>
              <TouchableOpacity
                style={styles.rangeButton}
                onPress={() => setAgeRange([Math.max(18, ageRange[0] - 1), ageRange[1]])}
              >
                <Ionicons name="remove" size={20} color="#E63946" />
              </TouchableOpacity>
              <Text style={styles.rangeDescription}>Adjust your preferred age range</Text>
              <TouchableOpacity
                style={styles.rangeButton}
                onPress={() => setAgeRange([ageRange[0], Math.min(99, ageRange[1] + 1)])}
              >
                <Ionicons name="add" size={20} color="#E63946" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceHeader}>
              <Ionicons name="location-outline" size={24} color="#1D3557" />
              <Text style={styles.preferenceLabel}>Maximum Distance</Text>
            </View>
            <View style={styles.rangeDisplay}>
              <Text style={styles.distanceText}>{distance} miles</Text>
            </View>
            <View style={styles.rangeControls}>
              <TouchableOpacity
                style={styles.rangeButton}
                onPress={() => setDistance(Math.max(5, distance - 5))}
              >
                <Ionicons name="remove" size={20} color="#E63946" />
              </TouchableOpacity>
              <Text style={styles.rangeDescription}>How far are you willing to travel?</Text>
              <TouchableOpacity
                style={styles.rangeButton}
                onPress={() => setDistance(Math.min(100, distance + 5))}
              >
                <Ionicons name="add" size={20} color="#E63946" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const PermissionsStep = ({ onComplete }: { onComplete: () => void }) => {
  const [micGranted, setMicGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const requestMicPermission = async () => {
    // In real app: use expo-av or expo-microphone
    setTimeout(() => setMicGranted(true), 500);
  };

  const requestLocationPermission = async () => {
    // In real app: use expo-location
    setTimeout(() => setLocationGranted(true), 500);
  };

  const canComplete = micGranted && locationGranted;

  return (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="shield-checkmark" size={80} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.stepTitle}>Grant Permissions</Text>
        <Text style={styles.stepDescription}>
          We need a few permissions to make your experience great
        </Text>

        <View style={styles.permissionsList}>
          <PermissionCard
            icon="mic"
            title="Microphone Access"
            description="Record voice intros and voice messages"
            granted={micGranted}
            onGrant={requestMicPermission}
          />
          <PermissionCard
            icon="location"
            title="Location Access"
            description="Find matches near you"
            granted={locationGranted}
            onGrant={requestLocationPermission}
          />
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={20} color="#6B7280" />
          <Text style={styles.privacyText}>
            We respect your privacy. Your data is secure and never shared without permission.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !canComplete && styles.buttonDisabled]}
          onPress={onComplete}
          disabled={!canComplete}
        >
          <Text style={styles.primaryButtonText}>Complete Setup</Text>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const PermissionCard = ({
  icon,
  title,
  description,
  granted,
  onGrant,
}: {
  icon: string;
  title: string;
  description: string;
  granted: boolean;
  onGrant: () => void;
}) => (
  <View style={styles.permissionCard}>
    <View style={styles.permissionIconContainer}>
      <Ionicons name={icon as any} size={32} color={granted ? '#10B981' : '#6B7280'} />
    </View>
    <View style={styles.permissionContent}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionDescription}>{description}</Text>
    </View>
    {granted ? (
      <View style={styles.grantedBadge}>
        <Ionicons name="checkmark-circle" size={28} color="#10B981" />
      </View>
    ) : (
      <TouchableOpacity style={styles.grantButton} onPress={onGrant}>
        <Text style={styles.grantButtonText}>Grant</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Main Onboarding Screen
export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: VoiceIntroStep, title: 'Voice Intro' },
    { component: ProfileInfoStep, title: 'Profile' },
    { component: PreferencesStep, title: 'Preferences' },
    { component: PermissionsStep, title: 'Permissions' },
  ];

  const totalSteps = steps.length;

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * width,
        animated: true,
      });
    }
  };

  const skipToNextStep = () => {
    goToNextStep();
  };

  const handleComplete = async () => {
    // Save onboarding completion status
    await saveOnboardingComplete();
    console.log('Onboarding completed');
    onComplete();
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F1FAEE', '#FFFFFF']}
        style={styles.background}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {totalSteps}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {currentStep === 0 && <WelcomeStep onNext={goToNextStep} />}
          {currentStep === 1 && (
            <VoiceIntroStep onNext={goToNextStep} onSkip={skipToNextStep} />
          )}
          {currentStep === 2 && <ProfileInfoStep onNext={goToNextStep} />}
          {currentStep === 3 && <PreferencesStep onNext={goToNextStep} />}
          {currentStep === 4 && <PermissionsStep onComplete={handleComplete} />}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FAEE',
  },
  background: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
  },
  progressDotActive: {
    backgroundColor: '#E63946',
    width: 24,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: width,
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContent: {
    flex: 1,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gradientIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1D3557',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E63946',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featureList: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#1D3557',
    flex: 1,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E63946',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  recordingTips: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
  recordButtonContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  recordButtonActive: {
    backgroundColor: '#F4A261',
  },
  recordButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#E63946',
  },
  recordedText: {
    marginTop: 16,
    fontSize: 14,
    color: '#10B981',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3557',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1D3557',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  preferenceContainer: {
    marginBottom: 32,
  },
  preferenceItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  preferenceLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
  },
  rangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  rangeValue: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  rangeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  rangeSeparator: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E63946',
  },
  rangeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeDescription: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  permissionsList: {
    marginBottom: 24,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  permissionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  grantedBadge: {
    marginLeft: 12,
  },
  grantButton: {
    backgroundColor: '#E63946',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 12,
  },
  grantButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  privacyText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
});
