import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BlurredPhoto from '../components/BlurredPhoto';
import { calculateBlurIntensity, getUnlockProgress, getNextMilestone } from '../utils/blurUtils';

/**
 * Demo screen showcasing the progressive blur/reveal system
 * This demonstrates all blur levels and the unlock celebration
 */
export default function BlurDemoScreen() {
  const [messageCount, setMessageCount] = useState(0);

  const blurIntensity = calculateBlurIntensity(messageCount);
  const progress = getUnlockProgress(messageCount);
  const nextMilestone = getNextMilestone(messageCount);

  const incrementMessages = () => {
    if (messageCount < 10) {
      setMessageCount(messageCount + 1);
    }
  };

  const decrementMessages = () => {
    if (messageCount > 0) {
      setMessageCount(messageCount - 1);
    }
  };

  const resetMessages = () => {
    setMessageCount(0);
  };

  const setToMilestone = (count: number) => {
    setMessageCount(count);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progressive Blur Demo</Text>
        <Text style={styles.subtitle}>
          VoiceFirst Photo Reveal System
        </Text>

        {/* Main demo photo */}
        <View style={styles.demoPhotoContainer}>
          <BlurredPhoto
            photoUri="https://i.pravatar.cc/400?img=1"
            messageCount={messageCount}
            showProgress={true}
            showCelebration={true}
            style={styles.demoPhoto}
            imageStyle={styles.demoPhotoImage}
            borderRadius={20}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Message Count</Text>
            <Text style={styles.statValue}>{messageCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Blur Intensity</Text>
            <Text style={styles.statValue}>{blurIntensity}%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Progress</Text>
            <Text style={styles.statValue}>{progress}%</Text>
          </View>
        </View>

        {/* Next milestone */}
        {nextMilestone && (
          <View style={styles.milestoneCard}>
            <Ionicons name="trophy-outline" size={24} color="#F59E0B" />
            <Text style={styles.milestoneText}>
              {nextMilestone.label}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <Text style={styles.controlsTitle}>Controls</Text>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.button, styles.decrementButton]}
              onPress={decrementMessages}
              disabled={messageCount === 0}
            >
              <Ionicons name="remove" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.counterText}>{messageCount} messages</Text>

            <TouchableOpacity
              style={[styles.button, styles.incrementButton]}
              onPress={incrementMessages}
              disabled={messageCount === 10}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetMessages}
          >
            <Text style={styles.resetButtonText}>Reset to 0</Text>
          </TouchableOpacity>

          <Text style={styles.presetsTitle}>Quick Presets:</Text>
          <View style={styles.presetButtonsRow}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setToMilestone(0)}
            >
              <Text style={styles.presetButtonText}>0 msgs</Text>
              <Text style={styles.presetSubtext}>(100% blur)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setToMilestone(2)}
            >
              <Text style={styles.presetButtonText}>2 msgs</Text>
              <Text style={styles.presetSubtext}>(80% blur)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setToMilestone(4)}
            >
              <Text style={styles.presetButtonText}>4 msgs</Text>
              <Text style={styles.presetSubtext}>(50% blur)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setToMilestone(7)}
            >
              <Text style={styles.presetButtonText}>7 msgs</Text>
              <Text style={styles.presetSubtext}>(20% blur)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setToMilestone(8)}
            >
              <Text style={styles.presetButtonText}>8 msgs</Text>
              <Text style={styles.presetSubtext}>(unlocked)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature description */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Progressive blur reduction (100% → 0%)
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Animated transitions when blur level changes
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Progress indicator showing unlock percentage
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Celebration animation when fully unlocked
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.featureText}>
              Lock icon for completely hidden photos
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FAEE',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1D3557',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  demoPhotoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  demoPhoto: {
    width: 300,
    height: 400,
  },
  demoPhotoImage: {
    width: 300,
    height: 400,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E63946',
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  milestoneText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 12,
  },
  controls: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decrementButton: {
    backgroundColor: '#EF4444',
  },
  incrementButton: {
    backgroundColor: '#10B981',
  },
  counterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
  },
  resetButton: {
    backgroundColor: '#9CA3AF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D3557',
  },
  presetSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 12,
    lineHeight: 20,
  },
});
