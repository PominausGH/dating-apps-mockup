# VoiceFirst App - Quick Start Guide

Get up and running with the progressive photo blur/reveal system in 5 minutes.

## Installation

### Step 1: Install Dependencies

The main dependency `expo-blur` has already been installed. Verify it's in your package.json:

```bash
cd /home/andrew/Documents/Projects/AndroidProjects/dating-apps-mockup/intentmatch-app
npm install  # If needed
```

### Step 2: Import Components

```tsx
import {
  BlurredPhoto,
  MatchesScreen,
  ChatScreen,
  DiscoverScreen,
  BlurDemoScreen,
  calculateBlurIntensity,
  getUnlockProgress,
} from './voicefirst-app/src';
```

## Quick Examples

### Example 1: Display a Blurred Photo (30 seconds)

```tsx
import React from 'react';
import { View } from 'react-native';
import { BlurredPhoto } from './voicefirst-app/src';

function MyComponent() {
  return (
    <View>
      <BlurredPhoto
        photoUri="https://i.pravatar.cc/400?img=1"
        messageCount={5}
        showProgress={true}
        showCelebration={true}
        style={{ width: 200, height: 200 }}
        borderRadius={20}
      />
    </View>
  );
}
```

### Example 2: Use in a Match List (1 minute)

```tsx
import React from 'react';
import { FlatList } from 'react-native';
import { BlurredPhoto } from './voicefirst-app/src';

function MatchList({ matches }) {
  return (
    <FlatList
      data={matches}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <BlurredPhoto
            photoUri={item.photo}
            messageCount={item.messageCount}
            showProgress={true}
            style={{ width: 60, height: 60 }}
            borderRadius={30}
          />
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
}
```

### Example 3: Track Message Count (2 minutes)

```tsx
import React, { useState } from 'react';
import { Button } from 'react-native';
import { BlurredPhoto } from './voicefirst-app/src';

function ChatWithBlur() {
  const [messageCount, setMessageCount] = useState(0);

  const sendMessage = () => {
    setMessageCount(messageCount + 1);
  };

  return (
    <>
      <BlurredPhoto
        photoUri="https://i.pravatar.cc/400?img=1"
        messageCount={messageCount}
        showProgress={true}
        showCelebration={true}
      />
      <Button title="Send Message" onPress={sendMessage} />
    </>
  );
}
```

## Pre-Built Screens

### Use Complete Screens (Fastest Option)

Simply import and use the pre-built screens:

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DiscoverScreen,
  MatchesScreen,
  ChatScreen,
  BlurDemoScreen,
} from './voicefirst-app/src';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Discover" component={DiscoverScreen} />
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Demo" component={BlurDemoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Interactive Demo

### Test the Blur System

Run the BlurDemoScreen to see the blur system in action:

```tsx
import { BlurDemoScreen } from './voicefirst-app/src';

// In your app
<BlurDemoScreen />
```

Features:
- Interactive controls to change message count
- Real-time blur preview
- Stats display (blur intensity, progress)
- Quick presets for all blur levels

## Blur Levels Reference

| Messages | Blur Intensity | Visual Effect |
|----------|---------------|---------------|
| 0        | 100%          | Completely hidden with lock icon |
| 1-2      | 80%           | Highly blurred |
| 3-4      | 50%           | Partially visible |
| 5-7      | 20%           | Mostly clear |
| 8+       | 0%            | Fully revealed with celebration |

## Utility Functions

```tsx
import {
  calculateBlurIntensity,
  getUnlockProgress,
  isPhotoUnlocked,
  getNextMilestone,
} from './voicefirst-app/src';

const messageCount = 5;

// Get blur intensity (0-100)
const blur = calculateBlurIntensity(messageCount); // 20

// Get unlock progress (0-100%)
const progress = getUnlockProgress(messageCount); // 62%

// Check if unlocked
const unlocked = isPhotoUnlocked(messageCount); // false

// Get next milestone
const milestone = getNextMilestone(messageCount);
// { count: 8, label: "Send 8 messages to fully unlock" }
```

## Common Use Cases

### Use Case 1: Profile Card

```tsx
<BlurredPhoto
  photoUri={profile.photo}
  messageCount={0} // Hidden until match
  showProgress={false}
  style={{ width: 300, height: 400 }}
  borderRadius={20}
/>
```

### Use Case 2: Chat Header

```tsx
<BlurredPhoto
  photoUri={match.photo}
  messageCount={messages.filter(m => m.sender === 'me').length}
  showProgress={false}
  showCelebration={false}
  style={{ width: 40, height: 40 }}
  borderRadius={20}
/>
```

### Use Case 3: Match Grid

```tsx
{matches.map(match => (
  <BlurredPhoto
    key={match.id}
    photoUri={match.photo}
    messageCount={match.messageCount}
    showProgress={true}
    style={{ width: 100, height: 100 }}
    borderRadius={12}
  />
))}
```

## Customization

### Custom Styling

```tsx
<BlurredPhoto
  photoUri={photo}
  messageCount={5}
  style={{
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: '#E63946',
  }}
  imageStyle={{
    width: 200,
    height: 200,
  }}
  borderRadius={100} // Make it circular
/>
```

### Disable Celebration

```tsx
<BlurredPhoto
  photoUri={photo}
  messageCount={8}
  showCelebration={false} // No celebration animation
/>
```

### Hide Progress Bar

```tsx
<BlurredPhoto
  photoUri={photo}
  messageCount={5}
  showProgress={false} // No progress indicator
/>
```

## Troubleshooting

### Issue: Blur not showing

**Solution**: Make sure expo-blur is installed:
```bash
npm install expo-blur
```

### Issue: Images not loading

**Solution**: Check if the photoUri is valid and accessible.

### Issue: Animations laggy

**Solution**: Use `showCelebration={false}` in lists with many items.

### Issue: TypeScript errors

**Solution**: Import types from the package:
```tsx
import type { BlurredPhotoProps } from './voicefirst-app/src/types';
```

## Next Steps

1. Read [EXAMPLES.md](./EXAMPLES.md) for advanced usage patterns
2. Check [README.md](./README.md) for complete documentation
3. Review [VERIFICATION.md](./VERIFICATION.md) for implementation details
4. Customize blur levels in `src/utils/blurUtils.ts` if needed

## Get Help

- Check the [EXAMPLES.md](./EXAMPLES.md) file for more examples
- Review the source code in `src/` directory
- Test with [BlurDemoScreen](./src/screens/BlurDemoScreen.tsx)

## File Locations

```
voicefirst-app/
├── src/
│   ├── components/
│   │   └── BlurredPhoto.tsx      # Main component
│   ├── screens/
│   │   ├── DiscoverScreen.tsx    # Example: Hidden photos
│   │   ├── MatchesScreen.tsx     # Example: Progressive blur
│   │   ├── ChatScreen.tsx        # Example: Animated blur
│   │   └── BlurDemoScreen.tsx    # Interactive demo
│   ├── utils/
│   │   └── blurUtils.ts          # Helper functions
│   └── index.ts                  # Main exports
└── README.md                      # Full documentation
```

Happy coding!
