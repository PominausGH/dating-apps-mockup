import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, shadows } from '../theme/colors';
import { useMatches } from '../hooks/useMatches';
import { VoiceMatch, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MatchesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { matches, loading, error, totalCount } = useMatches();

  const handleMatchPress = (match: VoiceMatch) => {
    navigation.navigate('Chat', {
      matchId: match.id,
      matchName: match.name,
    });
  };
  const renderPhotoOrBlur = (match: VoiceMatch) => {
    if (match.photoRevealLevel >= 100 && match.photo) {
      return <Image source={{ uri: match.photo }} style={styles.matchPhoto} />;
    }

    return (
      <LinearGradient
        colors={colors.gradient.purple}
        style={styles.blurredPhoto}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.blurOverlay}>
          <Ionicons name="person" size={24} color="rgba(255,255,255,0.6)" />
        </View>
        <View style={styles.revealProgress}>
          <View
            style={[styles.revealProgressFill, { width: `${match.photoRevealLevel}%` }]}
          />
        </View>
      </LinearGradient>
    );
  };

  const renderMatch = ({ item }: { item: VoiceMatch }) => (
    <TouchableOpacity style={styles.matchCard}>
      <View style={styles.matchPhotoContainer}>
        {renderPhotoOrBlur(item)}
        {item.unread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.matchContent}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>
            {item.name}, {item.age}
          </Text>
          <Text style={styles.matchTime}>{item.timestamp}</Text>
        </View>

        <View style={styles.messageRow}>
          <Ionicons name="mic" size={14} color={colors.primary} />
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastVoiceMessage}
          </Text>
        </View>

        {item.photoRevealLevel < 100 && (
          <View style={styles.unlockHint}>
            <Ionicons name="lock-open-outline" size={12} color={colors.secondary} />
            <Text style={styles.unlockText}>
              {5 - item.voiceMessageCount} more messages to unlock photo
            </Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalCount}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Voice Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Likes</Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
        </View>
        <Text style={styles.infoText}>
          Photos unlock progressively as you exchange voice messages. Keep the conversation going!
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>Keep listening to voice intros to find your match!</Text>
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
    color: colors.dark,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  tabTextActive: {
    color: colors.white,
  },
  tabBadge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    ...shadows.sm,
  },
  infoIconContainer: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 18,
  },
  matchesList: {
    paddingHorizontal: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    ...shadows.sm,
  },
  matchPhotoContainer: {
    position: 'relative',
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  blurredPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blurOverlay: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  revealProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  revealProgressFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  matchContent: {
    flex: 1,
    marginLeft: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.dark,
  },
  matchTime: {
    fontSize: 12,
    color: colors.gray[400],
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: 6,
    flex: 1,
  },
  unlockHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  unlockText: {
    fontSize: 12,
    color: colors.secondary,
    marginLeft: 4,
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
});
