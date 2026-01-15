import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BlurredPhoto from '../components/BlurredPhoto';
import { getNextMilestone } from '../utils/blurUtils';

const { width } = Dimensions.get('window');

interface Match {
  id: string;
  name: string;
  photo: string;
  messageCount: number;
  lastMessage?: string;
  scheduledDate?: string;
  expiresIn?: string;
  unread: boolean;
}

// Mock data with message counts for progressive reveal
const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    name: 'Sarah',
    photo: 'https://i.pravatar.cc/100?img=1',
    messageCount: 10, // Fully unlocked
    scheduledDate: 'Saturday 7pm @ Blue Bottle Coffee',
    unread: true,
  },
  {
    id: '2',
    name: 'Emma',
    photo: 'https://i.pravatar.cc/100?img=5',
    messageCount: 5, // Partially revealed (20% blur)
    lastMessage: "Can't wait for our date!",
    scheduledDate: 'Sunday 2pm @ Central Park',
    unread: false,
  },
  {
    id: '3',
    name: 'Jessica',
    photo: 'https://i.pravatar.cc/100?img=9',
    messageCount: 2, // Highly blurred (80% blur)
    expiresIn: '18 hours left to schedule',
    unread: true,
  },
  {
    id: '4',
    name: 'Olivia',
    photo: 'https://i.pravatar.cc/100?img=16',
    messageCount: 0, // Completely blurred
    lastMessage: 'Just matched!',
    unread: true,
  },
];

const NEW_MATCHES = [
  {
    id: 'n1',
    name: 'Sophia',
    photo: 'https://i.pravatar.cc/100?img=20',
    messageCount: 0, // New matches start with 0 messages
  },
  {
    id: 'n2',
    name: 'Ava',
    photo: 'https://i.pravatar.cc/100?img=23',
    messageCount: 0,
  },
  {
    id: 'n3',
    name: 'Mia',
    photo: 'https://i.pravatar.cc/100?img=25',
    messageCount: 0,
  },
];

export default function MatchesScreen() {
  const renderNewMatch = ({ item }: { item: typeof NEW_MATCHES[0] }) => (
    <TouchableOpacity style={styles.newMatchItem}>
      <View style={styles.newMatchImageContainer}>
        <BlurredPhoto
          photoUri={item.photo}
          messageCount={item.messageCount}
          showProgress={false}
          showCelebration={false}
          style={styles.newMatchImageWrapper}
          imageStyle={styles.newMatchImage}
          borderRadius={35}
        />
        <View style={styles.newMatchBadge}>
          <Text style={styles.newMatchBadgeText}>NEW</Text>
        </View>
      </View>
      <Text style={styles.newMatchName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderMatch = ({ item }: { item: Match }) => {
    const nextMilestone = getNextMilestone(item.messageCount);

    return (
      <TouchableOpacity style={styles.matchCard}>
        <View style={styles.matchImageWrapper}>
          <BlurredPhoto
            photoUri={item.photo}
            messageCount={item.messageCount}
            showProgress={true}
            showCelebration={false}
            style={styles.matchImageContainer}
            imageStyle={styles.matchImage}
            borderRadius={30}
          />
        </View>
        <View style={styles.matchContent}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchName}>{item.name}</Text>
            {item.unread && <View style={styles.unreadDot} />}
          </View>

          {/* Show unlock progress hint */}
          {nextMilestone && (
            <View style={styles.unlockHintRow}>
              <Ionicons name="lock-open-outline" size={14} color="#9CA3AF" />
              <Text style={styles.unlockHintText}>
                {item.messageCount}/{nextMilestone.count} messages
              </Text>
            </View>
          )}

          {item.scheduledDate && (
            <View style={styles.scheduledRow}>
              <Ionicons name="calendar" size={14} color="#10B981" />
              <Text style={styles.scheduledText}>{item.scheduledDate}</Text>
            </View>
          )}
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
          {item.expiresIn && (
            <View style={styles.expiresRow}>
              <Ionicons name="time-outline" size={14} color="#F59E0B" />
              <Text style={styles.expiresText}>{item.expiresIn}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <View style={styles.matchCount}>
          <Text style={styles.matchCountText}>
            {MOCK_MATCHES.length + NEW_MATCHES.length}
          </Text>
        </View>
      </View>

      {/* Info banner about photo unlocking */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#E63946" />
        <Text style={styles.infoBannerText}>
          Photos unlock as you exchange messages
        </Text>
      </View>

      {NEW_MATCHES.length > 0 && (
        <View style={styles.newMatchesSection}>
          <Text style={styles.sectionTitle}>New Matches</Text>
          <FlatList
            horizontal
            data={NEW_MATCHES}
            renderItem={renderNewMatch}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newMatchesList}
          />
        </View>
      )}

      <View style={styles.messagesSection}>
        <Text style={styles.sectionTitle}>Conversations</Text>
        <FlatList
          data={MOCK_MATCHES}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.matchesList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D3557',
  },
  matchCount: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  matchCountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#E63946',
    fontWeight: '600',
    marginLeft: 8,
  },
  newMatchesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  newMatchesList: {
    paddingHorizontal: 16,
  },
  newMatchItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  newMatchImageContainer: {
    position: 'relative',
  },
  newMatchImageWrapper: {
    width: 70,
    height: 70,
  },
  newMatchImage: {
    width: 70,
    height: 70,
    borderWidth: 3,
    borderColor: '#E63946',
  },
  newMatchBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -18 }],
    backgroundColor: '#E63946',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newMatchBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  newMatchName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#1D3557',
  },
  messagesSection: {
    flex: 1,
  },
  matchesList: {
    paddingHorizontal: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  matchImageWrapper: {
    marginRight: 16,
  },
  matchImageContainer: {
    width: 60,
    height: 60,
  },
  matchImage: {
    width: 60,
    height: 60,
  },
  matchContent: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D3557',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E63946',
    marginLeft: 8,
  },
  unlockHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  unlockHintText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginLeft: 4,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scheduledText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 6,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expiresText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 6,
  },
  separator: {
    height: 12,
  },
});
