/**
 * Authentication type definitions for VoiceFirst app
 */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  biometricEnabled: boolean;
}

export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  isOver18: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: SocialProvider) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  enableBiometric: () => Promise<void>;
  biometricLogin: () => Promise<void>;
  clearError: () => void;
}

export type SocialProvider = 'google' | 'apple' | 'facebook';

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  meetsRequirements: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}
