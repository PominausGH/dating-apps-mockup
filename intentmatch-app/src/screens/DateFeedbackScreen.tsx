import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { DateFeedback, ScheduledDate, User } from '../types';

const { width } = Dimensions.get('window');

interface DateFeedbackScreenProps {
  matchedUser: User;
  scheduledDate: ScheduledDate;
  currentUserId: string;
  onSubmitFeedback: (feedback: DateFeedback) => void;
  onClose: () => void;
}

export default function DateFeedbackScreen({
  matchedUser,
  scheduledDate,
  currentUserId,
  onSubmitFeedback,
  onClose,
}: DateFeedbackScreenProps) {
  const [rating, setRating] = useState<number>(0);
  const [didMeetInPerson, setDidMeetInPerson] = useState<'yes' | 'no' | 'rescheduled' | null>(null);
  const [dateQuality, setDateQuality] = useState<'great' | 'good' | 'okay' | 'not_good' | null>(null);
  const [wouldSeeAgain, setWouldSeeAgain] = useState<'yes' | 'maybe' | 'no' | null>(null);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  // Check if other user has submitted feedback
  const otherUserFeedback = currentUserId === scheduledDate.user1Id
    ? scheduledDate.feedback?.user2
    : scheduledDate.feedback?.user1;

  const canViewOtherFeedback = otherUserFeedback && (didMeetInPerson !== null || showThankYou);

  const handleSubmit = () => {
    if (!rating || !didMeetInPerson || !dateQuality || !wouldSeeAgain) {
      Alert.alert('Missing Information', 'Please complete all required fields before submitting.');
      return;
    }

    const feedback: DateFeedback = {
      userId: currentUserId,
      dateId: scheduledDate.id,
      rating,
      didMeetInPerson,
      dateQuality,
      wouldSeeAgain,
      additionalFeedback: additionalFeedback.trim() || undefined,
      submittedAt: new Date(),
    };

    onSubmitFeedback(feedback);
    setShowThankYou(true);
  };

  const renderStarRating = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How would you rate your date?</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={48}
                color={star <= rating ? '#FCD34D' : colors.gray[300]}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {rating === 5 ? 'Amazing!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Okay' : 'Not great'}
          </Text>
        )}
      </View>
    );
  };

  const renderMeetInPerson = () => {
    const options: Array<{ value: 'yes' | 'no' | 'rescheduled'; label: string; emoji: string; color: string }> = [
      { value: 'yes', label: 'Yes', emoji: '✓', color: colors.success },
      { value: 'no', label: 'No', emoji: '✗', color: colors.error },
      { value: 'rescheduled', label: 'Rescheduled', emoji: '↻', color: colors.warning },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Did you meet in person?</Text>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setDidMeetInPerson(option.value)}
              style={[
                styles.optionButton,
                didMeetInPerson === option.value && {
                  backgroundColor: option.color,
                  borderColor: option.color,
                },
              ]}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  didMeetInPerson === option.value && styles.optionLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDateQuality = () => {
    const options: Array<{ value: 'great' | 'good' | 'okay' | 'not_good'; label: string; emoji: string }> = [
      { value: 'great', label: 'Great', emoji: '😍' },
      { value: 'good', label: 'Good', emoji: '😊' },
      { value: 'okay', label: 'Okay', emoji: '😐' },
      { value: 'not_good', label: 'Not good', emoji: '😕' },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How was the date?</Text>
        <View style={styles.qualityGrid}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setDateQuality(option.value)}
              style={[
                styles.qualityButton,
                dateQuality === option.value && styles.qualityButtonActive,
              ]}
            >
              <Text style={styles.qualityEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.qualityLabel,
                  dateQuality === option.value && styles.qualityLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSeeAgain = () => {
    const options: Array<{ value: 'yes' | 'maybe' | 'no'; label: string; emoji: string; color: string }> = [
      { value: 'yes', label: 'Yes!', emoji: '💚', color: colors.success },
      { value: 'maybe', label: 'Maybe', emoji: '💛', color: colors.warning },
      { value: 'no', label: 'No', emoji: '💔', color: colors.error },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Would you see them again?</Text>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setWouldSeeAgain(option.value)}
              style={[
                styles.optionButton,
                wouldSeeAgain === option.value && {
                  backgroundColor: option.color,
                  borderColor: option.color,
                },
              ]}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  wouldSeeAgain === option.value && styles.optionLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderAdditionalFeedback = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional thoughts? (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Share more about your experience..."
          placeholderTextColor={colors.gray[400]}
          value={additionalFeedback}
          onChangeText={setAdditionalFeedback}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={styles.characterCount}>{additionalFeedback.length}/500</Text>
      </View>
    );
  };

  const renderOtherUserFeedback = () => {
    if (!otherUserFeedback) return null;

    const didMatch = didMeetInPerson === 'yes' && otherUserFeedback.didMeetInPerson === 'yes';

    return (
      <View style={styles.section}>
        <View style={styles.feedbackHeader}>
          <Ionicons name="eye" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>{matchedUser.name}'s Feedback</Text>
        </View>

        {didMatch ? (
          <View style={styles.otherFeedbackCard}>
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackLabel}>Rating:</Text>
              <View style={styles.miniStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= otherUserFeedback.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FCD34D"
                  />
                ))}
              </View>
            </View>

            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackLabel}>Date quality:</Text>
              <Text style={styles.feedbackValue}>
                {otherUserFeedback.dateQuality === 'great' ? '😍 Great' :
                 otherUserFeedback.dateQuality === 'good' ? '😊 Good' :
                 otherUserFeedback.dateQuality === 'okay' ? '😐 Okay' : '😕 Not good'}
              </Text>
            </View>

            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackLabel}>See again:</Text>
              <Text style={styles.feedbackValue}>
                {otherUserFeedback.wouldSeeAgain === 'yes' ? '💚 Yes!' :
                 otherUserFeedback.wouldSeeAgain === 'maybe' ? '💛 Maybe' : '💔 No'}
              </Text>
            </View>

            {otherUserFeedback.additionalFeedback && (
              <View style={styles.additionalFeedbackBox}>
                <Text style={styles.feedbackLabel}>Additional thoughts:</Text>
                <Text style={styles.additionalFeedbackText}>
                  {otherUserFeedback.additionalFeedback}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noMeetCard}>
            <Ionicons name="information-circle" size={24} color={colors.gray[400]} />
            <Text style={styles.noMeetText}>
              Since you didn't both meet in person, detailed feedback is not shown.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderThankYou = () => {
    return (
      <View style={styles.thankYouContainer}>
        <View style={styles.thankYouContent}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={64} color={colors.white} />
          </View>
          <Text style={styles.thankYouTitle}>Thank you!</Text>
          <Text style={styles.thankYouText}>
            Your feedback helps us create better matches and improve the dating experience.
          </Text>

          {otherUserFeedback && didMeetInPerson === 'yes' && otherUserFeedback.didMeetInPerson === 'yes' && (
            <View style={styles.accountabilityBox}>
              <Ionicons name="trophy" size={24} color={colors.warning} />
              <Text style={styles.accountabilityText}>
                +10 accountability points for showing up!
              </Text>
            </View>
          )}

          {renderOtherUserFeedback()}

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (showThankYou) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderThankYou()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Date Feedback</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>How was your date with {matchedUser.name}?</Text>
          <Text style={styles.subtitle}>
            Your honest feedback helps us improve matches for everyone
          </Text>
        </View>

        {/* Star Rating */}
        {renderStarRating()}

        {/* Did meet in person */}
        {renderMeetInPerson()}

        {/* Only show quality questions if they met */}
        {didMeetInPerson === 'yes' && (
          <>
            {renderDateQuality()}
            {renderSeeAgain()}
            {renderAdditionalFeedback()}
          </>
        )}

        {/* Show other user's feedback if both submitted and met */}
        {canViewOtherFeedback && renderOtherUserFeedback()}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!rating || !didMeetInPerson ||
             (didMeetInPerson === 'yes' && (!dateQuality || !wouldSeeAgain))) &&
            styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!rating || !didMeetInPerson ||
                   (didMeetInPerson === 'yes' && (!dateQuality || !wouldSeeAgain))}
        >
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          {otherUserFeedback
            ? "Your feedback will be shared with each other"
            : "Your feedback will be shared once you both submit"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  optionLabelActive: {
    color: colors.white,
  },
  qualityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  qualityButton: {
    width: (width - 52) / 2,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  qualityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  qualityEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  qualityLabelActive: {
    color: colors.white,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.secondary,
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  privacyNote: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 16,
    lineHeight: 20,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  otherFeedbackCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    ...shadows.sm,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  feedbackValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  miniStars: {
    flexDirection: 'row',
    gap: 2,
  },
  additionalFeedbackBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  additionalFeedbackText: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 8,
    lineHeight: 20,
  },
  noMeetCard: {
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  noMeetText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  thankYouContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  thankYouContent: {
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...shadows.xl,
  },
  thankYouTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 12,
  },
  thankYouText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  accountabilityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warningLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  accountabilityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginTop: 32,
    ...shadows.md,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});
