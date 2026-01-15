import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import OnboardingScreen from '../screens/OnboardingScreen';
import { hasCompletedOnboarding } from '../utils/storageUtils';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that checks onboarding status and shows
 * onboarding screen if user hasn't completed it yet
 */
export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const completed = await hasCompletedOnboarding();
    setShowOnboarding(!completed);
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1FAEE',
  },
});
