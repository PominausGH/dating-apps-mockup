/**
 * Authentication Context Provider for VoiceFirst app
 * Manages auth state and provides mock authentication functionality
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  AuthContextType,
  AuthState,
  AuthUser,
  LoginCredentials,
  SignUpData,
  SocialProvider,
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const MOCK_USERS: Map<string, { email: string; password: string; user: AuthUser }> = new Map([
  [
    'demo@voicefirst.com',
    {
      email: 'demo@voicefirst.com',
      password: 'Demo123!',
      user: {
        id: '1',
        email: 'demo@voicefirst.com',
        name: 'Demo User',
        emailVerified: true,
        createdAt: new Date('2025-01-01'),
        biometricEnabled: false,
      },
    },
  ],
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    checkStoredSession();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      setBiometricAvailable(false);
    }
  };

  const checkStoredSession = async () => {
    // In real app: check AsyncStorage for stored session
    // For now, we'll just check if remember me was enabled
    setAuthState((prev) => ({ ...prev, isLoading: false }));
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Check if user exists
      const userRecord = MOCK_USERS.get(credentials.emailOrPhone);

      if (!userRecord || userRecord.password !== credentials.password) {
        throw new Error('Invalid email or password');
      }

      setAuthState({
        user: userRecord.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // In real app: store token in AsyncStorage if rememberMe is true
      if (credentials.rememberMe) {
        console.log('Session saved for remember me');
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const signUp = async (data: SignUpData): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Check if user already exists
      if (MOCK_USERS.has(data.email)) {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const newUser: AuthUser = {
        id: Date.now().toString(),
        email: data.email,
        emailVerified: false,
        createdAt: new Date(),
        biometricEnabled: false,
      };

      // Store in mock database
      MOCK_USERS.set(data.email, {
        email: data.email,
        password: data.password,
        user: newUser,
      });

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      throw error;
    }
  };

  const socialLogin = async (provider: SocialProvider): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Simulate social login flow
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const socialUser: AuthUser = {
        id: Date.now().toString(),
        email: `${provider}user@example.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        emailVerified: true,
        createdAt: new Date(),
        biometricEnabled: false,
      };

      setAuthState({
        user: socialUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: `${provider} login failed`,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    // Simulate logout delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Simulate password reset email
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!MOCK_USERS.has(email)) {
      throw new Error('No account found with this email');
    }

    console.log(`Password reset email sent to ${email}`);
  };

  const enableBiometric = async (): Promise<void> => {
    if (!biometricAvailable) {
      throw new Error('Biometric authentication is not available on this device');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Enable biometric login',
      fallbackLabel: 'Use passcode',
    });

    if (result.success && authState.user) {
      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, biometricEnabled: true } : null,
      }));
    } else {
      throw new Error('Biometric authentication failed');
    }
  };

  const biometricLogin = async (): Promise<void> => {
    if (!biometricAvailable) {
      throw new Error('Biometric authentication is not available');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Log in with biometrics',
      fallbackLabel: 'Use password',
    });

    if (result.success) {
      // In real app: retrieve stored credentials and auto-login
      // For demo, use the demo account
      const demoUser = MOCK_USERS.get('demo@voicefirst.com');
      if (demoUser) {
        setAuthState({
          user: demoUser.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    } else {
      throw new Error('Biometric authentication failed');
    }
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signUp,
    logout,
    socialLogin,
    resetPassword,
    enableBiometric,
    biometricLogin,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
