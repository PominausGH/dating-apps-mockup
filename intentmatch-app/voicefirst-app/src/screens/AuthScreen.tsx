/**
 * Authentication Screen for VoiceFirst app
 * Features login and sign up with beautiful UI matching VoiceFirst theme
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials, SignUpData } from '../types/auth';
import {
  validateEmailOrPhone,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  checkPasswordStrength,
  validateTerms,
  validateAge,
} from '../utils/validation';

type TabType = 'login' | 'signup';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: TabType) => {
    Animated.spring(slideAnim, {
      toValue: tab === 'login' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setActiveTab(tab);
  };

  const tabIndicatorPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F1FAEE', '#A8DADC', '#F1FAEE']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#E63946', '#F4A261']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="mic" size={40} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.logoText}>VoiceFirst</Text>
              <Text style={styles.tagline}>Connect through conversation</Text>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <View style={styles.tabButtonsContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'login' && styles.tabButtonActive]}
                  onPress={() => handleTabChange('login')}
                >
                  <Text
                    style={[styles.tabButtonText, activeTab === 'login' && styles.tabButtonTextActive]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'signup' && styles.tabButtonActive]}
                  onPress={() => handleTabChange('signup')}
                >
                  <Text
                    style={[styles.tabButtonText, activeTab === 'signup' && styles.tabButtonTextActive]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    transform: [{ translateX: tabIndicatorPosition }],
                  },
                ]}
              />
            </View>

            {/* Form Content */}
            <View style={styles.formContainer}>
              {activeTab === 'login' ? <LoginForm /> : <SignUpForm />}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function LoginForm() {
  const { login, socialLogin, biometricLogin, isLoading, error, clearError } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    clearError();
    setFieldErrors({});

    // Validate
    const emailError = validateEmailOrPhone(emailOrPhone);
    const passwordError = !password ? { field: 'password', message: 'Password is required' } : null;

    const errors: Record<string, string> = {};
    if (emailError) errors[emailError.field] = emailError.message;
    if (passwordError) errors[passwordError.field] = passwordError.message;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const credentials: LoginCredentials = {
        emailOrPhone,
        password,
        rememberMe,
      };
      await login(credentials);
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    clearError();
    try {
      await socialLogin(provider);
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleBiometricLogin = async () => {
    clearError();
    try {
      await biometricLogin();
    } catch (err) {
      Alert.alert('Biometric Login Failed', err instanceof Error ? err.message : 'Please try again');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset functionality would send an email to reset your password.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.form}>
      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Demo Credentials Hint */}
      <View style={styles.hintBanner}>
        <Ionicons name="information-circle" size={20} color="#1D3557" />
        <Text style={styles.hintText}>Demo: demo@voicefirst.com / Demo123!</Text>
      </View>

      {/* Email/Phone Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="mail-outline" size={20} color="#1D3557" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Email or phone number"
          placeholderTextColor="#9CA3AF"
          value={emailOrPhone}
          onChangeText={(text) => {
            setEmailOrPhone(text);
            if (fieldErrors.emailOrPhone) {
              setFieldErrors((prev) => ({ ...prev, emailOrPhone: '' }));
            }
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>
      {fieldErrors.emailOrPhone && (
        <Text style={styles.fieldError}>{fieldErrors.emailOrPhone}</Text>
      )}

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#1D3557" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: '' }));
            }
          }}
          secureTextEntry={!showPassword}
          autoComplete="password"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#1D3557"
          />
        </TouchableOpacity>
      </View>
      {fieldErrors.password && <Text style={styles.fieldError}>{fieldErrors.password}</Text>}

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#E63946', '#F4A261']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Biometric Login */}
      <TouchableOpacity
        style={styles.biometricButton}
        onPress={handleBiometricLogin}
        disabled={isLoading}
      >
        <Ionicons name="finger-print" size={24} color="#E63946" />
        <Text style={styles.biometricText}>Login with biometrics</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Buttons */}
      <View style={styles.socialButtons}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('google')}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={24} color="#EA4335" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('apple')}
          disabled={isLoading}
        >
          <Ionicons name="logo-apple" size={24} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('facebook')}
          disabled={isLoading}
        >
          <Ionicons name="logo-facebook" size={24} color="#1877F2" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SignUpForm() {
  const { signUp, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength = checkPasswordStrength(password);

  const handleSignUp = async () => {
    clearError();
    setFieldErrors({});

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    const termsError = validateTerms(agreeToTerms);
    const ageError = validateAge(isOver18);

    const errors: Record<string, string> = {};
    if (emailError) errors[emailError.field] = emailError.message;
    if (passwordError) errors[passwordError.field] = passwordError.message;
    if (confirmPasswordError) errors[confirmPasswordError.field] = confirmPasswordError.message;
    if (termsError) errors[termsError.field] = termsError.message;
    if (ageError) errors[ageError.field] = ageError.message;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const data: SignUpData = {
        email,
        password,
        confirmPassword,
        agreeToTerms,
        isOver18,
      };
      await signUp(data);
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <View style={styles.form}>
      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="mail-outline" size={20} color="#1D3557" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: '' }));
            }
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>
      {fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#1D3557" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: '' }));
            }
          }}
          secureTextEntry={!showPassword}
          autoComplete="password-new"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#1D3557"
          />
        </TouchableOpacity>
      </View>

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <View style={styles.strengthBarContainer}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View
                key={index}
                style={[
                  styles.strengthBar,
                  index < passwordStrength.score && {
                    backgroundColor: passwordStrength.color,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
            {passwordStrength.label}
          </Text>
        </View>
      )}
      {fieldErrors.password && <Text style={styles.fieldError}>{fieldErrors.password}</Text>}

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#1D3557" />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }
          }}
          secureTextEntry={!showConfirmPassword}
          autoComplete="password-new"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#1D3557"
          />
        </TouchableOpacity>
      </View>
      {fieldErrors.confirmPassword && (
        <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
      )}

      {/* Age Verification */}
      <TouchableOpacity
        style={[styles.checkboxRow, fieldErrors.age && styles.checkboxRowError]}
        onPress={() => {
          setIsOver18(!isOver18);
          if (fieldErrors.age) {
            setFieldErrors((prev) => ({ ...prev, age: '' }));
          }
        }}
      >
        <View style={[styles.checkbox, isOver18 && styles.checkboxChecked]}>
          {isOver18 && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <Text style={styles.checkboxLabel}>I am 18 years or older</Text>
      </TouchableOpacity>
      {fieldErrors.age && <Text style={styles.fieldError}>{fieldErrors.age}</Text>}

      {/* Terms of Service */}
      <TouchableOpacity
        style={[styles.checkboxRow, fieldErrors.terms && styles.checkboxRowError]}
        onPress={() => {
          setAgreeToTerms(!agreeToTerms);
          if (fieldErrors.terms) {
            setFieldErrors((prev) => ({ ...prev, terms: '' }));
          }
        }}
      >
        <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
          {agreeToTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <Text style={styles.checkboxLabel}>
          I agree to the{' '}
          <Text style={styles.linkText}>Terms of Service</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>
      {fieldErrors.terms && <Text style={styles.fieldError}>{fieldErrors.terms}</Text>}

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#E63946', '#F4A261']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E63946',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#1D3557',
    opacity: 0.7,
  },
  tabContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    position: 'relative',
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#E63946',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: '48%',
    height: '87%',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    zIndex: -1,
  },
  formContainer: {
    marginHorizontal: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  hintText: {
    color: '#1D3557',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  passwordToggle: {
    padding: 8,
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#E63946',
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 20,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E63946',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkboxRowError: {
    opacity: 0.7,
  },
  linkText: {
    color: '#E63946',
    fontWeight: '600',
  },
  passwordStrengthContainer: {
    marginBottom: 12,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
