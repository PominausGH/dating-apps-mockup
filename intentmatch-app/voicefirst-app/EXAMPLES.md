# VoiceFirst App - Usage Examples

Complete examples showing how to use the progressive blur/reveal system in different scenarios.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Component Examples](#component-examples)
3. [Utility Functions](#utility-functions)
4. [Screen Implementations](#screen-implementations)
5. [Advanced Patterns](#advanced-patterns)

## Basic Setup

### Installation

```bash
# Install required dependencies
npm install expo-blur expo-linear-gradient react-native-reanimated
```

### Import Components

```tsx
// Import individual components
import BlurredPhoto from './voicefirst-app/src/components/BlurredPhoto';
import { calculateBlurIntensity, getUnlockProgress } from './voicefirst-app/src/utils/blurUtils';

// Or import from index
import { BlurredPhoto, calculateBlurIntensity, MatchesScreen } from './voicefirst-app/src';
```

## Component Examples

### Example 1: Basic BlurredPhoto

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import BlurredPhoto from './components/BlurredPhoto';

function ProfileCard() {
  const [messageCount, setMessageCount] = useState(3);

  return (
    <View>
      <BlurredPhoto
        photoUri="https://i.pravatar.cc/400?img=1"
        messageCount={messageCount}
        showProgress={true}
        showCelebration={true}
        style={{ width: 300, height: 400 }}
        borderRadius={20}
      />
    </View>
  );
}
```

### Example 2: Circular Profile Photo

```tsx
function CircularProfile() {
  return (
    <BlurredPhoto
      photoUri="https://example.com/photo.jpg"
      messageCount={5}
      showProgress={false}
      showCelebration={false}
      style={{ width: 100, height: 100 }}
      imageStyle={{ width: 100, height: 100 }}
      borderRadius={50} // Makes it circular
    />
  );
}
```

### Example 3: Small Thumbnail in List

```tsx
function MatchListItem({ match }) {
  return (
    <View style={{ flexDirection: 'row', padding: 10 }}>
      <BlurredPhoto
        photoUri={match.photo}
        messageCount={match.messageCount}
        showProgress={true}
        showCelebration={false}
        style={{ width: 60, height: 60 }}
        borderRadius={30}
      />
      <View style={{ marginLeft: 12 }}>
        <Text>{match.name}</Text>
        <Text>{match.messageCount}/8 messages</Text>
      </View>
    </View>
  );
}
```

### Example 4: Full-Screen Card

```tsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

function DiscoveryCard({ profile }) {
  return (
    <View style={{ width: width - 40, height: height * 0.6 }}>
      <BlurredPhoto
        photoUri={profile.photo}
        messageCount={0} // Hidden in discovery
        showProgress={false}
        showCelebration={false}
        style={{ flex: 1 }}
        borderRadius={20}
      />
    </View>
  );
}
```

## Utility Functions

### Example 5: Calculate Blur Intensity

```tsx
import { calculateBlurIntensity } from './utils/blurUtils';

// Get blur intensity for different message counts
const blur0 = calculateBlurIntensity(0);   // 100 (completely blurred)
const blur2 = calculateBlurIntensity(2);   // 80
const blur4 = calculateBlurIntensity(4);   // 50
const blur7 = calculateBlurIntensity(7);   // 20
const blur8 = calculateBlurIntensity(8);   // 0 (fully revealed)
```

### Example 6: Track Unlock Progress

```tsx
import { getUnlockProgress, isPhotoUnlocked } from './utils/blurUtils';

function ProgressTracker({ messageCount }) {
  const progress = getUnlockProgress(messageCount);
  const unlocked = isPhotoUnlocked(messageCount);

  return (
    <View>
      <Text>Progress: {progress}%</Text>
      {unlocked && <Text>Photo Unlocked!</Text>}
    </View>
  );
}
```

### Example 7: Display Next Milestone

```tsx
import { getNextMilestone } from './utils/blurUtils';

function MilestoneHint({ messageCount }) {
  const milestone = getNextMilestone(messageCount);

  if (!milestone) {
    return <Text>Photo fully unlocked!</Text>;
  }

  return (
    <View>
      <Text>Next unlock: {milestone.count} messages</Text>
      <Text>{milestone.label}</Text>
    </View>
  );
}
```

## Screen Implementations

### Example 8: Match List Screen

```tsx
import React from 'react';
import { FlatList, View, Text } from 'react-native';
import BlurredPhoto from './components/BlurredPhoto';
import { getNextMilestone } from './utils/blurUtils';

interface Match {
  id: string;
  name: string;
  photo: string;
  messageCount: number;
}

function MatchListScreen({ matches }: { matches: Match[] }) {
  const renderMatch = ({ item }: { item: Match }) => {
    const nextMilestone = getNextMilestone(item.messageCount);

    return (
      <View style={styles.matchCard}>
        <BlurredPhoto
          photoUri={item.photo}
          messageCount={item.messageCount}
          showProgress={true}
          style={{ width: 80, height: 80 }}
          borderRadius={40}
        />
        <View style={styles.matchInfo}>
          <Text style={styles.name}>{item.name}</Text>
          {nextMilestone && (
            <Text style={styles.hint}>
              {item.messageCount}/{nextMilestone.count} messages
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={matches}
      renderItem={renderMatch}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### Example 9: Chat Header with Blur

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import BlurredPhoto from './components/BlurredPhoto';
import { getUnlockProgress } from './utils/blurUtils';

function ChatHeader({ match, messageCount }) {
  const progress = getUnlockProgress(messageCount);

  return (
    <View style={styles.header}>
      <BlurredPhoto
        photoUri={match.photo}
        messageCount={messageCount}
        showProgress={false}
        showCelebration={false}
        style={{ width: 40, height: 40 }}
        borderRadius={20}
      />
      <View style={styles.headerInfo}>
        <Text style={styles.name}>{match.name}</Text>
        <Text style={styles.progress}>{progress}% unlocked</Text>
      </View>
    </View>
  );
}
```

### Example 10: Discovery Card with Hidden Photo

```tsx
function DiscoveryCard({ profile }) {
  return (
    <View style={styles.card}>
      <BlurredPhoto
        photoUri={profile.photo}
        messageCount={0} // Always 0 in discovery
        showProgress={false}
        showCelebration={false}
        style={styles.cardPhoto}
        borderRadius={20}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{profile.name}, {profile.age}</Text>
        <Text style={styles.bio}>{profile.bio}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            Photo reveals after you match
          </Text>
        </View>
      </View>
    </View>
  );
}
```

## Advanced Patterns

### Example 11: Animated Blur Reduction on Message Send

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

function ChatWithAnimation() {
  const [messageCount, setMessageCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showAnimation) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start(() => setShowAnimation(false));
    }
  }, [showAnimation]);

  const sendMessage = () => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    // Trigger animation at milestones
    if ([1, 3, 5, 8].includes(newCount)) {
      setShowAnimation(true);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <BlurredPhoto
        photoUri="https://example.com/photo.jpg"
        messageCount={messageCount}
        showProgress={true}
        showCelebration={true}
      />
    </Animated.View>
  );
}
```

### Example 12: Conditional Blur Based on Match Status

```tsx
function SmartBlurredPhoto({ match }) {
  // Determine message count based on match status
  const getMessageCount = () => {
    if (!match.isMatch) return 0; // Not matched yet
    if (!match.hasConversation) return 0; // Matched but no messages
    return match.messages.filter(m => m.sender === 'me').length;
  };

  const messageCount = getMessageCount();

  return (
    <BlurredPhoto
      photoUri={match.photo}
      messageCount={messageCount}
      showProgress={match.isMatch}
      showCelebration={match.isMatch}
    />
  );
}
```

### Example 13: Progress Bar Indicator

```tsx
import { View, Text } from 'react-native';
import { getUnlockProgress, getNextMilestone } from './utils/blurUtils';

function UnlockProgressBar({ messageCount }) {
  const progress = getUnlockProgress(messageCount);
  const milestone = getNextMilestone(messageCount);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` }
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {progress}% unlocked
      </Text>
      {milestone && (
        <Text style={styles.milestoneText}>
          {milestone.label}
        </Text>
      )}
    </View>
  );
}
```

### Example 14: Grid of Blurred Photos

```tsx
function PhotoGrid({ matches }) {
  return (
    <View style={styles.grid}>
      {matches.map((match) => (
        <View key={match.id} style={styles.gridItem}>
          <BlurredPhoto
            photoUri={match.photo}
            messageCount={match.messageCount}
            showProgress={false}
            showCelebration={false}
            style={styles.gridPhoto}
            borderRadius={12}
          />
          <Text style={styles.gridName}>{match.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  gridItem: {
    width: '33.33%',
    padding: 5,
  },
  gridPhoto: {
    width: '100%',
    aspectRatio: 1,
  },
  gridName: {
    textAlign: 'center',
    marginTop: 4,
  },
});
```

### Example 15: Custom Blur Levels

```tsx
// Create custom blur calculation function
function customBlurIntensity(messageCount: number): number {
  // Custom logic: faster unlock
  if (messageCount === 0) return 100;
  if (messageCount < 3) return 60;
  if (messageCount < 5) return 30;
  return 0; // Unlocked at 5 messages
}

function CustomBlurPhoto({ messageCount }) {
  const customBlur = customBlurIntensity(messageCount);

  return (
    <View>
      <Image source={{ uri: photoUri }} />
      <BlurView
        intensity={customBlur}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
```

## Testing Examples

### Example 16: Unit Tests for Blur Utils

```tsx
import { calculateBlurIntensity, getUnlockProgress, isPhotoUnlocked } from './blurUtils';

describe('Blur Utilities', () => {
  test('calculateBlurIntensity returns correct values', () => {
    expect(calculateBlurIntensity(0)).toBe(100);
    expect(calculateBlurIntensity(2)).toBe(80);
    expect(calculateBlurIntensity(4)).toBe(50);
    expect(calculateBlurIntensity(7)).toBe(20);
    expect(calculateBlurIntensity(8)).toBe(0);
  });

  test('getUnlockProgress calculates percentage', () => {
    expect(getUnlockProgress(0)).toBe(0);
    expect(getUnlockProgress(4)).toBe(50);
    expect(getUnlockProgress(8)).toBe(100);
  });

  test('isPhotoUnlocked checks unlock status', () => {
    expect(isPhotoUnlocked(7)).toBe(false);
    expect(isPhotoUnlocked(8)).toBe(true);
    expect(isPhotoUnlocked(10)).toBe(true);
  });
});
```

## Integration Examples

### Example 17: Integration with Redux

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { incrementMessageCount } from './store/matchSlice';

function ConnectedChatScreen({ matchId }) {
  const dispatch = useDispatch();
  const match = useSelector(state => state.matches[matchId]);

  const handleSendMessage = (text) => {
    // Send message and increment count
    dispatch(incrementMessageCount(matchId));
  };

  return (
    <View>
      <BlurredPhoto
        photoUri={match.photo}
        messageCount={match.messageCount}
        showProgress={true}
        showCelebration={true}
      />
      {/* Chat UI */}
    </View>
  );
}
```

### Example 18: Integration with API

```tsx
function ApiIntegratedMatch({ matchId }) {
  const [match, setMatch] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    // Fetch match data
    fetch(`/api/matches/${matchId}`)
      .then(res => res.json())
      .then(data => {
        setMatch(data);
        setMessageCount(data.messageCount);
      });
  }, [matchId]);

  if (!match) return <Text>Loading...</Text>;

  return (
    <BlurredPhoto
      photoUri={match.photoUrl}
      messageCount={messageCount}
      showProgress={true}
      showCelebration={true}
    />
  );
}
```

## Best Practices

1. **Message Count Tracking**: Always track message count accurately, considering only meaningful messages
2. **Performance**: Use `showCelebration={false}` in lists to reduce animation overhead
3. **User Feedback**: Always show progress indicators so users understand the unlock system
4. **Accessibility**: Provide text alternatives describing the blur level
5. **Testing**: Test all blur levels (0, 1-2, 3-4, 5-7, 8+) to ensure smooth transitions

## Common Pitfalls

1. **Not importing expo-blur**: Make sure to install and import BlurView
2. **Negative message counts**: Ensure messageCount is always >= 0
3. **Missing borderRadius**: Apply borderRadius to both style and BlurView for correct rendering
4. **Performance in FlatList**: Disable celebration animations in lists with many items

## Additional Resources

- [Expo Blur Documentation](https://docs.expo.dev/versions/latest/sdk/blur-view/)
- [React Native Animated API](https://reactnative.dev/docs/animated)
- [VoiceFirst README](./README.md)
