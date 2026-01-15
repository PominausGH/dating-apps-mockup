/**
 * Example: How to integrate VoiceFirst authentication into your app
 *
 * This file demonstrates various ways to use the authentication system
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AuthProvider,
  useAuth,
  AuthScreen,
  DiscoverScreen,
  MatchesScreen,
  ChatScreen,
  ProfileScreen,
} from 'voicefirst-app';

const Stack = createNativeStackNavigator();

/**
 * Example 1: Basic App Structure with Authentication
 */
export function BasicAuthExample() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show auth screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // If authenticated, show main app
  return (
    <Stack.Navigator>
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="Matches" component={MatchesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

/**
 * Example 2: Protected Route Pattern
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}

export function ProtectedRouteExample() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DiscoverScreen />
      </ProtectedRoute>
    </AuthProvider>
  );
}

/**
 * Example 3: Custom Login Screen
 * Shows how to build your own UI using the auth context
 */
function CustomLoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    try {
      await login({
        emailOrPhone: email,
        password: password,
        rememberMe: true,
      });
      // Navigation handled by app structure
    } catch (err) {
      // Error is available in error state
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Login</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Your custom input components here */}
      <Text>Email: {email}</Text>
      <Text>Password: {password}</Text>

      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}

/**
 * Example 4: Using Auth State in Components
 */
function UserProfileExample() {
  const {
    user,
    isAuthenticated,
    logout,
    enableBiometric,
  } = useAuth();

  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  const handleLogout = async () => {
    await logout();
    // User will be redirected to auth screen by app structure
  };

  const handleEnableBiometric = async () => {
    try {
      await enableBiometric();
      alert('Biometric login enabled!');
    } catch (err) {
      alert('Failed to enable biometric login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text>Email: {user.email}</Text>
      <Text>User ID: {user.id}</Text>
      <Text>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</Text>
      <Text>
        Biometric Enabled: {user.biometricEnabled ? 'Yes' : 'No'}
      </Text>

      {!user.biometricEnabled && (
        <Button
          title="Enable Biometric Login"
          onPress={handleEnableBiometric}
        />
      )}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

/**
 * Example 5: Social Login Integration
 */
function SocialLoginExample() {
  const { socialLogin, isLoading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await socialLogin('google');
    } catch (err) {
      alert('Google login failed');
    }
  };

  const handleAppleLogin = async () => {
    try {
      await socialLogin('apple');
    } catch (err) {
      alert('Apple login failed');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await socialLogin('facebook');
    } catch (err) {
      alert('Facebook login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Login</Text>
      <Button
        title="Continue with Google"
        onPress={handleGoogleLogin}
        disabled={isLoading}
      />
      <Button
        title="Continue with Apple"
        onPress={handleAppleLogin}
        disabled={isLoading}
      />
      <Button
        title="Continue with Facebook"
        onPress={handleFacebookLogin}
        disabled={isLoading}
      />
    </View>
  );
}

/**
 * Example 6: Form Validation Usage
 */
import {
  validateEmail,
  validatePassword,
  checkPasswordStrength,
} from 'voicefirst-app';

function ValidationExample() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const passwordStrength = checkPasswordStrength(password);

    setErrors({
      email: emailError?.message,
      password: passwordError?.message,
    });

    console.log('Password strength:', passwordStrength.label);
    console.log('Password score:', passwordStrength.score);

    return !emailError && !passwordError;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form is valid!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Form Validation</Text>
      <Text>Email: {email}</Text>
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <Text>Password: {password}</Text>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Button title="Validate" onPress={handleSubmit} />
    </View>
  );
}

/**
 * Example 7: Biometric Login Flow
 */
function BiometricLoginExample() {
  const { biometricLogin, isLoading } = useAuth();

  const handleBiometricLogin = async () => {
    try {
      await biometricLogin();
      // Success - user is authenticated
    } catch (err) {
      alert('Biometric authentication failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Login</Text>
      <Button
        title="Login with Face ID / Fingerprint"
        onPress={handleBiometricLogin}
        disabled={isLoading}
      />
    </View>
  );
}

/**
 * Example 8: Complete App with Tab Navigation
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export function CompleteAppExample() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthenticatedApp />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Discover') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#9CA3AF',
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={UserProfileExample} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F1FAEE',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1D3557',
  },
  error: {
    color: '#EF4444',
    marginBottom: 10,
  },
});
