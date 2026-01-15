import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { reportUser, blockUser } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

interface ReportBlockModalProps {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
  onBlockComplete?: () => void;
}

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'fake', label: 'Fake profile or scam' },
  { id: 'spam', label: 'Spam or solicitation' },
  { id: 'underage', label: 'User appears underage' },
  { id: 'other', label: 'Other' },
];

export default function ReportBlockModal({
  visible,
  onClose,
  targetUserId,
  targetUserName,
  onBlockComplete,
}: ReportBlockModalProps) {
  const { currentUser } = useAuth();
  const [mode, setMode] = useState<'menu' | 'report' | 'block'>('menu');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setMode('menu');
    setSelectedReason(null);
    setDescription('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleReport = async () => {
    if (!currentUser || !selectedReason) return;

    setIsSubmitting(true);
    try {
      await reportUser(currentUser.uid, targetUserId, selectedReason, description);
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe. We will review this report.',
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      await blockUser(currentUser.uid, targetUserId);
      Alert.alert(
        'User Blocked',
        `${targetUserName || 'This user'} has been blocked. You will no longer see each other.`,
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onBlockComplete?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to block user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportAndBlock = async () => {
    if (!currentUser || !selectedReason) return;

    setIsSubmitting(true);
    try {
      await reportUser(currentUser.uid, targetUserId, selectedReason, description);
      await blockUser(currentUser.uid, targetUserId);
      Alert.alert(
        'Report Submitted & User Blocked',
        'Thank you for your report. This user has been blocked.',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onBlockComplete?.();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete action. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>What would you like to do?</Text>

      <TouchableOpacity
        style={styles.menuOption}
        onPress={() => setMode('report')}
      >
        <View style={styles.menuOptionIcon}>
          <Ionicons name="flag-outline" size={24} color={colors.warning} />
        </View>
        <View style={styles.menuOptionContent}>
          <Text style={styles.menuOptionTitle}>Report</Text>
          <Text style={styles.menuOptionDescription}>
            Report inappropriate behavior or content
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuOption}
        onPress={() => setMode('block')}
      >
        <View style={styles.menuOptionIcon}>
          <Ionicons name="ban-outline" size={24} color={colors.error} />
        </View>
        <View style={styles.menuOptionContent}>
          <Text style={styles.menuOptionTitle}>Block</Text>
          <Text style={styles.menuOptionDescription}>
            Stop this person from contacting you
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
    </View>
  );

  const renderReport = () => (
    <ScrollView style={styles.reportContainer}>
      <Text style={styles.title}>Report {targetUserName || 'User'}</Text>
      <Text style={styles.subtitle}>
        Why are you reporting this user?
      </Text>

      {REPORT_REASONS.map((reason) => (
        <TouchableOpacity
          key={reason.id}
          style={[
            styles.reasonOption,
            selectedReason === reason.id && styles.reasonOptionSelected,
          ]}
          onPress={() => setSelectedReason(reason.id)}
        >
          <View
            style={[
              styles.radioButton,
              selectedReason === reason.id && styles.radioButtonSelected,
            ]}
          >
            {selectedReason === reason.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
          <Text style={styles.reasonText}>{reason.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.inputLabel}>Additional details (optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Provide more context about your report..."
        placeholderTextColor={colors.gray[400]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.reportButton]}
          onPress={handleReport}
          disabled={!selectedReason || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.actionButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.reportBlockButton]}
          onPress={handleReportAndBlock}
          disabled={!selectedReason || isSubmitting}
        >
          <Text style={styles.reportBlockButtonText}>Report & Block</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBlock = () => (
    <View style={styles.blockContainer}>
      <View style={styles.blockIconContainer}>
        <Ionicons name="ban" size={48} color={colors.error} />
      </View>

      <Text style={styles.title}>Block {targetUserName || 'User'}?</Text>
      <Text style={styles.blockDescription}>
        Blocking this user will:
      </Text>

      <View style={styles.blockInfo}>
        <View style={styles.blockInfoItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
          <Text style={styles.blockInfoText}>
            Remove them from your matches
          </Text>
        </View>
        <View style={styles.blockInfoItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
          <Text style={styles.blockInfoText}>
            Prevent them from messaging you
          </Text>
        </View>
        <View style={styles.blockInfoItem}>
          <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
          <Text style={styles.blockInfoText}>
            Hide you from each other
          </Text>
        </View>
      </View>

      <Text style={styles.blockNote}>
        They won't be notified that you blocked them.
      </Text>

      <TouchableOpacity
        style={[styles.actionButton, styles.blockButton]}
        onPress={handleBlock}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.actionButtonText}>Block User</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          {mode !== 'menu' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMode('menu')}
            >
              <Ionicons name="arrow-back" size={24} color={colors.dark} />
            </TouchableOpacity>
          )}
          <View style={styles.headerSpacer} />
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.dark} />
          </TouchableOpacity>
        </View>

        {mode === 'menu' && renderMenu()}
        {mode === 'report' && renderReport()}
        {mode === 'block' && renderBlock()}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray[600],
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.light,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuOptionContent: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 4,
  },
  menuOptionDescription: {
    fontSize: 13,
    color: colors.gray[500],
  },
  reportContainer: {
    padding: 20,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.light,
    borderRadius: 10,
    marginBottom: 8,
  },
  reasonOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray[400],
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  reasonText: {
    fontSize: 15,
    color: colors.dark,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 20,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.light,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.dark,
    minHeight: 100,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: colors.warning,
  },
  blockButton: {
    backgroundColor: colors.error,
  },
  reportBlockButton: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  reportBlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  blockContainer: {
    padding: 20,
    alignItems: 'center',
  },
  blockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  blockDescription: {
    fontSize: 15,
    color: colors.gray[600],
    marginBottom: 16,
  },
  blockInfo: {
    width: '100%',
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  blockInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  blockInfoText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 12,
    flex: 1,
  },
  blockNote: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
  },
});
