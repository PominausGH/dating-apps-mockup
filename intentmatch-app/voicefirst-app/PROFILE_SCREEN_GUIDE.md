# ProfileScreen Implementation Guide

## Overview

The ProfileScreen is a comprehensive user profile and settings interface for the IntentMatch app. It provides full profile management, statistics tracking, and settings configuration with a beautiful, intuitive UI.

## Features

### 1. Profile Management
- **Profile Header**: Gradient header with avatar, name, age, and verification badge
- **Photo Gallery**: Up to 6 photos with add/remove functionality
- **Editable Fields**: In-line editing for name, occupation, and bio
- **Primary Photo**: First photo marked as primary with a special badge

### 2. User Statistics
- **Total Matches**: Count of all matches made
- **Dates Scheduled**: Number of dates scheduled
- **Dates Completed**: Number of dates attended
- **Accountability Score**: Percentage-based score with color-coded visual feedback
  - Green (80%+): Excellent accountability
  - Yellow/Orange (60-79%): Good accountability
  - Red (<60%): Needs improvement

### 3. Settings Modal
- **Notification Preferences**
  - New Matches notifications
  - Messages notifications
  - Date Reminders notifications
- **Discovery Preferences**
  - Distance Range filter (1-50 miles)
  - Age Range filter (min/max)
- **Account Actions**
  - Logout
  - Delete Account

## Implementation

### Basic Usage

```tsx
import { ProfileScreen } from './src/screens/ProfileScreen';

// In your navigation setup
<Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{ headerShown: false }}
/>
```

### Integration with Navigation

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

## Data Structure

### UserProfile
```typescript
interface UserProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  photos: string[];
  verified: boolean;
}
```

### UserStats
```typescript
interface UserStats {
  totalMatches: number;
  datesScheduled: number;
  datesCompleted: number;
  accountabilityScore: number; // 0-100
}
```

### UserSettings
```typescript
interface UserSettings {
  notifications: {
    matches: boolean;
    messages: boolean;
    dateReminders: boolean;
  };
  distanceRange: number; // in miles
  ageRange: {
    min: number;
    max: number;
  };
}
```

## Key Functionalities

### 1. Photo Management

**Adding Photos:**
- Click on any empty photo slot (dashed border)
- Maximum 6 photos allowed
- First photo is automatically set as primary

**Removing Photos:**
- Click on any photo to remove it
- Confirmation dialog appears
- Must keep at least 1 photo

**Photo Simulation:**
```tsx
const handleAddPhoto = () => {
  // In production, use expo-image-picker:
  // const result = await ImagePicker.launchImageLibraryAsync({
  //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //   allowsEditing: true,
  //   aspect: [1, 1],
  //   quality: 0.8,
  // });

  Alert.alert('Add Photo', 'Opens image picker in production');
};
```

### 2. Field Editing

**Edit Flow:**
1. Click edit icon next to any field
2. Field becomes editable with auto-focus
3. Make changes
4. Save or Cancel

**Validation:**
- Empty fields are not allowed
- Displays error alert for invalid input

### 3. Settings Modal

**Opening Settings:**
- Click settings icon in header
- Click "Discovery Preferences" or "Notifications" quick settings

**Modal Features:**
- Slide-up animation
- Full-screen overlay
- Organized sections
- Toggle switches for notifications
- Visual sliders for ranges

### 4. Accountability Score

The accountability score is calculated based on date completion:

```typescript
accountabilityScore = (datesCompleted / datesScheduled) * 100
```

**Visual Indicators:**
- Progress bar with dynamic color
- Large percentage display
- Contextual description

**Color Coding:**
```typescript
const getAccountabilityColor = (score: number) => {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};
```

## UI Components

### 1. Profile Header
- Gradient background (red to orange)
- 80x80 circular avatar with white border
- Name, age, and verification badge
- Occupation subtitle

### 2. Photo Grid
- 3 columns
- Equal spacing (12px gap)
- Rounded corners (12px)
- Primary badge on first photo
- Remove overlay on hover/press

### 3. Stats Cards
- Icon with colored background
- Large value display
- Descriptive label
- Responsive grid layout

### 4. Settings Modal
- Bottom sheet style
- Rounded top corners (30px)
- Organized sections
- Native switch components
- Action buttons with appropriate colors

## Styling

### Color Scheme
- **Primary Brand**: `#E63946` (Red)
- **Secondary Brand**: `#F4A261` (Orange)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Orange/Yellow)
- **Error**: `#EF4444` (Red)
- **Background**: `#F1FAEE` (Off-white)
- **Text Primary**: `#1D3557` (Dark blue)
- **Text Secondary**: `#6B7280` (Gray)

### Spacing
- Section margins: 16px horizontal
- Section padding: 20px
- Card gap: 12px
- Border radius (cards): 20px
- Border radius (buttons): 12px

### Typography
- **Header**: 24px, Bold
- **Section Title**: 18px, Bold
- **Field Label**: 14px, Semibold
- **Field Value**: 16px, Regular
- **Stat Value**: 24px, Bold
- **Stat Label**: 12px, Regular

## Customization

