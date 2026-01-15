import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { useUserProfile } from '../hooks/useUserProfile';

interface EditProfileScreenProps {
  onClose: () => void;
}

export default function EditProfileScreen({ onClose }: EditProfileScreenProps) {
  const { profile, updateProfile } = useUserProfile();

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    age: '',
    occupation: '',
    bio: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      age: '',
      occupation: '',
      bio: '',
    };

    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum)) {
      newErrors.age = 'Age is required';
      isValid = false;
    } else if (ageNum < 18) {
      newErrors.age = 'You must be at least 18 years old';
      isValid = false;
    } else if (ageNum > 100) {
      newErrors.age = 'Please enter a valid age';
      isValid = false;
    }

    if (!occupation.trim()) {
      newErrors.occupation = 'Occupation is required';
      isValid = false;
    }

    if (!bio.trim()) {
      newErrors.bio = 'Bio is required';
      isValid = false;
    } else if (bio.length < 20) {
      newErrors.bio = 'Bio must be at least 20 characters';
      isValid = false;
    } else if (bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        name: name.trim(),
        age: parseInt(age),
        occupation: occupation.trim(),
        bio: bio.trim(),
      });

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: onClose,
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Ionicons name="close" size={28} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButton}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your name"
              placeholderTextColor={colors.gray[400]}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="Enter your age"
              placeholderTextColor={colors.gray[400]}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={3}
              editable={!loading}
            />
            {errors.age ? (
              <Text style={styles.errorText}>{errors.age}</Text>
            ) : null}
          </View>

          {/* Occupation */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation *</Text>
            <TextInput
              style={[styles.input, errors.occupation && styles.inputError]}
              placeholder="e.g., Software Engineer, Teacher, Artist"
              placeholderTextColor={colors.gray[400]}
              value={occupation}
              onChangeText={setOccupation}
              editable={!loading}
            />
            {errors.occupation ? (
              <Text style={styles.errorText}>{errors.occupation}</Text>
            ) : null}
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>About Me *</Text>
              <Text style={styles.charCount}>
                {bio.length}/500
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.bioInput,
                errors.bio && styles.inputError,
              ]}
              placeholder="Tell others about yourself, your interests, and what you're looking for..."
              placeholderTextColor={colors.gray[400]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
              editable={!loading}
            />
            {errors.bio ? (
              <Text style={styles.errorText}>{errors.bio}</Text>
            ) : null}
          </View>

          <Text style={styles.helpText}>
            * Required fields. Complete your profile to start matching with others.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  saveButton: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 14,
    color: colors.gray[400],
  },
  input: {
    backgroundColor: colors.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.secondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bioInput: {
    minHeight: 120,
    paddingTop: 14,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 6,
  },
  helpText: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
    marginTop: 8,
  },
});
