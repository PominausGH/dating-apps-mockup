import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, shadows } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: string;
  label: string;
  value?: string;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'mic-outline', label: 'Voice Intros', value: '2 recorded' },
  { icon: 'images-outline', label: 'Photos', value: '4 photos' },
  { icon: 'location-outline', label: 'Location', value: 'New York, NY' },
  { icon: 'options-outline', label: 'Preferences' },
  { icon: 'shield-checkmark-outline', label: 'Voice Verification', badge: 'Verified' },
  { icon: 'star-outline', label: 'Upgrade to Premium' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'settings-outline', label: 'Settings' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();

  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'Settings':
        navigation.navigate('AccountSettings');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={colors.gradient.purple}
            style={styles.avatarContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="person" size={50} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
          <Text style={styles.name}>Alex, 29</Text>
          <View style={styles.verifiedRow}>
            <Ionicons name="mic" size={16} color={colors.secondary} />
            <Text style={styles.verifiedText}>Voice Verified</Text>
          </View>
        </View>

        {/* Voice Stats */}
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Voice Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Photos Unlocked</Text>
          </View>
        </View>

        {/* Voice Intro Preview */}
        <View style={styles.voiceIntroCard}>
          <View style={styles.voiceIntroHeader}>
            <Text style={styles.voiceIntroTitle}>Your Voice Intro</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.voicePlayer}>
            <TouchableOpacity style={styles.miniPlayButton}>
              <LinearGradient
                colors={colors.gradient.primary}
                style={styles.miniPlayGradient}
              >
                <Ionicons name="play" size={16} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceLabel}>Main Intro</Text>
              <Text style={styles.voiceDuration}>0:28</Text>
            </View>
            <View style={styles.waveformMini}>
              {[...Array(15)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBarMini,
                    { height: Math.random() * 16 + 8 },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Premium Card */}
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.premiumCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.premiumContent}>
            <View style={styles.premiumIcon}>
              <Ionicons name="diamond" size={24} color={colors.accent} />
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Unlock Premium</Text>
              <Text style={styles.premiumSubtitle}>
                Unlimited listens, see who liked you & more
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Try Free</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuPress(item.label)}>
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.value && (
                  <Text style={styles.menuValue}>{item.value}</Text>
                )}
                {item.badge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.gray[400]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>VoiceFirst v1.0.0</Text>
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
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.dark,
    marginTop: 16,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginLeft: 6,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    ...shadows.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: 10,
  },
  voiceIntroCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    ...shadows.sm,
  },
  voiceIntroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceIntroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  voicePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 12,
  },
  miniPlayButton: {},
  miniPlayGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceInfo: {
    marginLeft: 12,
  },
  voiceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  voiceDuration: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  waveformMini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  waveBarMini: {
    width: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.5,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumText: {
    marginLeft: 12,
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  premiumButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  premiumButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  menuSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 24,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.dark,
    marginLeft: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 14,
    color: colors.gray[400],
    marginRight: 8,
  },
  menuBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray[400],
    marginBottom: 24,
  },
});
