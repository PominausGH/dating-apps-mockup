# Quick Integration Guide - Venue Suggestions Feature

## 5-Minute Integration

### Step 1: Import the Component (in your match screen)

```tsx
import VenueSuggestionsModal from '../components/VenueSuggestionsModal';
import { Venue } from '../types';
```

### Step 2: Update MatchConfirmationScreen Props

Find where you use `MatchConfirmationScreen` and add the new callback:

```tsx
<MatchConfirmationScreen
  visible={showMatch}
  matchedUser={matchedUser}
  scheduledDate={scheduledDate}
  currentUserId={currentUserId}
  onConfirm={handleConfirm}
  onRequestAlternative={handleAlternativeTime}
  onVenueSelected={handleVenueSelected}  // ← ADD THIS
  onClose={handleClose}
/>
```

### Step 3: Implement the Venue Handler

```tsx
const handleVenueSelected = (venue: Venue | null, decideInPerson: boolean) => {
  // Update your scheduled date state
  setScheduledDate(prev => ({
    ...prev,
    selectedVenue: venue,
    decideVenueInPerson: decideInPerson,
  }));

  // Optional: Save to backend immediately
  saveVenueSelection(scheduledDate.id, venue, decideInPerson);
};
```

### Step 4: That's It!

The feature is now integrated. When users click "Confirm Date", they'll automatically see venue suggestions.

## Complete Example

