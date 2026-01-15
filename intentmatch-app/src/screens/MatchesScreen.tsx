import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, shadows } from '../theme/colors';
import { useMatches, MatchData, NewMatchData } from '../hooks/useMatches';

export default function MatchesScreen() {
  const navigation = useNavigation();
  const { matches, newMatches, loading, error, totalCount } = useMatches();

  const handleMatchPress = (match: MatchData | NewMatchData) => {
    (navigation as any).navigate('Chat', {
      matchId: match.id,
      matchName: match.name,
    });
  };

  const renderNewMatch = ({ item }: { item: NewMatchData }) => (
    <TouchableOpacity style={styles.newMatchItem} onPress={() => handleMatchPress(item)}>
      <View style={styles.newMatchImageContainer}>
        <Image source={{ uri: item.photo }} style={styles.newMatchImage} />
        <View style={styles.newMatchBadge}>
          <Text style={styles.newMatchBadgeText}>NEW</Text>
        </View>
      </View>
      <Text style={styles.newMatchName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderMatch = ({ item }: { item: MatchData }) => (
    <TouchableOpacity style={styles.matchCard} onPress={() => handleMatchPress(item)}>
      <Image source={{ uri: item.photo }} style={styles.matchImage} />
      <View style={styles.matchContent}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{item.name}</Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        {item.scheduledDate && (
          <View style={styles.scheduledRow}>
            <Ionicons name="calendar" size={14} color={colors.success} />
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
            <Ionicons name="time-outline" size={14} color={colors.warning} />
            <Text style={styles.expiresText}>{item.expiresIn}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={styles.errorText}>Failed to load matches</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (totalCount === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>Keep swiping to find your perfect match!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <View style={styles.matchCount}>
          <Text style={styles.matchCountText}>{totalCount}</Text>
        </View>
      </View>

      {newMatches.length > 0 && (
        <View style={styles.newMatchesSection}>
          <Text style={styles.sectionTitle}>New Matches</Text>
          <FlatList
            horizontal
            data={newMatches}
            renderItem={renderNewMatch}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newMatchesList}
          />
        </View>
      )}

      <View style={styles.messagesSection}>
        <Text style={styles.sectionTitle}>Conversations</Text>
        {matches.length === 0 ? (
          <View style={styles.noConversationsContainer}>
            <Ionicons name="chatbubble-outline" size={40} color={colors.gray[300]} />
            <Text style={styles.noConversationsText}>No conversations yet</Text>
            <Text style={styles.noConversationsSubtext}>
              Tap on a new match to start chatting!
            </Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatch}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.matchesList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
  },
  matchCount: {
    marginLeft: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchCountText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  newMatchesSection: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  newMatchesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  newMatchItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  newMatchImageContainer: {
    position: 'relative',
  },
  newMatchImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  newMatchBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newMatchBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
  },
  newMatchName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: 6,
  },
  messagesSection: {
    flex: 1,
    paddingTop: 12,
  },
  matchesList: {
    paddingHorizontal: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    ...shadows.sm,
  },
  matchImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  matchContent: {
    flex: 1,
    marginLeft: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  scheduledText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  expiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  expiresText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
  noConversationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  noConversationsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  noConversationsSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
