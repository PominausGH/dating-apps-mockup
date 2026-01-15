import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { DateWindow, ScheduledDate } from '../types';
import { autoScheduleDate } from '../utils/schedulingAlgorithm';
import MatchConfirmationScreen from './MatchConfirmationScreen';
import { useDiscoverUsers } from '../hooks/useDiscoverUsers';
import { useUserAvailability } from '../hooks/useUserAvailability';
import { useAuth } from '../contexts/AuthContext';
import { recordSwipe } from '../services/matchService';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface Profile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  distance: string;
  bio: string;
  availability: string;
  availabilitySlots: DateWindow[];
  photos: string[];
  verified: boolean;
  alreadyLikedYou?: boolean; // Simulates if they swiped right on you first
}


export default function DiscoverScreen() {
  const { currentUser } = useAuth();
  const { users, loading, error } = useDiscoverUsers();
  const { availability: userAvailability } = useUserAvailability();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchConfirmation, setShowMatchConfirmation] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<{
    profile: Profile;
    scheduledDate: ScheduledDate;
  } | null>(null);
  const [swipeProcessing, setSwipeProcessing] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.92, 1],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !swipeProcessing,
    onPanResponderMove: (_, gesture) => {
      if (!swipeProcessing) {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (swipeProcessing) return;

      if (gesture.dx > SWIPE_THRESHOLD) {
        swipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        swipeLeft();
      } else {
        resetPosition();
      }
    },
  });

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => handleSwipeComplete('like'));
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => handleSwipeComplete('pass'));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const handleSwipeComplete = async (action: 'like' | 'pass') => {
    const profile = users[currentIndex];

    if (!currentUser || !profile) {
      setCurrentIndex((prev) => prev + 1);
      position.setValue({ x: 0, y: 0 });
      return;
    }

    setSwipeProcessing(true);

    try {
      // Record swipe to Firestore
      const result = await recordSwipe(currentUser.uid, profile.id, action);

      if (result.isMatch) {
        // It's a match! Run auto-scheduling algorithm
        const scheduledDate = autoScheduleDate(
          `match_${profile.id}_${currentUser.uid}`,
          currentUser.uid,
          profile.id,
          userAvailability,
          profile.availabilitySlots
        );

        if (scheduledDate) {
          // Show match confirmation screen
          setCurrentMatch({ profile, scheduledDate });
          setShowMatchConfirmation(true);
        } else {
          // No overlapping availability
          Alert.alert(
            'It\'s a Match!',
            `You matched with ${profile.name}! However, you don't have overlapping availability yet. Update your schedule to plan a date.`,
            [{ text: 'OK' }]
          );
        }
      }

      // Move to next profile
      setCurrentIndex((prev) => prev + 1);
      position.setValue({ x: 0, y: 0 });
    } catch (error: any) {
      console.error('Error handling swipe:', error);
      Alert.alert('Error', 'Failed to save your swipe. Please try again.');
      // Reset position so user can try again
      position.setValue({ x: 0, y: 0 });
    } finally {
      setSwipeProcessing(false);
    }
  };

  const handleConfirmDate = () => {
    if (currentMatch) {
      console.log('Date confirmed!', currentMatch.scheduledDate);
      // Update scheduled date status to confirmed
      setShowMatchConfirmation(false);
      setCurrentMatch(null);
      // In real app: save to database, send notification, etc.
    }
  };

  const handleRequestAlternative = (slot: any) => {
    console.log('Requested alternative slot:', slot);
    // In real app: notify other user, update scheduled date
    alert(`Alternative time requested: ${slot.dayName}`);
  };

  const handleVenueSelected = (venue: any, decideInPerson: boolean) => {
    console.log('Venue selected:', venue, 'Decide in person:', decideInPerson);
    // Update the current match with venue selection
    if (currentMatch) {
      const updatedScheduledDate = {
        ...currentMatch.scheduledDate,
        selectedVenue: venue,
        decideVenueInPerson: decideInPerson,
      };
      setCurrentMatch({ ...currentMatch, scheduledDate: updatedScheduledDate });
    }
    // In real app: save venue selection to database
  };

  const handleCloseMatch = () => {
    setShowMatchConfirmation(false);
  };

  const renderCard = (profile: Profile, index: number) => {
    if (index < currentIndex) return null;

    const isCurrentCard = index === currentIndex;
    const animatedStyle = isCurrentCard
      ? {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: rotation },
          ],
        }
      : {
          transform: [{ scale: nextCardScale }],
        };

    return (
      <Animated.View
        key={profile.id}
        style={[
          styles.card,
          animatedStyle,
          { zIndex: users.length - index },
        ]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        <Image source={{ uri: profile.photos[0] }} style={styles.cardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />

        {/* Like/Nope Labels */}
        {isCurrentCard && (
          <>
            <Animated.View style={[styles.labelContainer, styles.likeLabel, { opacity: likeOpacity }]}>
              <Text style={styles.labelText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.labelContainer, styles.nopeLabel, { opacity: nopeOpacity }]}>
              <Text style={[styles.labelText, { color: colors.error }]}>NOPE</Text>
            </Animated.View>
          </>
        )}

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            {profile.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
              </View>
            )}
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text style={styles.detail}>{profile.distance}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={16} color="#fff" />
            <Text style={styles.detail}>{profile.occupation}</Text>
          </View>
          <View style={styles.availabilityBadge}>
            <Ionicons name="calendar" size={14} color={colors.success} />
            <Text style={styles.availabilityText}>{profile.availability}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>IntentMatch</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>IntentMatch</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
          <Text style={styles.errorText}>Failed to load profiles</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>IntentMatch</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>

      <View style={styles.cardsContainer}>
        {currentIndex >= users.length ? (
          <View style={styles.noMoreCards}>
            <Ionicons name="heart-outline" size={80} color={colors.gray[300]} />
            <Text style={styles.noMoreText}>
              {users.length === 0 ? 'No users available' : 'No more profiles'}
            </Text>
            <Text style={styles.noMoreSubtext}>
              {users.length === 0
                ? 'Be the first to complete your profile!'
                : 'Check back later for new matches!'}
            </Text>
          </View>
        ) : (
          users.map((profile, index) => renderCard(profile, index)).reverse()
        )}
      </View>

      {currentIndex < users.length && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={swipeLeft}
            disabled={swipeProcessing}
          >
            {swipeProcessing ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Ionicons name="close" size={32} color={colors.error} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            disabled={swipeProcessing}
          >
            <Ionicons name="star" size={28} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={swipeRight}
            disabled={swipeProcessing}
          >
            {swipeProcessing ? (
              <ActivityIndicator color={colors.success} />
            ) : (
              <Ionicons name="heart" size={32} color={colors.success} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>

    {/* Match Confirmation Modal */}
    {currentMatch && (
      <MatchConfirmationScreen
        visible={showMatchConfirmation}
        matchedUser={{
          id: currentMatch.profile.id,
          name: currentMatch.profile.name,
          age: currentMatch.profile.age,
          bio: currentMatch.profile.bio,
          photos: currentMatch.profile.photos,
          occupation: currentMatch.profile.occupation,
          distance: parseFloat(currentMatch.profile.distance),
          availability: [],
          verified: currentMatch.profile.verified,
        }}
        scheduledDate={currentMatch.scheduledDate}
        currentUserId="current_user"
        onConfirm={handleConfirmDate}
        onRequestAlternative={handleRequestAlternative}
        onVenueSelected={handleVenueSelected}
        onClose={handleCloseMatch}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: width - 40,
    height: height * 0.6,
    borderRadius: 20,
    backgroundColor: colors.white,
    overflow: 'hidden',
    ...shadows.xl,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  labelContainer: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeLabel: {
    right: 20,
    borderColor: colors.success,
    transform: [{ rotate: '15deg' }],
  },
  nopeLabel: {
    left: 20,
    borderColor: colors.error,
    transform: [{ rotate: '-15deg' }],
  },
  labelText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.success,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  verifiedBadge: {
    marginLeft: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detail: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 6,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  passButton: {
    backgroundColor: colors.errorLight,
  },
  superLikeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.warningLight,
  },
  likeButton: {
    backgroundColor: colors.successLight,
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[600],
    marginTop: 16,
  },
  noMoreSubtext: {
    fontSize: 16,
    color: colors.gray[400],
    marginTop: 8,
  },
});
