import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack includes Auth screens and Main tabs
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Chat: { matchId: string; matchName?: string };
  DateFeedback: { matchId: string; scheduledDateId: string };
  MatchConfirmation: { matchId: string };
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  AccountSettings: undefined;
};

// Main tab screens
export type MainTabParamList = {
  Discover: undefined;
  Matches: undefined;
  Schedule: undefined;
  Profile: undefined;
};

// Type helpers for screens
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Declare global types for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
