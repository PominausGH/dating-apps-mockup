import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          IntentMatch collects information you provide directly to us, including:
        </Text>
        <Text style={styles.bulletPoint}>
          • Profile information (name, age, photos, bio)
        </Text>
        <Text style={styles.bulletPoint}>
          • Availability and scheduling preferences
        </Text>
        <Text style={styles.bulletPoint}>
          • Messages and communications with other users
        </Text>
        <Text style={styles.bulletPoint}>
          • Location data (with your permission)
        </Text>
        <Text style={styles.bulletPoint}>
          • Device information and usage data
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide, maintain, and improve our services
        </Text>
        <Text style={styles.bulletPoint}>
          • Match you with compatible users based on availability
        </Text>
        <Text style={styles.bulletPoint}>
          • Facilitate communication between users
        </Text>
        <Text style={styles.bulletPoint}>
          • Send you notifications about matches and messages
        </Text>
        <Text style={styles.bulletPoint}>
          • Protect against fraud and abuse
        </Text>

        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We may share your information in the following circumstances:
        </Text>
        <Text style={styles.bulletPoint}>
          • With other users as part of the matching process
        </Text>
        <Text style={styles.bulletPoint}>
          • With service providers who assist in our operations
        </Text>
        <Text style={styles.bulletPoint}>
          • When required by law or to protect our rights
        </Text>
        <Text style={styles.bulletPoint}>
          • With your consent or at your direction
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect
          your personal information against unauthorized access, alteration,
          disclosure, or destruction. However, no method of transmission over the
          Internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights and Choices</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Access and update your personal information
        </Text>
        <Text style={styles.bulletPoint}>
          • Delete your account and associated data
        </Text>
        <Text style={styles.bulletPoint}>
          • Opt out of promotional communications
        </Text>
        <Text style={styles.bulletPoint}>
          • Control location sharing settings
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your information for as long as your account is active or as
          needed to provide services. You may request deletion of your account at
          any time through the app settings.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          IntentMatch is not intended for users under 18 years of age. We do not
          knowingly collect personal information from children under 18.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you
          of any changes by posting the new policy on this page and updating the
          "Last updated" date.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this privacy policy or our practices, please
          contact us at privacy@intentmatch.app
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.gray[700],
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.gray[700],
    marginLeft: 8,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
