import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { ScheduledDate, TimeSlot, User, Venue } from '../types';
import { formatTimeSlot, formatTimeRange } from '../utils/schedulingAlgorithm';
import VenueSuggestionsModal from '../components/VenueSuggestionsModal';

const { width } = Dimensions.get('window');

interface MatchConfirmationScreenProps {
  visible: boolean;
  matchedUser: User;
  scheduledDate: ScheduledDate;
  currentUserId: string;
  onConfirm: () => void;
  onRequestAlternative: (slot: TimeSlot) => void;
  onVenueSelected: (venue: Venue | null, decideInPerson: boolean) => void;
  onClose: () => void;
}

export default function MatchConfirmationScreen({
  visible,
  matchedUser,
  scheduledDate,
  currentUserId,
  onConfirm,
  onRequestAlternative,
  onVenueSelected,
  onClose,
}: MatchConfirmationScreenProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!visible) return;

    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date(scheduledDate.confirmationDeadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [visible, scheduledDate.confirmationDeadline]);

  const handleAlternativeSelect = (slot: TimeSlot) => {
    setShowAlternatives(false);
    onRequestAlternative(slot);
  };

  const handleConfirmDate = () => {
    // Show venue suggestions after confirming the date
    setShowVenueSuggestions(true);
  };

  const handleVenueSelect = (venue: Venue) => {
    setShowVenueSuggestions(false);
    onVenueSelected(venue, false);
    onConfirm();
  };

  const handleDecideInPerson = () => {
    setShowVenueSuggestions(false);
    onVenueSelected(null, true);
    onConfirm();
  };

  const handleCloseVenueSuggestions = () => {
    setShowVenueSuggestions(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={['#E63946', '#c1121f']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>

          {/* Match Header */}
          <View style={styles.header}>
            <Text style={styles.title}>It's a Match!</Text>
            <Text style={styles.subtitle}>Your date is automatically scheduled</Text>
          </View>

          {/* Profile Photos */}
          <View style={styles.photosContainer}>
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri: matchedUser.photos[0] }}
                style={styles.photo}
              />
            </View>
            <View style={styles.heartIcon}>
              <Ionicons name="heart" size={40} color={colors.white} />
            </View>
          </View>

          {/* Scheduled Date Card */}
          <View style={styles.dateCard}>
            <View style={styles.dateHeader}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={styles.dateTitle}>Your Date</Text>
            </View>

            <Text style={styles.dateTime}>
              {formatTimeSlot(scheduledDate.selectedSlot)}
            </Text>

            <View style={styles.timeRange}>
              <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
              <Text style={styles.timeRangeText}>
                {formatTimeRange(scheduledDate.selectedSlot)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.timerContainer}>
              <Ionicons name="hourglass-outline" size={16} color={colors.warning} />
              <Text style={styles.timerText}>
                Confirm within {timeRemaining}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmDate}
            >
              <View style={styles.confirmButtonContent}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                <Text style={styles.confirmButtonText}>Confirm Date</Text>
              </View>
            </TouchableOpacity>

            {scheduledDate.alternativeSlots.length > 0 && (
              <TouchableOpacity
                style={styles.alternativeButton}
                onPress={() => setShowAlternatives(true)}
              >
                <Ionicons name="swap-horizontal-outline" size={20} color={colors.white} />
                <Text style={styles.alternativeButtonText}>
                  Suggest Different Time
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            If no changes are requested, this date will auto-confirm in {timeRemaining}
          </Text>
        </SafeAreaView>

        {/* Alternative Times Modal */}
        <Modal
          visible={showAlternatives}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.alternativesModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Alternative Times</Text>
                <TouchableOpacity onPress={() => setShowAlternatives(false)}>
                  <Ionicons name="close" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                These are the only other times you're both free
              </Text>

              <View style={styles.alternativesList}>
                {scheduledDate.alternativeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={styles.alternativeItem}
                    onPress={() => handleAlternativeSelect(slot)}
                  >
                    <View style={styles.alternativeContent}>
                      <View style={styles.alternativeIcon}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                      </View>
                      <View style={styles.alternativeInfo}>
                        <Text style={styles.alternativeDate}>
                          {formatTimeSlot(slot)}
                        </Text>
                        <Text style={styles.alternativeRange}>
                          {formatTimeRange(slot)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                  </TouchableOpacity>
                ))}
              </View>

              {scheduledDate.alternativeSlots.length === 0 && (
                <View style={styles.noAlternatives}>
                  <Ionicons name="alert-circle-outline" size={48} color={colors.gray[300]} />
                  <Text style={styles.noAlternativesText}>
                    No other overlapping times available
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Venue Suggestions Modal */}
        <VenueSuggestionsModal
          visible={showVenueSuggestions}
          timeSlot={scheduledDate.selectedSlot}
          onSelectVenue={handleVenueSelect}
          onDecideInPerson={handleDecideInPerson}
          onClose={handleCloseVenueSuggestions}
        />
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  photosContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: colors.white,
  },
  heartIcon: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: colors.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.xl,
  },
  dateCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...shadows.xl,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginLeft: 12,
  },
  dateTime: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 8,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 16,
    color: colors.gray[500],
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 6,
  },
  actions: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    ...shadows.md,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  alternativeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  alternativeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  infoText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  alternativesModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.secondary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 24,
  },
  alternativesList: {
    gap: 12,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: 16,
  },
  alternativeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alternativeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  alternativeRange: {
    fontSize: 14,
    color: colors.gray[500],
  },
  noAlternatives: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAlternativesText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 16,
    textAlign: 'center',
  },
});
