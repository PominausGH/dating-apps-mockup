# Venue Suggestions Feature

A beautiful and intuitive venue suggestion system for the IntentMatch dating app that helps users choose the perfect location for their first date.

## Overview

The venue suggestions feature automatically recommends 3-5 nearby venues based on the scheduled date time:
- **Morning/Afternoon dates**: Coffee shops, cafes, and bakeries
- **Evening dates**: Restaurants, bars, and lounges

Users can either select a specific venue or choose to "decide in person" when they meet.

## Files Created

### 1. `/src/components/VenueSuggestionsModal.tsx`
The main modal component that displays venue suggestions with beautiful card-based UI.

**Features:**
- Displays 4 venue cards with photos, ratings, distance, and price information
- "Decide in Person" option for flexible planning
- Visual selection indicators
- Smooth animations and gradient overlays
- Fully responsive design

### 2. `/src/utils/mockVenues.ts`
Mock venue data and utility functions.

**Includes:**
- `MORNING_AFTERNOON_VENUES`: Array of coffee shops and cafes
- `EVENING_VENUES`: Array of restaurants and bars
- `getVenueSuggestions(timeOfDay)`: Returns 4 random venues based on time
- `calculateMidpoint()`: Calculates location between two users
- `getVenueIcon()`: Maps venue types to Ionicons

### 3. Updated `/src/types/index.ts`
Enhanced type definitions for the venue feature.

**Changes:**
- Added `selectedVenue?: Venue | null` to `ScheduledDate`
- Added `decideVenueInPerson?: boolean` to `ScheduledDate`
- Expanded `Venue` interface with:
  - `type`: Specific venue category
  - `category`: Display category name
  - `distance`: Distance in miles
  - `reviewCount`: Number of reviews
  - `priceLevel`: $ to $$$$
  - `imageUrl`: Placeholder image URL
  - `coordinates`: Optional lat/lng

### 4. Updated `/src/screens/MatchConfirmationScreen.tsx`
Integrated venue suggestions into the match confirmation flow.

**Changes:**
- Added `onVenueSelected` callback prop
- Added state for showing venue suggestions modal
- Modified "Confirm Date" button to show venue suggestions
- Venue selection happens after date confirmation

### 5. `/src/screens/ExampleMatchFlow.tsx`
Example implementation showing how to use the complete flow.

## Usage

### Basic Integration

```tsx
import MatchConfirmationScreen from './screens/MatchConfirmationScreen';
import { Venue } from './types';

function YourComponent() {
  const [scheduledDate, setScheduledDate] = useState<ScheduledDate>(/* ... */);

  const handleVenueSelected = (venue: Venue | null, decideInPerson: boolean) => {
    setScheduledDate(prev => ({
      ...prev,
      selectedVenue: venue,
      decideVenueInPerson: decideInPerson,
    }));
  };

  const handleConfirm = () => {
    // Date and venue are now confirmed
    console.log('Selected venue:', scheduledDate.selectedVenue);
    console.log('Decide in person:', scheduledDate.decideVenueInPerson);
  };

  return (
    <MatchConfirmationScreen
      visible={true}
      matchedUser={user}
      scheduledDate={scheduledDate}
      currentUserId="user_1"
      onConfirm={handleConfirm}
      onRequestAlternative={handleAlternativeTime}
      onVenueSelected={handleVenueSelected}
      onClose={handleClose}
    />
  );
}
```

### Standalone Venue Modal

You can also use the VenueSuggestionsModal independently:

```tsx
import VenueSuggestionsModal from './components/VenueSuggestionsModal';

function YourComponent() {
  const [showVenues, setShowVenues] = useState(false);

  return (
    <VenueSuggestionsModal
      visible={showVenues}
      timeSlot={selectedTimeSlot}
      onSelectVenue={(venue) => {
        console.log('Venue selected:', venue);
        setShowVenues(false);
      }}
      onDecideInPerson={() => {
        console.log('Will decide in person');
        setShowVenues(false);
      }}
      onClose={() => setShowVenues(false)}
    />
  );
}
```

## User Flow

1. Users match and a date is automatically scheduled
2. Match confirmation modal appears
3. User clicks "Confirm Date"
4. Venue suggestions modal appears showing:
   - 4 venue cards with photos and details
   - Option to "Decide in Person"