### Changing Maximum Photos
```tsx
const MAX_PHOTOS = 6; // Change this value

const handleAddPhoto = () => {
  if (profile.photos.length >= MAX_PHOTOS) {
    Alert.alert('Maximum Photos', `You can only have up to ${MAX_PHOTOS} photos`);
    return;
  }
  // ... rest of the code
};
```

### Custom Validation
```tsx
const validateField = (field: string, value: string): boolean => {
  switch (field) {
    case 'name':
      return value.length >= 2 && value.length <= 50;
    case 'bio':
      return value.length >= 20 && value.length <= 500;
    case 'occupation':
      return value.length >= 2 && value.length <= 100;
    default:
      return true;
  }
};
```

### Adding New Settings
```tsx
// 1. Update Settings interface
interface Settings {
  // ... existing settings
  showOnlineStatus: boolean;
  privacyMode: boolean;
}

// 2. Add to initial state
const INITIAL_SETTINGS: Settings = {
  // ... existing settings
  showOnlineStatus: true,
  privacyMode: false,
};

// 3. Add to settings modal
<View style={styles.settingRow}>
  <View style={styles.settingInfo}>
    <Ionicons name="eye" size={20} color="#E63946" />
    <Text style={styles.settingLabel}>Show Online Status</Text>
  </View>
  <Switch
    value={settings.showOnlineStatus}
    onValueChange={(value) =>
      setSettings((prev) => ({ ...prev, showOnlineStatus: value }))
    }
  />
</View>
```

## Integration with Backend

### Saving Profile Changes
```tsx
const handleSaveField = async () => {
  if (!editingField) return;

  try {
    // API call to update profile
    const response = await fetch(`/api/profile/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [editingField]: editValue }),
    });

    if (response.ok) {
      setProfile((prev) => ({
        ...prev,
        [editingField]: editValue,
      }));
      setEditingField(null);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to update profile');
  }
};
```

### Uploading Photos
```tsx
import * as ImagePicker from 'expo-image-picker';

const handleAddPhoto = async () => {
  // Request permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'We need photo library access');
    return;
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Upload to server
    const formData = new FormData();
    formData.append('photo', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await fetch('/api/profile/photos', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    setProfile((prev) => ({
      ...prev,
      photos: [...prev.photos, data.photoUrl],
    }));
  }
};
```

### Saving Settings
```tsx
const saveSettings = async (newSettings: Settings) => {
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
  } catch (error) {
    Alert.alert('Error', 'Failed to save settings');
  }
};
```

## Accessibility

### Screen Reader Support
- All touchable elements have accessible labels
- Semantic headings for sections
- Descriptive button labels

### Keyboard Navigation
- Tab order is logical
- Focus indicators are visible
- Form inputs are properly labeled

## Performance Optimization

### Image Loading
```tsx
// Use FastImage for better performance
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: photo, priority: FastImage.priority.normal }}
  style={styles.photoImage}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### Memoization
```tsx
import { memo, useMemo } from 'react';

const PhotoGrid = memo(({ photos, onAdd, onRemove }) => {
  // Component implementation
});

const statsItems = useMemo(() => [
  { icon: 'heart', value: stats.totalMatches, label: 'Total Matches' },
  { icon: 'calendar', value: stats.datesScheduled, label: 'Scheduled' },
  { icon: 'checkmark-circle', value: stats.datesCompleted, label: 'Completed' },
], [stats]);
```

## Testing

### Unit Tests
```tsx
import { render, fireEvent } from '@testing-library/react-native';

test('opens edit mode when edit button is pressed', () => {
  const { getByTestId } = render(<ProfileScreen />);

  const editButton = getByTestId('edit-name-button');
  fireEvent.press(editButton);

  expect(getByTestId('name-input')).toBeTruthy();
});
```

### Integration Tests
```tsx
test('saves profile changes', async () => {
  const { getByTestId, findByText } = render(<ProfileScreen />);

  fireEvent.press(getByTestId('edit-bio-button'));
  fireEvent.changeText(getByTestId('bio-input'), 'New bio text');
  fireEvent.press(getByTestId('save-button'));

  expect(await findByText('New bio text')).toBeTruthy();
});
```

## Troubleshooting

### Common Issues

**Issue: Photos not displaying**
- Check image URLs are valid
- Verify network connectivity
- Check CORS settings if using web

**Issue: Settings not persisting**
- Implement AsyncStorage for local persistence
- Add API integration for server-side storage

**Issue: Modal not closing**
- Ensure `onRequestClose` is implemented
- Check for blocking state updates

## Future Enhancements

1. **Photo Reordering**: Drag and drop to reorder photos
2. **Crop Tool**: Built-in image cropping
3. **Interests Tags**: Add and manage interest tags
4. **Privacy Settings**: Fine-grained privacy controls
5. **Blocking/Reporting**: User safety features
6. **Verification System**: Photo and identity verification
7. **Activity History**: View past interactions
8. **Analytics**: Detailed profile performance metrics

## Related Files

- `/src/screens/ProfileScreen.tsx` - Main component
- `/src/types/index.ts` - TypeScript definitions
- `/src/index.ts` - Export configuration

## Support

For questions or issues, please refer to the main documentation or create an issue in the project repository.
