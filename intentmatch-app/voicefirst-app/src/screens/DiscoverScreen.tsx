import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import BlurredPhoto from '../components/BlurredPhoto';

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
  photos: string[];
  verified: boolean;
  alreadyLikedYou?: boolean;
}

const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    occupation: 'Product Designer',
    distance: '2.3 miles',
    bio: 'Coffee enthusiast, dog mom, and avid hiker. Looking for someone to explore the city with.',
    availability: 'Free Saturday evening',
    photos: ['https://i.pravatar.cc/400?img=1'],
    verified: true,
    alreadyLikedYou: true,
  },
  {
    id: '2',
    name: 'Emma',
    age: 26,
    occupation: 'Marketing Manager',
    distance: '4.1 miles',
    bio: 'Foodie who loves trying new restaurants. Bookworm. Weekend adventurer.',
    availability: 'Free Sunday afternoon',
    photos: ['https://i.pravatar.cc/400?img=5'],
    verified: true,
    alreadyLikedYou: false,
  },
  {
    id: '3',
    name: 'Jessica',
    age: 30,
    occupation: 'Software Engineer',
    distance: '1.8 miles',
    bio: 'Tech nerd by day, salsa dancer by night. Looking for genuine connections.',
    availability: 'Free Friday evening',
    photos: ['https://i.pravatar.cc/400?img=9'],
    verified: false,
    alreadyLikedYou: false,
  },
  {
    id: '4',
    name: 'Olivia',
    age: 27,
    occupation: 'Photographer',
    distance: '3.5 miles',
    bio: 'Capturing moments and making memories. Love traveling and live music.',
    availability: 'Free Saturday afternoon',
    photos: ['https://i.pravatar.cc/400?img=16'],
    verified: true,
    alreadyLikedYou: false,
  },
];

export default function DiscoverScreen() {
  const [profiles] = useState(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
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

  const handleSwipeComplete = (action: 'like' | 'pass') => {
    const profile = profiles[currentIndex];

    if (action === 'like' && profile?.alreadyLikedYou) {
      console.log('It\'s a match!', profile.name);
      // In real app: show match confirmation, navigate to chat
    } else {
      console.log(`${action} on ${profile?.name}`);
    }

    setCurrentIndex((prev) => prev + 1);
    position.setValue({ x: 0, y: 0 });
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
          { zIndex: MOCK_PROFILES.length - index },
        ]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        {/* Photo - completely hidden until match */}
        <BlurredPhoto
          photoUri={profile.photos[0]}
          messageCount={0} // Always 0 in discover - photos hidden
          showProgress={false}
          showCelebration={false}
          style={styles.cardImageContainer}
          imageStyle={styles.cardImage}
          borderRadius={20}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />

        {/* Like/Nope Labels */}
        {isCurrentCard && (
          <>
            <Animated.View
              style={[styles.labelContainer, styles.likeLabel, { opacity: likeOpacity }]}
            >
              <Text style={styles.labelText}>LIKE</Text>
            </Animated.View>
            <Animated.View
              style={[styles.labelContainer, styles.nopeLabel, { opacity: nopeOpacity }]}
            >
              <Text style={[styles.labelText, { color: '#EF4444' }]}>NOPE</Text>
            </Animated.View>
          </>
        )}

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.name}, {profile.age}
            </Text>
            {profile.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#1D3557" />
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
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
          <View style={styles.availabilityBadge}>
            <Ionicons name="calendar" size={14} color="#10B981" />
            <Text style={styles.availabilityText}>{profile.availability}</Text>
          </View>

          {/* VoiceFirst explanation */}
          <View style={styles.voiceFirstBadge}>
            <Ionicons name="lock-closed" size={14} color="#E63946" />
            <Text style={styles.voiceFirstText}>
              Photo reveals after you match and chat
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>VoiceFirst</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#1D3557" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {currentIndex >= profiles.length ? (
          <View style={styles.noMoreCards}>
            <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
            <Text style={styles.noMoreText}>No more profiles</Text>
            <Text style={styles.noMoreSubtext}>Check back later for new matches!</Text>
          </View>
        ) : (
          profiles.map((profile, index) => renderCard(profile, index)).reverse()
        )}
      </View>

      {currentIndex < profiles.length && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={swipeLeft}
          >
            <Ionicons name="close" size={32} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]}>
            <Ionicons name="star" size={28} color="#F4A261" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={swipeRight}
          >
            <Ionicons name="heart" size={32} color="#10B981" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FAEE',
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
    color: '#E63946',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  cardImageContainer: {
    width: '100%',
    height: '100%',
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
    height: '60%',
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
    borderColor: '#10B981',
    transform: [{ rotate: '15deg' }],
  },
  nopeLabel: {
    left: 20,
    borderColor: '#EF4444',
    transform: [{ rotate: '-15deg' }],
  },
  labelText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
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
    backgroundColor: '#FFFFFF',
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
  bio: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    lineHeight: 22,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
  voiceFirstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  voiceFirstText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#FEE2E2',
  },
  superLikeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
  },
  likeButton: {
    backgroundColor: '#D1FAE5',
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 16,
  },
  noMoreSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
