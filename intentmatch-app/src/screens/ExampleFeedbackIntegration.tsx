/**
 * Example Integration for Date Feedback System
 *
 * This file demonstrates how to integrate the DateFeedbackScreen into your app.
 * It shows the full flow from detecting when feedback is needed to updating the data.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import {
  Match,
  ScheduledDate,
  User,
  DateFeedback,
  TimeSlot,
} from '../types';
import DateFeedbackScreen from './DateFeedbackScreen';
import { FeedbackPromptBanner, AccountabilityBadge } from '../components';
import {
  shouldShowFeedbackPrompt,
  hasUserSubmittedFeedback,
  haveBothUsersSubmittedFeedback,
  calculateAccountabilityScore,
  didBothUsersShowUp,
  getTimeUntilDate,
} from '../utils/feedbackUtils';

// Mock current user ID
const CURRENT_USER_ID = 'user1';

// Mock data
const mockUser: User = {
  id: 'user2',
  name: 'Sarah',
  age: 28,
  bio: 'Coffee enthusiast and weekend hiker',
  photos: ['https://i.pravatar.cc/300?img=1'],
  occupation: 'Product Designer',
  distance: 2.5,
  availability: [],
  verified: true,
};

const mockTimeSlot: TimeSlot = {
  id: 'slot1',
  userId: CURRENT_USER_ID,
  date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  timeOfDay: 'evening',
  startTime: '18:00',
  endTime: '20:00',
  dayName: 'Saturday',
};

export default function ExampleFeedbackIntegration() {
  const [showFeedbackScreen, setShowFeedbackScreen] = useState(false);
  const [accountabilityScore, setAccountabilityScore] = useState(100);

  // State for the scheduled date
  const [scheduledDate, setScheduledDate] = useState<ScheduledDate>({
    id: 'date1',
    matchId: 'match1',
    user1Id: CURRENT_USER_ID,
    user2Id: mockUser.id,
    selectedSlot: mockTimeSlot,
    alternativeSlots: [],
    status: 'confirmed',
    confirmationDeadline: new Date(Date.now() + 1000 * 60 * 60),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    confirmedByUser1: true,
    confirmedByUser2: true,
    // Initially no feedback
    feedback: undefined,
  });

  // Check if feedback prompt should be shown
  const shouldPrompt = shouldShowFeedbackPrompt(scheduledDate, CURRENT_USER_ID);
  const hasSubmitted = hasUserSubmittedFeedback(scheduledDate, CURRENT_USER_ID);
  const bothSubmitted = haveBothUsersSubmittedFeedback(scheduledDate);

  // Handle feedback submission
  const handleSubmitFeedback = (feedback: DateFeedback) => {
    console.log('Feedback submitted:', feedback);

    // Update the scheduled date with the feedback
    setScheduledDate((prev) => {
      const newFeedback = { ...prev.feedback };

      if (CURRENT_USER_ID === prev.user1Id) {
        newFeedback.user1 = feedback;
      } else {
        newFeedback.user2 = feedback;
      }

      // Update status to completed if both users submitted
      const newStatus =
        newFeedback.user1 && newFeedback.user2 ? 'completed' : prev.status;

      return {
        ...prev,
        feedback: newFeedback,
        status: newStatus,
      };
    });

    // Calculate accountability score
    const showedUp = feedback.didMeetInPerson === 'yes';
    const newScore = calculateAccountabilityScore(accountabilityScore, showedUp);
    setAccountabilityScore(newScore);

    // In a real app, you would:
    // 1. Save feedback to backend
    // 2. Update user's accountability score
    // 3. Trigger notifications if both submitted
    // 4. Update match status
  };

  // Simulate the other user submitting feedback after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasSubmitted && !bothSubmitted) {
        const otherUserFeedback: DateFeedback = {
          userId: mockUser.id,
          dateId: scheduledDate.id,
          rating: 5,
          didMeetInPerson: 'yes',
          dateQuality: 'great',
          wouldSeeAgain: 'yes',
          additionalFeedback: 'Had a wonderful time! Great conversation.',
          submittedAt: new Date(),
        };

        setScheduledDate((prev) => {
          const newFeedback = { ...prev.feedback };
          if (CURRENT_USER_ID === prev.user1Id) {
            newFeedback.user2 = otherUserFeedback;
          } else {
            newFeedback.user1 = otherUserFeedback;
          }

          return {
            ...prev,
            feedback: newFeedback,
            status: 'completed',
          };
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasSubmitted, bothSubmitted]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Date Feedback Demo</Text>
          <AccountabilityBadge score={accountabilityScore} size="medium" />
        </View>

        {/* Info Cards */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Date Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[styles.statusValue, { color: colors.success }]}>
                {scheduledDate.status}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Time:</Text>
              <Text style={styles.statusValue}>
                {getTimeUntilDate(scheduledDate)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Feedback Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons
                name={hasSubmitted ? 'checkmark-circle' : 'time-outline'}
                size={24}
                color={hasSubmitted ? colors.success : colors.warning}
              />
              <Text style={styles.statusLabel}>
                Your feedback: {hasSubmitted ? 'Submitted' : 'Pending'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons
                name={
                  bothSubmitted
                    ? 'checkmark-circle'
                    : scheduledDate.feedback?.user2 || scheduledDate.feedback?.user1
                    ? 'time-outline'
                    : 'close-circle-outline'
                }
                size={24}
                color={
                  bothSubmitted
                    ? colors.success
                    : scheduledDate.feedback?.user2 || scheduledDate.feedback?.user1
                    ? colors.warning
                    : colors.gray[400]
                }
              />
              <Text style={styles.statusLabel}>
                Their feedback:{' '}
                {bothSubmitted
                  ? 'Submitted'
                  : scheduledDate.feedback?.user2 || scheduledDate.feedback?.user1
                  ? 'Submitted'
                  : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Feedback Prompt Banner */}
        {shouldPrompt && (
          <>
            <Text style={styles.sectionTitle}>Feedback Prompt Example</Text>
            <FeedbackPromptBanner
              scheduledDate={scheduledDate}
              matchedUser={mockUser}
              onPress={() => setShowFeedbackScreen(true)}
            />
          </>
        )}

        {/* Manual Trigger */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Manual Controls</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowFeedbackScreen(true)}
          >
            <Ionicons name="chatbox-ellipses" size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>
              {hasSubmitted ? 'View Feedback' : 'Submit Feedback'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setScheduledDate({
                ...scheduledDate,
                feedback: undefined,
                status: 'confirmed',
              });
              setAccountabilityScore(100);
            }}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Reset Demo</Text>
          </TouchableOpacity>
        </View>

        {/* Integration Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Integrate</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Use shouldShowFeedbackPrompt() to check if feedback is needed
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Display FeedbackPromptBanner in your Matches/Chat screen
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                Navigate to DateFeedbackScreen when user taps the prompt
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Handle feedback submission to update ScheduledDate and accountability score
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>5</Text>
              <Text style={styles.instructionText}>
                Update status to 'completed' when both users submit feedback
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Feedback Screen Modal */}
      <Modal
        visible={showFeedbackScreen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <DateFeedbackScreen
          matchedUser={mockUser}
          scheduledDate={scheduledDate}
          currentUserId={CURRENT_USER_ID}
          onSubmitFeedback={handleSubmitFeedback}
          onClose={() => setShowFeedbackScreen(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 16,
  },
  statusRow: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  actionSection: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  instructionsCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 16,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 24,
  },
});
