/**
 * ProfileScreen Example Integration
 *
 * This file demonstrates how to integrate the ProfileScreen
 * into a React Navigation setup with bottom tabs.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import {
  ProfileScreen,
  DiscoverScreen,
  MatchesScreen,
  ChatScreen,
} from './src';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#E63946',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Discover':
                iconName = focused ? 'flame' : 'flame-outline';
                break;
              case 'Matches':
                iconName = focused ? 'heart' : 'heart-outline';
                break;
              case 'Chat':
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{ tabBarLabel: 'Discover' }}
        />
        <Tab.Screen
          name="Matches"
          component={MatchesScreen}
          options={{ tabBarLabel: 'Matches' }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{ tabBarLabel: 'Chat' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

/**
 * ALTERNATIVE: Stack Navigator Integration
 *
 * If you're using a stack navigator instead of tabs:
 */

/*
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Discover" component={DiscoverScreen} />
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
*/

/**
 * STANDALONE USAGE
 *
 * To use ProfileScreen as a standalone component:
 */

/*
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileScreen } from './src';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileScreen />
    </SafeAreaProvider>
  );
}
*/

/**
 * WITH AUTHENTICATION CONTEXT
 *
 * If you have authentication, you might want to pass user data as props:
 */

/*
import { useState, useEffect } from 'react';

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from your API
    fetchUserProfile().then(setUserData);
  }, []);

  if (!userData) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        {/* ... other screens ... }
        <Tab.Screen name="Profile">
          {() => <ProfileScreen userData={userData} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
*/
