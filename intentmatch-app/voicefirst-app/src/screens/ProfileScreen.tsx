import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  photos: string[];
  verified: boolean;
}

interface UserStats {
  totalMatches: number;
  datesScheduled: number;
  datesCompleted: number;
  accountabilityScore: number;
}

interface Settings {
  notifications: {
    matches: boolean;
    messages: boolean;
    dateReminders: boolean;
  };
  distanceRange: number;
  ageRange: {
    min: number;
    max: number;
  };
}

// Mock data
const MOCK_USER_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Alex',
  age: 28,
  occupation: 'Product Designer',
  bio: 'Coffee lover, adventure seeker, and weekend explorer. Looking for genuine connections and meaningful conversations.',
  photos: [
    'https://i.pravatar.cc/400?img=11',
    'https://i.pravatar.cc/400?img=12',
    'https://i.pravatar.cc/400?img=13',
    'https://i.pravatar.cc/400?img=14',
  ],
  verified: true,
};

const MOCK_USER_STATS: UserStats = {
  totalMatches: 24,
  datesScheduled: 8,
  datesCompleted: 6,
  accountabilityScore: 75,
};

const INITIAL_SETTINGS: Settings = {
  notifications: {
    matches: true,
    messages: true,
    dateReminders: true,
  },
  distanceRange: 10,
  ageRange: {
    min: 22,
    max: 35,
  },
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [stats] = useState<UserStats>(MOCK_USER_STATS);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveField = () => {
    if (!editingField) return;

    if (editValue.trim() === '') {
      Alert.alert('Error', 'Field cannot be empty');
      return;
    }

    setProfile((prev) => ({
      ...prev,
      [editingField]: editValue,
    }));
    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleAddPhoto = () => {
    if (profile.photos.length >= 6) {
      Alert.alert('Maximum Photos', 'You can only have up to 6 photos');
      return;
    }

    // Simulate image picker
    Alert.alert(
      'Add Photo',
      'In a real app, this would open the image picker',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Sample',
          onPress: () => {
            const newPhotoId = 20 + profile.photos.length;
            setProfile((prev) => ({
              ...prev,
              photos: [...prev.photos, `https://i.pravatar.cc/400?img=${newPhotoId}`],
            }));
          },
        },
      ]
    );
  };

  const handleRemovePhoto = (index: number) => {
    if (profile.photos.length <= 1) {
      Alert.alert('Error', 'You must have at least one photo');
      return;
    }

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setProfile((prev) => ({
              ...prev,
              photos: prev.photos.filter((_, i) => i !== index),
            }));
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => console.log('Account deleted'),
        },
      ]
    );
  };

  const getAccountabilityColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const renderPhotoGrid = () => {
    const photoSlots = Array.from({ length: 6 }, (_, i) => i);

    return (
      <View style={styles.photoGrid}>
        {photoSlots.map((index) => {
          const photo = profile.photos[index];

          if (photo) {
            return (
              <TouchableOpacity
                key={index}
                style={styles.photoSlot}
                onPress={() => handleRemovePhoto(index)}
              >
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </View>
                {index === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              style={[styles.photoSlot, styles.photoSlotEmpty]}
              onPress={handleAddPhoto}
            >
              <Ionicons name="add" size={32} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderEditableField = (
    label: string,
    field: string,
    value: string,
    icon: string,
    multiline: boolean = false
  ) => {
    const isEditing = editingField === field;

    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldLabelRow}>
            <Ionicons name={icon as any} size={20} color="#E63946" />
            <Text style={styles.fieldLabel}>{label}</Text>
          </View>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditField(field, value)}
            >
              <Ionicons name="pencil" size={18} color="#E63946" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View>
            <TextInput
              style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
              value={editValue}
              onChangeText={setEditValue}
              multiline={multiline}
              numberOfLines={multiline ? 4 : 1}
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveField}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={[styles.fieldValue, multiline && styles.fieldValueMultiline]}>
            {value}
          </Text>
        )}
      </View>
    );
  };

  const renderStatsCard = () => {
    return (
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Your Stats</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="heart" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.totalMatches}</Text>
            <Text style={styles.statLabel}>Total Matches</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.datesScheduled}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.datesCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.accountabilityContainer}>
          <View style={styles.accountabilityHeader}>
            <View style={styles.accountabilityLabelRow}>
              <Ionicons name="shield-checkmark" size={20} color={getAccountabilityColor(stats.accountabilityScore)} />
              <Text style={styles.accountabilityLabel}>Accountability Score</Text>
            </View>
            <Text
              style={[
                styles.accountabilityScore,
                { color: getAccountabilityColor(stats.accountabilityScore) },
              ]}
            >
              {stats.accountabilityScore}%
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${stats.accountabilityScore}%`,
                  backgroundColor: getAccountabilityColor(stats.accountabilityScore),
                },
              ]}
            />
          </View>

          <Text style={styles.accountabilityDescription}>
            Based on showing up to {stats.datesCompleted} out of {stats.datesScheduled} scheduled dates
          </Text>
        </View>
      </View>
    );
  };

  const renderSettingsModal = () => {
    return (
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={28} color="#1D3557" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Notifications */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Notifications</Text>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="heart" size={20} color="#E63946" />
                    <Text style={styles.settingLabel}>New Matches</Text>
                  </View>
                  <Switch
                    value={settings.notifications.matches}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, matches: value },
                      }))
                    }
                    trackColor={{ false: '#D1D5DB', true: '#E63946' }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="chatbubble" size={20} color="#E63946" />
                    <Text style={styles.settingLabel}>Messages</Text>
                  </View>
                  <Switch
                    value={settings.notifications.messages}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, messages: value },
                      }))
                    }
                    trackColor={{ false: '#D1D5DB', true: '#E63946' }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="notifications" size={20} color="#E63946" />
                    <Text style={styles.settingLabel}>Date Reminders</Text>
                  </View>
                  <Switch
                    value={settings.notifications.dateReminders}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, dateReminders: value },
                      }))
                    }
                    trackColor={{ false: '#D1D5DB', true: '#E63946' }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              {/* Discovery Preferences */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Discovery Preferences</Text>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="location" size={20} color="#E63946" />
                    <Text style={styles.settingLabel}>Maximum Distance</Text>
                  </View>
                  <Text style={styles.settingValue}>{settings.distanceRange} mi</Text>
                </View>

                <View style={styles.slider}>
                  <Text style={styles.sliderLabel}>1 mi</Text>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        { width: `${(settings.distanceRange / 50) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.sliderLabel}>50 mi</Text>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="person" size={20} color="#E63946" />
                    <Text style={styles.settingLabel}>Age Range</Text>
                  </View>
                  <Text style={styles.settingValue}>
                    {settings.ageRange.min} - {settings.ageRange.max}
                  </Text>
                </View>

                <View style={styles.ageRangeSliders}>
                  <View style={styles.ageRangeItem}>
                    <Text style={styles.ageRangeLabel}>Min: {settings.ageRange.min}</Text>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          { width: `${((settings.ageRange.min - 18) / 32) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.ageRangeItem}>
                    <Text style={styles.ageRangeLabel}>Max: {settings.ageRange.max}</Text>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          { width: `${((settings.ageRange.max - 18) / 32) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Account Actions */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Account</Text>

                <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#3B82F6" />
                  <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>
                    Logout
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteAccount}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                    Delete Account
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#1D3557" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#E63946', '#F4A261']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.profileHeaderContent}>
            <Image
              source={{ uri: profile.photos[0] }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileNameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {profile.name}, {profile.age}
                </Text>
                {profile.verified && (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                )}
              </View>
              <Text style={styles.profileOccupation}>{profile.occupation}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionSubtitle}>
              {profile.photos.length}/6 photos
            </Text>
          </View>
          {renderPhotoGrid()}
        </View>

        {/* Profile Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          {renderEditableField('Name', 'name', profile.name, 'person-outline')}
          {renderEditableField('Occupation', 'occupation', profile.occupation, 'briefcase-outline')}
          {renderEditableField('Bio', 'bio', profile.bio, 'reader-outline', true)}
        </View>

        {/* Stats Section */}
        {renderStatsCard()}

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>

          <TouchableOpacity
            style={styles.quickSettingButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <View style={styles.quickSettingLeft}>
              <Ionicons name="options-outline" size={20} color="#E63946" />
              <Text style={styles.quickSettingText}>Discovery Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickSettingButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <View style={styles.quickSettingLeft}>
              <Ionicons name="notifications-outline" size={20} color="#E63946" />
              <Text style={styles.quickSettingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderSettingsModal()}
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D3557',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1FAEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileNameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  profileOccupation: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoSlot: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoSlotEmpty: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#E63946',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  editButton: {
    padding: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1D3557',
    lineHeight: 22,
  },
  fieldValueMultiline: {
    lineHeight: 24,
  },
  fieldInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E63946',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1D3557',
  },
  fieldInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#E63946',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsCard: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  accountabilityContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  accountabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountabilityLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountabilityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D3557',
  },
  accountabilityScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  accountabilityDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  quickSettingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickSettingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickSettingText: {
    fontSize: 16,
    color: '#1D3557',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D3557',
  },
  modalScrollView: {
    padding: 20,
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1D3557',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E63946',
  },
  slider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#E63946',
    borderRadius: 3,
  },
  ageRangeSliders: {
    marginTop: 12,
    gap: 16,
  },
  ageRangeItem: {
    gap: 8,
  },
  ageRangeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