5. User selects a venue or chooses to decide in person
6. Clicks "Confirm [Venue Name]" or "Continue Without Venue"
7. Selection is saved to `ScheduledDate` object
8. Match confirmation completes

## Venue Data Structure

```typescript
interface Venue {
  id: string;
  name: string;
  type: 'coffee_shop' | 'restaurant' | 'bar' | 'cafe' | 'lounge';
  category: string;
  address: string;
  distance: number; // in miles
  rating: number;
  reviewCount: number;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  imageUrl: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

## Mock Data

The feature uses mock venue data from `/src/utils/mockVenues.ts`. Each venue includes:
- Placeholder images from Unsplash
- Realistic San Francisco addresses
- Mock coordinates (SF area)
- Sample ratings and review counts

### Replacing with Real Data

To integrate with a real API:

1. Update `getVenueSuggestions()` in `mockVenues.ts`:

```typescript
export const getVenueSuggestions = async (
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  userCoordinates: { latitude: number; longitude: number }
): Promise<Venue[]> => {
  // Call your venue API (Yelp, Google Places, Foursquare, etc.)
  const response = await fetch(`/api/venues?time=${timeOfDay}&lat=${userCoordinates.latitude}&lng=${userCoordinates.longitude}`);
  const venues = await response.json();
  return venues;
};
```

2. Update VenueSuggestionsModal to handle async data loading:

```typescript
useEffect(() => {
  if (visible) {
    setLoading(true);
    getVenueSuggestions(timeSlot.timeOfDay, midpointCoordinates)
      .then(setVenues)
      .finally(() => setLoading(false));
  }
}, [visible, timeSlot]);
```

## Customization

### Changing Venue Count

Edit `getVenueSuggestions()` in `mockVenues.ts`:

```typescript
// Show 3 venues instead of 4
return shuffled.slice(0, 3);
```

### Adding More Venue Types

1. Update the `Venue['type']` in `/src/types/index.ts`:

```typescript
type: 'coffee_shop' | 'restaurant' | 'bar' | 'cafe' | 'lounge' | 'museum' | 'park';
```

2. Add new icon mapping in `getVenueIcon()`:

```typescript
case 'museum':
  return 'business-outline';
case 'park':
  return 'leaf-outline';
```

3. Add new venue data to `mockVenues.ts`

### Styling

All colors use the existing theme from `/src/theme/colors.ts`:
- Primary red: `#E63946`
- Secondary navy: `#1D3557`
- Accent orange: `#F4A261`
- Success green: `#10B981`

Modify styles in `VenueSuggestionsModal.tsx` to match your design preferences.

## Dependencies

The feature uses existing project dependencies:
- `react-native`: Core framework
- `expo-linear-gradient`: Gradient overlays
- `@expo/vector-icons`: Ionicons
- `react-native-safe-area-context`: Safe area handling

No additional packages required.

## Future Enhancements

Potential improvements for production:

1. **Real API Integration**
   - Connect to Yelp Fusion API
   - Integrate Google Places
   - Use Foursquare venues

2. **Advanced Features**
   - Show venue on map
   - Filter by dietary preferences
   - Price range filtering
   - Venue availability checking
   - Save favorite venues
   - Share venue with match

3. **User Experience**
   - Add venue photos carousel
   - Show walking/driving directions
   - Display operating hours
   - Show menu previews
   - User reviews integration
   - Book reservations directly

4. **Smart Suggestions**
   - ML-based recommendations
   - Learn from past date preferences
   - Consider both users' favorite cuisines
   - Weather-aware suggestions

## Testing

To test the feature:

1. Use the example flow:
   ```tsx
   import ExampleMatchFlow from './screens/ExampleMatchFlow';
   // Render in your app
   ```

2. Check console logs for venue selection:
   ```javascript
   console.log('Selected venue:', scheduledDate.selectedVenue);
   console.log('Decide in person:', scheduledDate.decideVenueInPerson);
   ```

3. Verify data persistence in your backend when saving the `ScheduledDate` object

## Support

For issues or questions about this feature:
1. Check the example implementation in `ExampleMatchFlow.tsx`
2. Review type definitions in `src/types/index.ts`
3. Examine mock data structure in `src/utils/mockVenues.ts`

## License

Part of the IntentMatch app project.
