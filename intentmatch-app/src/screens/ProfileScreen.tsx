import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, shadows } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { RootStackParamList } from '../navigation/types';
import EditProfileScreen from './EditProfileScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: string;
  label: string;
  value?: string;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'person-outline', label: 'Edit Profile' },
  { icon: 'images-outline', label: 'Manage Photos' },
  { icon: 'location-outline', label: 'Location', value: 'New York, NY' },
  { icon: 'options-outline', label: 'Preferences' },
  { icon: 'shield-checkmark-outline', label: 'Verification', badge: 'Verified' },
  { icon: 'star-outline', label: 'Upgrade to Premium' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'settings-outline', label: 'Settings' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const { profile, loading, error } = useUserProfile();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'Settings':
        navigation.navigate('AccountSettings');
        break;
      case 'Edit Profile':
        setShowEditProfile(true);
        break;
      default:
        // Other menu items not yet implemented
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>
            {error || 'Failed to load profile'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if profile is incomplete
  const isProfileIncomplete = !profile.name || !profile.age || !profile.bio;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Ionicons name="pencil" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Profile incomplete banner */}
        {isProfileIncomplete && (
          <View style={styles.incompleteBanner}>
            <Ionicons name="information-circle" size={20} color={colors.warning} />
            <Text style={styles.incompleteBannerText}>
              Complete your profile to start matching
            </Text>
          </View>
        )}

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profile.photos[0] || 'https://i.pravatar.cc/200?img=33'
              }}
              style={styles.avatar}
            />
            {profile.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={28} color={colors.secondary} />
              </View>
            )}
          </View>
          <Text style={styles.name}>
            {profile.name || 'Complete Profile'}{profile.age ? `, ${profile.age}` : ''}
          </Text>
          <Text style={styles.occupation}>
            {profile.occupation || 'Add your occupation'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.accountabilityScore}%</Text>
              <Text style={styles.statLabel}>Accountability</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Dates</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>--</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {profile.bio ? (
          <View style={styles.bioCard}>
            <Text style={styles.bioTitle}>About Me</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : (
          <View style={styles.bioCard}>
            <Text style={styles.bioTitle}>About Me</Text>
            <Text style={styles.bioPlaceholder}>
              Tell others about yourself...
            </Text>
          </View>
        )}

        <View style={styles.premiumCard}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumIcon}>
              <Ionicons name="diamond" size={24} color={colors.accent} />
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumSubtitle}>
                See who likes you, unlimited swipes & more
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>$9.99/mo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuPress(item.label)}>
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={colors.secondary}
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

        <Text style={styles.version}>IntentMatch v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <EditProfileScreen onClose={() => setShowEditProfile(false)} />
      </Modal>
    </SafeAreaView>
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  incompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  incompleteBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.warning,
    fontWeight: '600',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
    marginTop: 16,
  },
  occupation: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginTop: 24,
    marginHorizontal: 20,
    padding: 20,
    ...shadows.md,
  },
  statItem: {
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
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
  },
  bioCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    ...shadows.sm,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 15,
    color: colors.gray[600],
    lineHeight: 22,
  },
  bioPlaceholder: {
    fontSize: 15,
    color: colors.gray[400],
    lineHeight: 22,
    fontStyle: 'italic',
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    ...shadows.md,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  premiumButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  premiumButtonText: {
    color: colors.white,
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
    color: colors.secondary,
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
    color: colors.success,
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