```tsx
import React, { useState } from 'react';
import MatchConfirmationScreen from './screens/MatchConfirmationScreen';
import { ScheduledDate, Venue } from './types';

export default function MatchFlow() {
  const [scheduledDate, setScheduledDate] = useState<ScheduledDate>({
    id: 'date_1',
    matchId: 'match_1',
    user1Id: 'user_1',
    user2Id: 'user_2',
    selectedSlot: {
      id: 'slot_1',
      userId: 'user_1',
      date: '2026-01-15',
      timeOfDay: 'morning',
      startTime: '10:00',
      endTime: '12:00',
      dayName: 'Wednesday',
    },
    alternativeSlots: [],
    status: 'pending_confirmation',
    confirmationDeadline: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(),
  });

  const handleVenueSelected = (venue: Venue | null, decideInPerson: boolean) => {
    // Update local state
    setScheduledDate(prev => ({
      ...prev,
      selectedVenue: venue,
      decideVenueInPerson: decideInPerson,
    }));

    // Save to your backend
    console.log('Saving venue selection:', { venue, decideInPerson });
  };

  const handleConfirm = () => {
    // Final confirmation - date and venue are set
    console.log('Date confirmed with venue:', scheduledDate.selectedVenue);
    // Navigate to next screen or update UI
  };

  return (
    <MatchConfirmationScreen
      visible={true}
      matchedUser={mockUser}
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

## Backend Integration

### Saving Venue Selection

When a user selects a venue, save it to your database:

```typescript
// Example API call
async function saveVenueSelection(
  dateId: string,
  venue: Venue | null,
  decideInPerson: boolean
) {
  await fetch(`/api/scheduled-dates/${dateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      selectedVenue: venue,
      decideVenueInPerson: decideInPerson,
    }),
  });
}
```

### Database Schema Update

Add these fields to your `scheduled_dates` table:

```sql
ALTER TABLE scheduled_dates
ADD COLUMN selected_venue_id VARCHAR(255) NULL,
ADD COLUMN decide_venue_in_person BOOLEAN DEFAULT FALSE;

-- Optional: Create venues table
CREATE TABLE venues (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  address TEXT,
  distance DECIMAL(5,2),
  rating DECIMAL(3,2),
  review_count INTEGER,
  price_level VARCHAR(10),
  image_url TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8)
);
```

## Replacing Mock Data with Real API

### Option 1: Google Places API

```typescript
import { getVenueSuggestions } from '../utils/mockVenues';

// Replace in VenueSuggestionsModal.tsx
useEffect(() => {
  if (visible) {
    fetchGooglePlaces();
  }
}, [visible]);

async function fetchGooglePlaces() {
  const midpoint = calculateMidpoint(user1Coords, user2Coords);

  const type = timeSlot.timeOfDay === 'evening'
    ? 'restaurant|bar'
    : 'cafe|coffee_shop';

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
    `location=${midpoint.latitude},${midpoint.longitude}&` +
    `radius=1000&` +
    `type=${type}&` +
    `key=${GOOGLE_PLACES_API_KEY}`
  );

  const data = await response.json();
  const venues = data.results.map(place => ({
    id: place.place_id,
    name: place.name,
    type: mapGoogleTypeToVenueType(place.types[0]),
    category: place.types[0],
    address: place.vicinity,
    distance: calculateDistance(midpoint, place.geometry.location),
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    priceLevel: '$'.repeat(place.price_level || 1),
    imageUrl: place.photos?.[0]?.photo_reference
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      : DEFAULT_IMAGE,
    coordinates: {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    },
  }));

  setVenues(venues.slice(0, 4));
}
```

### Option 2: Yelp Fusion API

```typescript
async function fetchYelpVenues() {
  const midpoint = calculateMidpoint(user1Coords, user2Coords);

  const categories = timeSlot.timeOfDay === 'evening'
    ? 'restaurants,bars,wine_bars'
    : 'coffee,cafes';

  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?` +
    `latitude=${midpoint.latitude}&` +
    `longitude=${midpoint.longitude}&` +
    `categories=${categories}&` +
    `limit=4&` +
    `radius=1600`, // 1 mile in meters
    {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  const venues = data.businesses.map(biz => ({
    id: biz.id,
    name: biz.name,
    type: mapYelpCategoryToType(biz.categories[0].alias),
    category: biz.categories[0].title,
    address: biz.location.display_address.join(', '),
    distance: biz.distance * 0.000621371, // meters to miles
    rating: biz.rating,
    reviewCount: biz.review_count,
    priceLevel: biz.price || '$$',
    imageUrl: biz.image_url,
    coordinates: {
      latitude: biz.coordinates.latitude,
      longitude: biz.coordinates.longitude,
    },
  }));

  setVenues(venues);
}
```

## Customization Examples

### Change Number of Venues

In `mockVenues.ts`:

```typescript
export const getVenueSuggestions = (timeOfDay) => {
  const venues = timeOfDay === 'evening' ? EVENING_VENUES : MORNING_AFTERNOON_VENUES;
  const shuffled = [...venues].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5); // Change to 5 venues
};
```

### Add Distance Filter

```typescript
export const getVenueSuggestions = (timeOfDay, maxDistance = 1.0) => {
  const venues = timeOfDay === 'evening' ? EVENING_VENUES : MORNING_AFTERNOON_VENUES;
  const filtered = venues.filter(v => v.distance <= maxDistance);
  return filtered.slice(0, 4);
};
```

### Custom Venue Types

Add to `types/index.ts`:

```typescript
type: 'coffee_shop' | 'restaurant' | 'bar' | 'cafe' | 'lounge' | 'park' | 'museum' | 'activity'
```

Add icons in `mockVenues.ts`:

```typescript
export const getVenueIcon = (type: Venue['type']): string => {
  switch (type) {
    case 'coffee_shop':
    case 'cafe':
      return 'cafe-outline';
    case 'restaurant':
      return 'restaurant-outline';
    case 'bar':
    case 'lounge':
      return 'wine-outline';
    case 'park':
      return 'leaf-outline';
    case 'museum':
      return 'business-outline';
    case 'activity':
      return 'fitness-outline';
    default:
      return 'location-outline';
  }
};
```

## Displaying Selected Venue

After the user confirms, show the venue in your match details:

```tsx
function MatchDetails({ scheduledDate }) {
  return (
    <View>
      <Text>Your Date</Text>
      <Text>{formatTimeSlot(scheduledDate.selectedSlot)}</Text>

      {scheduledDate.selectedVenue && (
        <View style={styles.venueInfo}>
          <Text style={styles.venueLabel}>Meeting at:</Text>
          <Text style={styles.venueName}>{scheduledDate.selectedVenue.name}</Text>
          <Text style={styles.venueAddress}>{scheduledDate.selectedVenue.address}</Text>
          <TouchableOpacity onPress={() => openMaps(scheduledDate.selectedVenue)}>
            <Text style={styles.directionsLink}>Get Directions →</Text>
          </TouchableOpacity>
        </View>
      )}

      {scheduledDate.decideVenueInPerson && (
        <View style={styles.inPersonBadge}>
          <Text>You'll decide the venue together in person</Text>
        </View>
      )}
    </View>
  );
}
```

## Testing

### Test the Flow

1. Create a match
2. Click "Confirm Date"
3. Venue modal should appear
4. Select a venue
5. Verify venue is saved to state
6. Check console logs
7. Verify backend receives data

### Test Different Times

```tsx
// Morning test
selectedSlot: { timeOfDay: 'morning', ... }
// Should show coffee shops

// Afternoon test
selectedSlot: { timeOfDay: 'afternoon', ... }
// Should show coffee shops

// Evening test
selectedSlot: { timeOfDay: 'evening', ... }
// Should show restaurants/bars
```

### Test Edge Cases

1. No venues available
2. Network error
3. User closes modal without selecting
4. User changes selection multiple times
5. "Decide in person" option

## Common Issues

### Issue: Modal doesn't appear
**Solution:** Check that `onConfirm` in MatchConfirmationScreen now shows the venue modal instead of immediately confirming.

### Issue: Venues not showing
**Solution:** Verify `getVenueSuggestions()` is being called with correct `timeOfDay` parameter.

### Issue: Images not loading
**Solution:** Check Unsplash URLs are accessible. Replace with your own images or use local assets.

### Issue: TypeScript errors
**Solution:** Ensure all type definitions in `types/index.ts` match your usage.

## Performance Tips

1. **Cache venue data**: Store venues locally to avoid repeated API calls
2. **Lazy load images**: Use react-native-fast-image for better performance
3. **Debounce location updates**: Don't fetch venues on every coordinate change
4. **Preload common venues**: Cache popular venues in the area

## Next Steps

After basic integration:

1. Connect to real venue API (Google Places, Yelp, Foursquare)
2. Add venue photos from API
3. Implement venue filtering (price, distance, rating)
4. Add map view of venue locations
5. Enable in-app directions
6. Add venue booking/reservation
7. Show venue operating hours
8. Implement favorite venues
9. Add dietary preference filtering
10. Show real-time availability

## Support

If you encounter issues:

1. Check `ExampleMatchFlow.tsx` for reference implementation
2. Review type definitions in `types/index.ts`
3. Verify mock data in `utils/mockVenues.ts`
4. Check console logs for errors
5. Ensure all dependencies are installed

## File Checklist

Created files:
- ✅ `/src/components/VenueSuggestionsModal.tsx`
- ✅ `/src/components/index.ts`
- ✅ `/src/utils/mockVenues.ts`
- ✅ `/src/screens/ExampleMatchFlow.tsx`

Modified files:
- ✅ `/src/types/index.ts` - Added venue fields to ScheduledDate
- ✅ `/src/screens/MatchConfirmationScreen.tsx` - Integrated venue modal

Documentation:
- ✅ `VENUE_SUGGESTIONS_README.md` - Complete feature documentation
- ✅ `VENUE_FEATURE_GUIDE.md` - Visual and design guide
- ✅ `INTEGRATION_GUIDE.md` - This file

You're all set! 🎉
