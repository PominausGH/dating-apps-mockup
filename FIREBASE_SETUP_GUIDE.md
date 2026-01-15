# Firebase Setup Guide for IntentMatch & VoiceFirst

This guide walks you through setting up Firebase for both dating apps from scratch.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Firebase Console Setup](#firebase-console-setup)
- [Environment Configuration](#environment-configuration)
- [Firestore Database Setup](#firestore-database-setup)
- [Firebase Storage Setup](#firebase-storage-setup)
- [Firebase Authentication Setup](#firebase-authentication-setup)
- [Security Rules Deployment](#security-rules-deployment)
- [Testing the Setup](#testing-the-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

1. A Google account
2. Node.js installed (v16 or higher)
3. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```
4. Both apps' dependencies installed:
   ```bash
   cd intentmatch-app && npm install
   cd ../voicefirst-app && npm install
   ```

---

## Firebase Console Setup

### 1. Create Firebase Projects

#### For IntentMatch:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `intentmatch` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Choose analytics account or create new one
6. Click **"Create project"**

#### For VoiceFirst:

1. In Firebase Console, click **"Add project"** again
2. Enter project name: `voicefirst`
3. Enable Google Analytics (optional)
4. Click **"Create project"**

### 2. Register Your Apps

#### For IntentMatch:

1. In your IntentMatch project, click the **</>** (web) icon
2. Enter app nickname: `IntentMatch Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object
6. Click **"Continue to console"**

#### For VoiceFirst:

1. In your VoiceFirst project, click the **</>** (web) icon
2. Enter app nickname: `VoiceFirst Web`
3. Click **"Register app"**
4. Copy the `firebaseConfig` object
5. Click **"Continue to console"**

---

## Environment Configuration

### 1. Create .env Files

#### For IntentMatch:

```bash
cd intentmatch-app
cp .env.example .env
```

Edit `intentmatch-app/.env`:

```env
# Firebase Configuration (from Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=intentmatch.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=intentmatch
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=intentmatch.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Places API (for venue suggestions)
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000

# Push Notifications (Expo)
EXPO_PUBLIC_PUSH_NOTIFICATION_KEY=your_expo_push_key_here

# Stripe (for premium features)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
```

#### For VoiceFirst:

```bash
cd voicefirst-app
cp .env.example .env
```

Edit `voicefirst-app/.env`:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=voicefirst.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=voicefirst
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=voicefirst.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000

# Push Notifications
EXPO_PUBLIC_PUSH_NOTIFICATION_KEY=your_expo_push_key_here

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX

# Voice Recording Settings
EXPO_PUBLIC_MAX_VOICE_DURATION=30
EXPO_PUBLIC_MIN_VOICE_DURATION=5
```

### 2. Verify Configuration

Make sure your `firebaseConfig.ts` files are reading from environment variables correctly. They should already be set up from the initial Firebase configuration we created.

---

## Firestore Database Setup

### 1. Create Firestore Database

#### For Both Projects:

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll deploy security rules next)
4. Select a location:
   - For US: `us-central1` (recommended)
   - For Europe: `europe-west1`
   - For Asia: `asia-southeast1`
5. Click **"Enable"**

### 2. Create Indexes

#### For IntentMatch:

Go to Firestore → Indexes → Composite tab, create these indexes:

1. **Users Discovery Index**
   - Collection: `users`
   - Fields: `isActive` (Ascending), `age` (Ascending), `createdAt` (Descending)

2. **Matches Index**
   - Collection: `matches`
   - Fields: `user1Id` (Ascending), `status` (Ascending), `matchedAt` (Descending)

3. **Matches Index (User 2)**
   - Collection: `matches`
   - Fields: `user2Id` (Ascending), `status` (Ascending), `matchedAt` (Descending)

4. **Messages Index**
   - Collection: `messages`
   - Fields: `matchId` (Ascending), `timestamp` (Ascending)

#### For VoiceFirst:

Create the same indexes as IntentMatch, plus:

5. **Voice Playback Stats Index**
   - Collection: `voicePlaybackStats`
   - Fields: `voiceOwnerId` (Ascending), `timestamp` (Descending)

6. **Swipes Index**
   - Collection: `swipes`
   - Fields: `userId` (Ascending), `listenedFully` (Ascending)

### 3. Seed Initial Data (Optional)

#### Voice Prompts for VoiceFirst:

You can manually add some voice prompts in Firestore Console:

1. Go to Firestore Data
2. Create collection: `voicePrompts`
3. Add documents with these fields:
   ```json
   {
     "text": "Tell me about your dream vacation",
     "category": "fun",
     "difficulty": "easy",
     "isActive": true,
     "popularityScore": 0
   }
   ```

---

## Firebase Storage Setup

### 1. Enable Firebase Storage

#### For Both Projects:

1. In Firebase Console, go to **Storage**
2. Click **"Get started"**
3. Choose **"Start in production mode"** (we'll deploy security rules next)
4. Keep the default bucket location (should match Firestore)
5. Click **"Done"**

### 2. Verify Bucket Names

Make sure your `.env` files have the correct storage bucket URLs:
- IntentMatch: `intentmatch.appspot.com`
- VoiceFirst: `voicefirst.appspot.com`

---

## Firebase Authentication Setup

### 1. Enable Authentication Methods

#### For Both Projects:

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on Email/Password
   - Toggle "Enable"
   - Click "Save"

### 2. Enable Additional Providers (Optional)

For production, you may want to enable:

#### Google Sign-In:
1. Click on "Google"
2. Toggle "Enable"
3. Enter project support email
4. Click "Save"

#### Apple Sign-In (for iOS):
1. Click on "Apple"
2. Toggle "Enable"
3. Follow Apple's setup instructions
4. Click "Save"

#### Facebook Sign-In:
1. Click on "Facebook"
2. Toggle "Enable"
3. Enter Facebook App ID and App Secret
4. Add OAuth redirect URI to Facebook app
5. Click "Save"

### 3. Configure Authorized Domains

1. In Authentication → Settings → Authorized domains
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (when deploying)

---

## Security Rules Deployment

### Method 1: Using Firebase Console

#### For IntentMatch:

1. **Firestore Rules:**
   - Go to Firestore Database → Rules
   - Copy content from `intentmatch-app/firestore.rules`
   - Paste into editor
   - Click **"Publish"**

2. **Storage Rules:**
   - Go to Storage → Rules
   - Copy content from `intentmatch-app/storage.rules`
   - Paste into editor
   - Click **"Publish"**

#### For VoiceFirst:

1. **Firestore Rules:**
   - Go to Firestore Database → Rules
   - Copy content from `voicefirst-app/firestore.rules`
   - Paste into editor
   - Click **"Publish"**

2. **Storage Rules:**
   - Go to Storage → Rules
   - Copy content from `voicefirst-app/storage.rules`
   - Paste into editor
   - Click **"Publish"**

### Method 2: Using Firebase CLI

#### Setup Firebase CLI:

```bash
# Login to Firebase
firebase login

# Initialize Firebase in IntentMatch
cd intentmatch-app
firebase init

# Select:
# - Firestore
# - Storage
# - Use existing project: intentmatch
# - Accept default filenames (firestore.rules, storage.rules)
# - Don't overwrite existing rules files

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

Repeat for VoiceFirst:

```bash
cd ../voicefirst-app
firebase init
# Select voicefirst project
firebase deploy --only firestore:rules,storage:rules
```

---

## Testing the Setup

### 1. Test Authentication

```bash
cd intentmatch-app
npm start
```

In the app:
1. Navigate to authentication screen
2. Try signing up with email/password
3. Check Firebase Console → Authentication → Users
4. Verify user was created

### 2. Test Firestore

After signing up:
1. Check Firestore Database → Data
2. Look for `users` collection
3. Verify your user document was created
4. Check that fields match the schema

### 3. Test Storage (VoiceFirst)

In VoiceFirst app:
1. Complete onboarding
2. Record a voice intro
3. Check Firebase Storage → Files
4. Look for `users/{userId}/voiceIntros/`
5. Verify audio file was uploaded

### 4. Test Real-time Features

1. Create two test accounts
2. Match them together
3. Send messages
4. Verify messages appear in real-time
5. Check Firestore for `messages` collection

---

## Troubleshooting

### Common Issues

#### 1. "Firebase not initialized" Error

**Solution:**
- Verify `.env` file exists and has all required variables
- Restart the Expo development server
- Check that environment variables start with `EXPO_PUBLIC_`

#### 2. Permission Denied Errors

**Solution:**
- Verify security rules are deployed
- Check that user is authenticated
- Review rules in Firebase Console → Firestore/Storage → Rules

#### 3. CORS Errors

**Solution:**
- Add your domain to authorized domains in Authentication settings
- For local development, make sure `localhost` is authorized

#### 4. Storage Upload Fails

**Solution:**
- Check file size limits in storage.rules
- Verify correct content type
- Check Storage bucket permissions

#### 5. Missing Indexes Error

**Solution:**
- Click the link in the error message
- Firebase will auto-generate the index
- Wait 1-2 minutes for index to build

### Testing Security Rules

Use the Rules Playground in Firebase Console:

1. Go to Firestore/Storage → Rules
2. Click **"Rules Playground"**
3. Test different scenarios:
   - Authenticated user reading their own data
   - Unauthenticated user trying to read data
   - User trying to modify another user's data

---

## Next Steps

After completing this setup:

1. ✅ Configure push notifications (Expo Notifications)
2. ✅ Set up Google Places API for venue suggestions (IntentMatch)
3. ✅ Configure Stripe for premium features
4. ✅ Set up Cloud Functions for:
   - Match creation triggers
   - Chat expiration
   - Photo unlock tracking
   - Push notifications
5. ✅ Deploy to production

---

## Production Checklist

Before going live:

- [ ] Change Firestore to production mode
- [ ] Change Storage to production mode
- [ ] Review and test all security rules
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Enable backups for Firestore
- [ ] Set up monitoring and alerts
- [ ] Configure billing alerts
- [ ] Test on physical devices (iOS & Android)
- [ ] Perform security audit
- [ ] Set up CI/CD for rule deployment
- [ ] Document disaster recovery procedures

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
- [Expo Firebase Integration](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check the app's `DATABASE_SCHEMA.md` for data structure
4. Review service files in `src/services/`

---

**Last Updated:** January 11, 2026

**Status:** ✅ Firebase infrastructure ready for integration
