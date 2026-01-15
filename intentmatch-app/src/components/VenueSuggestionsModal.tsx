import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { Venue, TimeSlot } from '../types';
import { getVenueSuggestions, getVenueIcon } from '../utils/mockVenues';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface VenueSuggestionsModalProps {
  visible: boolean;
  timeSlot: TimeSlot;
  onSelectVenue: (venue: Venue) => void;
  onDecideInPerson: () => void;
  onClose: () => void;
}

export default function VenueSuggestionsModal({
  visible,
  timeSlot,
  onSelectVenue,
  onDecideInPerson,
  onClose,
}: VenueSuggestionsModalProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    if (visible) {
      // Get venue suggestions based on time of day
      const suggestions = getVenueSuggestions(timeSlot.timeOfDay);
      setVenues(suggestions);
      setSelectedVenue(null);
    }
  }, [visible, timeSlot]);

  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
  };

  const handleConfirm = () => {
    if (selectedVenue) {
      onSelectVenue(selectedVenue);
    }
  };

  const handleDecideInPerson = () => {
    onDecideInPerson();
  };

  const getTimeOfDayLabel = () => {
    switch (timeSlot.timeOfDay) {
      case 'morning':
        return 'Morning';
      case 'afternoon':
        return 'Afternoon';
      case 'evening':
        return 'Evening';
      default:
        return '';
    }
  };

  const getVenueTypeLabel = () => {
    return timeSlot.timeOfDay === 'evening'
      ? 'Great spots for dinner or drinks'
      : 'Perfect coffee shops for your date';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={32} color={colors.accent} />
            </View>
            <Text style={styles.title}>Choose a Venue</Text>
            <Text style={styles.subtitle}>{getVenueTypeLabel()}</Text>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={14} color={colors.white} />
              <Text style={styles.timeBadgeText}>{getTimeOfDayLabel()} Date</Text>
            </View>
          </View>

          {/* Venue Cards */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {venues.map((venue) => (
              <TouchableOpacity
                key={venue.id}
                style={[
                  styles.venueCard,
                  selectedVenue?.id === venue.id && styles.venueCardSelected,
                ]}
                onPress={() => handleVenueSelect(venue)}
                activeOpacity={0.8}
              >
                {/* Venue Image */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: venue.imageUrl }} style={styles.venueImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageGradient}
                  />
                  {selectedVenue?.id === venue.id && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                    </View>
                  )}
                </View>

                {/* Venue Details */}
                <View style={styles.venueDetails}>
                  <View style={styles.venueHeader}>
                    <View style={styles.venueNameContainer}>
                      <Text style={styles.venueName} numberOfLines={1}>
                        {venue.name}
                      </Text>
                      <View style={styles.categoryBadge}>
                        <Ionicons
                          name={getVenueIcon(venue.type) as any}
                          size={12}
                          color={colors.accent}
                        />
                        <Text style={styles.categoryText}>{venue.category}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.venueInfo}>
                    {/* Rating */}
                    <View style={styles.infoRow}>
                      <Ionicons name="star" size={14} color="#FFC107" />
                      <Text style={styles.infoText}>
                        {venue.rating.toFixed(1)} ({venue.reviewCount.toLocaleString()})
                      </Text>
                    </View>

                    {/* Distance */}
                    <View style={styles.infoRow}>
                      <Ionicons name="navigate" size={14} color={colors.accent} />
                      <Text style={styles.infoText}>{venue.distance} mi away</Text>
                    </View>

                    {/* Price */}
                    <View style={styles.infoRow}>
                      <Text style={styles.priceText}>{venue.priceLevel}</Text>
                    </View>
                  </View>

                  {/* Address */}
                  <View style={styles.addressContainer}>
                    <Ionicons name="location-outline" size={14} color={colors.gray[400]} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {venue.address}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Decide in Person Card */}
            <TouchableOpacity
              style={[
                styles.decideCard,
                selectedVenue === null && styles.decideCardHighlight,
              ]}
              onPress={() => setSelectedVenue(null)}
              activeOpacity={0.8}
            >
              <View style={styles.decideIcon}>
                <Ionicons name="people-outline" size={32} color={colors.accent} />
              </View>
              <Text style={styles.decideTitle}>We'll Decide in Person</Text>
              <Text style={styles.decideSubtitle}>
                Choose your venue together when you meet
              </Text>
              {selectedVenue === null && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedVenue && selectedVenue !== null && styles.confirmButtonDisabled,
              ]}
              onPress={selectedVenue ? handleConfirm : handleDecideInPerson}
              disabled={false}
            >
              <Text style={styles.confirmButtonText}>
                {selectedVenue
                  ? `Confirm ${selectedVenue.name}`
                  : "Continue Without Venue"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.helperText}>
              You can change this later in your match details
            </Text>
          </View>
        </SafeAreaView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeButton: {
    padding: 8,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 162, 97, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  timeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  venueCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadows.lg,
  },
  venueCardSelected: {
    borderColor: colors.success,
    borderWidth: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 4,
    ...shadows.md,
  },
  venueDetails: {
    padding: 16,
  },
  venueHeader: {
    marginBottom: 12,
  },
  venueNameContainer: {
    gap: 6,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '500',
  },
  venueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '500',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gray[50],
    padding: 8,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 13,
    color: colors.gray[600],
    flex: 1,
  },
  decideCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadows.lg,
  },
  decideCardHighlight: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(244, 162, 97, 0.05)',
  },
  decideIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  decideTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  decideSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  bottomPadding: {
    height: 20,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(29, 53, 87, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.lg,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
  },
});
