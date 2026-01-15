# VoiceFirst Authentication System

Complete authentication implementation with login, sign up, social login, and biometric authentication.

## Features

### Login Screen
- Email or phone number input
- Password input with show/hide toggle
- "Remember me" checkbox
- "Forgot password" link
- Social login buttons (Google, Apple, Facebook)
- Biometric login option (Face ID/Fingerprint)
- Loading states during authentication
- Error handling with clear messages

### Sign Up Screen
- Email validation
- Password with strength indicator (5 levels: Weak to Very Strong)
- Confirm password with matching validation
- Age verification checkbox (18+)
- Terms of service checkbox
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
- Visual password strength indicator with color-coded bars

### Form Validation
- Real-time email format validation
- Phone number format validation
- Password strength checking
- Password matching validation
- Required field validation
- Clear, user-friendly error messages

### Authentication Context
- React Context API for state management
- Mock authentication (no real backend required)
- Session management
- Biometric authentication support
- Demo credentials: `demo@voicefirst.com` / `Demo123!`

## File Structure

```
voicefirst-app/src/
├── screens/
│   └── AuthScreen.tsx          # Main authentication UI
├── contexts/
│   └── AuthContext.tsx         # Auth state management
├── types/
│   └── auth.ts                 # TypeScript definitions
└── utils/
    └── validation.ts           # Form validation utilities
```

## Usage

### 1. Wrap Your App with AuthProvider

```tsx
import { AuthProvider } from 'voicefirst-app';

function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}
```

### 2. Use the AuthScreen Component

```tsx
import { AuthScreen } from 'voicefirst-app';

function AuthFlow() {
  return <AuthScreen />;
}
```

### 3. Access Auth State in Components

```tsx
import { useAuth } from 'voicefirst-app';

function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.email}!</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

## API Reference

### AuthContext Methods

```typescript
const {
  // State
  user,              // Current authenticated user
  isAuthenticated,   // Boolean authentication status
  isLoading,         // Loading state during auth operations
  error,             // Error message if auth fails

  // Methods
  login,             // Login with email/phone and password
  signUp,            // Create new account
  logout,            // Sign out user
  socialLogin,       // Login with Google/Apple/Facebook
  resetPassword,     // Send password reset email
  enableBiometric,   // Enable biometric authentication
  biometricLogin,    // Login with Face ID/Fingerprint
  clearError,        // Clear error state
} = useAuth();
```

### Login Example

```typescript
const { login, isLoading, error } = useAuth();

const handleLogin = async () => {
  try {
    await login({
      emailOrPhone: 'user@example.com',
      password: 'Password123',
      rememberMe: true,
    });
    // Success - user is now authenticated
  } catch (err) {
    // Error is available in error state
    console.log(error);
  }
};
```

### Sign Up Example

```typescript
const { signUp, isLoading, error } = useAuth();

const handleSignUp = async () => {
  try {
    await signUp({
      email: 'newuser@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
      agreeToTerms: true,
      isOver18: true,
    });
    // Success - user is now authenticated
  } catch (err) {
    // Error is available in error state
    console.log(error);
  }
};
```

### Social Login Example

```typescript
const { socialLogin } = useAuth();

const handleGoogleLogin = async () => {
  try {
    await socialLogin('google');
    // Success - user is now authenticated
  } catch (err) {
    console.error('Google login failed');
  }
};
```

### Biometric Login Example

```typescript
const { biometricLogin, enableBiometric } = useAuth();

// First, enable biometric for the user
const enableBio = async () => {
  try {
    await enableBiometric();
    // Biometric enabled
  } catch (err) {
    console.error('Biometric setup failed');
  }
};

// Then use it for login
const loginWithBio = async () => {
  try {
    await biometricLogin();
    // Success - user is now authenticated
  } catch (err) {
    console.error('Biometric login failed');
  }
};
```

## Types

### AuthUser
```typescript
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  biometricEnabled: boolean;
}
```

### LoginCredentials
```typescript
interface LoginCredentials {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
}
```

### SignUpData
```typescript
interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  isOver18: boolean;
}
```

### PasswordStrength
```typescript
interface PasswordStrength {
  score: number;           // 0-4
  label: string;           // 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'
  color: string;           // Color code for visual indicator
  meetsRequirements: boolean;
}
```

## Validation Utilities

```typescript
import {
  validateEmail,
  validatePhone,
  validateEmailOrPhone,
  validatePassword,
  validateConfirmPassword,
  checkPasswordStrength,
  validateTerms,
  validateAge,
} from 'voicefirst-app';

// Email validation
const emailError = validateEmail('user@example.com');
if (emailError) {
  console.log(emailError.message);
}

// Password strength check
const strength = checkPasswordStrength('MyPassword123');
console.log(strength.label); // 'Strong'
console.log(strength.score); // 4
```

## Mock Data

The authentication system includes mock data for testing:

### Demo Account
- Email: `demo@voicefirst.com`
- Password: `Demo123!`

You can create new accounts through the sign up flow. They will be stored in memory for the session.

## Design

### Color Scheme
- Primary: `#E63946` (Red gradient)
- Secondary: `#F4A261` (Orange gradient)
- Background: `#F1FAEE` with `#A8DADC` gradient
- Success: `#10B981` (Green)
- Error: `#EF4444` (Red)
- Text: `#1D3557` (Dark blue)

### Features
- Beautiful gradient backgrounds matching VoiceFirst theme
- Smooth tab transitions with animations
- Visual password strength indicator
- Clear error messages with icons
- Loading states for all async operations
- Responsive layout that works on all screen sizes
- Keyboard-aware scrolling

## Dependencies

Required peer dependencies:
- `expo-local-authentication` - For biometric login
- `expo-linear-gradient` - For gradient UI
- `@expo/vector-icons` - For icons
- `react-native-safe-area-context` - For safe area handling

## Next Steps

To integrate with a real backend:

1. Replace mock functions in `AuthContext.tsx` with actual API calls
2. Add token storage using `@react-native-async-storage/async-storage`
3. Implement proper session management
4. Add email verification flow
5. Implement real password reset functionality
6. Add OAuth configuration for social logins

## Security Notes

This is a **mock implementation** for demonstration purposes:
- Passwords are not encrypted
- No token-based authentication
- Data is stored in memory only
- Social login is simulated

For production use, you must:
- Use HTTPS for all API calls
- Implement proper password hashing
- Use secure token storage
- Add CSRF protection
- Implement rate limiting
- Add proper session management
- Follow OAuth 2.0 best practices for social login
