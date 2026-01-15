# Dating Apps Mockup

Two innovative dating apps built with React Native and Expo.

## Apps

### IntentMatch
A dating app focused on scheduling real dates rather than endless messaging.
- Availability-based matching
- 24-hour chat windows
- Venue suggestions
- Accountability scoring

### VoiceFirst
A voice-first dating app where you connect through voice before photos.
- Voice intro recording (5-30 seconds)
- Progressive photo reveal
- Voice messaging
- Voice verification

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation 7
- **Styling**: React Native StyleSheet
- **State**: React Context + Hooks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Firebase project(s)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd dating-apps-mockup

# IntentMatch
cd intentmatch-app
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npx expo start

# VoiceFirst
cd ../voicefirst-app
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npx expo start
```

### Firebase Setup

Each app needs its own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** > Email/Password
4. Create **Firestore Database**
5. Create **Storage** bucket
6. Add a Web app and copy credentials to `.env`

## Development

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# TypeScript check
npx tsc --noEmit
```

## Building for Production

### Configure EAS

```bash
# Login to Expo
eas login

# Configure project (creates eas.json)
eas build:configure

# Link to EAS project
eas init
```

### Build

```bash
# Preview build (internal testing)
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production
```

### Submit to Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## Project Structure

```
intentmatch-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   ├── services/       # Firebase services
│   ├── theme/          # Colors and styling
│   └── types/          # TypeScript types
├── assets/             # Images, icons, fonts
├── App.tsx             # App entry point
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
└── firebaseConfig.ts   # Firebase initialization

voicefirst-app/
└── (same structure)
```

## App Store Checklist

- [ ] Custom app icons (1024x1024)
- [ ] Splash screen images
- [ ] Screenshots for all device sizes
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] Support contact email
- [ ] App description and keywords
- [ ] Age rating questionnaire

See `APP_STORE_LISTING.md` in each app folder for store metadata.

## Security Notes

- Never commit `.env` files
- Rotate Firebase API keys if exposed
- Use Firebase Security Rules in production
- Enable App Check for API protection

## License

Private - All rights reserved
