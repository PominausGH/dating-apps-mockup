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

export default function TermsOfServiceScreen() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: January 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using VoiceFirst, you agree to be bound by these Terms
          of Service. If you do not agree to these terms, please do not use our
          service.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 18 years old to use VoiceFirst. By using our
          service, you represent and warrant that you meet this age requirement
          and have the legal capacity to enter into these terms.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Registration</Text>
        <Text style={styles.paragraph}>
          You agree to provide accurate, current, and complete information during
          registration. You are responsible for maintaining the confidentiality of
          your account credentials and for all activities under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Voice Content Guidelines</Text>
        <Text style={styles.paragraph}>
          VoiceFirst is a voice-based dating platform. Your voice recordings must:
        </Text>
        <Text style={styles.bulletPoint}>
          • Be your own authentic voice
        </Text>
        <Text style={styles.bulletPoint}>
          • Not contain hate speech, harassment, or threats
        </Text>
        <Text style={styles.bulletPoint}>
          • Not include sexually explicit content
        </Text>
        <Text style={styles.bulletPoint}>
          • Not advertise products or services
        </Text>
        <Text style={styles.bulletPoint}>
          • Not impersonate another person
        </Text>

        <Text style={styles.sectionTitle}>5. User Conduct</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Use the service for any illegal purpose
        </Text>
        <Text style={styles.bulletPoint}>
          • Harass, abuse, or harm other users
        </Text>
        <Text style={styles.bulletPoint}>
          • Post false or misleading information
        </Text>
        <Text style={styles.bulletPoint}>
          • Share inappropriate voice messages
        </Text>
        <Text style={styles.bulletPoint}>
          • Record or distribute other users' voice content
        </Text>
        <Text style={styles.bulletPoint}>
          • Spam or solicit other users
        </Text>
        <Text style={styles.bulletPoint}>
          • Attempt to circumvent security features
        </Text>

        <Text style={styles.sectionTitle}>6. Progressive Photo Reveal</Text>
        <Text style={styles.paragraph}>
          Photos on VoiceFirst are progressively revealed as conversations
          progress. This feature is designed to encourage meaningful voice-based
          connections before visual judgments. Attempting to circumvent this
          feature is a violation of these terms.
        </Text>

        <Text style={styles.sectionTitle}>7. Content Ownership</Text>
        <Text style={styles.paragraph}>
          You retain ownership of voice recordings and photos you post. By posting
          content, you grant VoiceFirst a non-exclusive, worldwide license to use,
          store, and distribute your content in connection with providing our
          services.
        </Text>

        <Text style={styles.sectionTitle}>8. Privacy of Voice Communications</Text>
        <Text style={styles.paragraph}>
          Voice messages between matched users are private. You agree not to
          record, screenshot, or share other users' voice messages or personal
          information outside the app without their explicit consent.
        </Text>

        <Text style={styles.sectionTitle}>9. Premium Features</Text>
        <Text style={styles.paragraph}>
          Some features may require a subscription or payment. Subscriptions
          automatically renew unless cancelled. Refunds are handled according to
          the app store's policies.
        </Text>

        <Text style={styles.sectionTitle}>10. Termination</Text>
        <Text style={styles.paragraph}>
          We may suspend or terminate your account at any time for violations of
          these terms or for any other reason. You may delete your account at any
          time through the app settings. Upon deletion, your voice recordings will
          be permanently removed.
        </Text>

        <Text style={styles.sectionTitle}>11. Disclaimers</Text>
        <Text style={styles.paragraph}>
          VoiceFirst is provided "as is" without warranties of any kind. We do
          not guarantee matches, compatibility, or the conduct of other users. Use
          the service at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>12. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, VoiceFirst shall not be liable
          for any indirect, incidental, special, or consequential damages arising
          from your use of the service.
        </Text>

        <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these terms from time to time. Continued use of the
          service after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>14. Contact</Text>
        <Text style={styles.paragraph}>
          For questions about these terms, please contact us at legal@voicefirst.app
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
