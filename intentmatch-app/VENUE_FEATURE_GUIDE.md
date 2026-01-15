# Venue Suggestions Feature - Visual Guide

## Screen Flow

```
┌─────────────────────────────────────┐
│   Match Confirmation Screen         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    It's a Match! ❤️          │   │
│  │                             │   │
│  │    [User Photo]             │   │
│  │                             │   │
│  │    Your Date:               │   │
│  │    Wednesday, Jan 15        │   │
│  │    10:00 AM - 12:00 PM      │   │
│  │                             │   │
│  │  [Confirm Date Button] ←────┼───┐
│  │  [Suggest Different Time]   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
                                      │
                                      │ User clicks
                                      │ "Confirm Date"
                                      ↓
┌─────────────────────────────────────┐
│  Venue Suggestions Modal            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     📍 Choose a Venue       │   │
│  │                             │   │
│  │  Perfect coffee shops for   │   │
│  │  your date                  │   │
│  │  [Morning Date]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Venue Photo]               │   │
│  │                             │   │
│  │ Blue Bottle Coffee          │   │
│  │ ☕ Coffee & Tea              │   │
│  │ ⭐ 4.5 (1,243) 📍 0.3 mi $$  │   │
│  │ 66 Mint St, San Francisco   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [3 more venue cards...]            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  👥 We'll Decide in Person  │   │
│  │  Choose your venue together │   │
│  │  when you meet              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Confirm Blue Bottle Coffee]       │
└─────────────────────────────────────┘
```

## UI Components Breakdown

### 1. Venue Card Structure

```
┌────────────────────────────────────────┐
│                                        │
│         [High-quality photo]           │ ← 180px height
│         with gradient overlay          │   Unsplash placeholder
│                                        │
├────────────────────────────────────────┤
│                                        │
│  Venue Name (Bold, 20px)               │
│  ☕ Category (13px, gray)               │
│                                        │
│  ⭐ 4.5 (1,243)  📍 0.3 mi  $$         │ ← Rating, distance, price
│                                        │
│  📍 Full Address in gray box           │
│                                        │
└────────────────────────────────────────┘
```

When selected:
- Green border (3px)
- Checkmark badge in top-right
- Slightly elevated shadow

### 2. Decide in Person Card

```
┌────────────────────────────────────────┐
│                                        │
│           👥 (64px icon)               │
│                                        │
│    We'll Decide in Person (18px)      │
│                                        │
│  Choose your venue together when      │
│  you meet (14px, gray)                │
│                                        │
└────────────────────────────────────────┘
```

When selected:
- Orange accent border
- Light orange background tint
- Checkmark indicator

### 3. Confirm Button States

**With Venue Selected:**
```
┌────────────────────────────────────────┐
│  Confirm Blue Bottle Coffee    →      │
└────────────────────────────────────────┘
```

**Without Venue:**
```
┌────────────────────────────────────────┐
│  Continue Without Venue    →           │
└────────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Primary Red**: `#E63946` - Confirm buttons, selection states
- **Secondary Navy**: `#1D3557` - Background gradient, text
- **Accent Orange**: `#F4A261` - Icons, badges, highlights
- **Success Green**: `#10B981` - Selection indicators

### Semantic Colors
- **Warning**: `#F59E0B` - Timer, urgent actions
- **Gray Scale**: `#6B7280` to `#1F2937` - Supporting text

### Gradients
1. **Modal Background**: Navy (`#1D3557`) to Blue (`#457B9D`)
2. **Match Screen**: Red (`#E63946`) to Dark Red (`#c1121f`)
3. **Image Overlay**: Transparent to `rgba(0,0,0,0.7)`

## Venue Type Icons

| Venue Type     | Icon                | Category Examples        |
|---------------|---------------------|-------------------------|
| Coffee Shop   | `cafe-outline`      | Blue Bottle, Philz      |
| Cafe          | `cafe-outline`      | Tartine, The Mill       |
| Restaurant    | `restaurant-outline`| Foreign Cinema, Nopa    |
| Bar           | `wine-outline`      | Trick Dog, ABV          |
| Lounge        | `wine-outline`      | Wine bars, lounges      |

## Time-Based Suggestions

### Morning & Afternoon Dates (6 AM - 6 PM)
**Venue Types:**
- Coffee shops
- Cafes
- Bakeries
- Tea houses

**Example Venues:**
1. Blue Bottle Coffee - $$
2. Sightglass Coffee - $$
3. The Mill (Bakery) - $$
4. Philz Coffee - $
5. Tartine Bakery - $$

### Evening Dates (6 PM - 12 AM)
**Venue Types:**
- Restaurants
- Bars
- Wine bars
- Lounges

**Example Venues:**
1. Foreign Cinema - $$$
2. Beretta (Italian) - $$
3. Trick Dog (Cocktails) - $$
4. ABV (Wine Bar) - $$
5. Nopa (American) - $$$

## Data Flow

```
1. User confirms date
   ↓
2. VenueSuggestionsModal appears
   ↓
3. getVenueSuggestions(timeOfDay) called
   ↓
4. Display 4 random venues from pool
   ↓
5. User selects venue or "decide in person"
   ↓
6. onVenueSelected(venue, decideInPerson) callback
   ↓
7. Update ScheduledDate object:
   - scheduledDate.selectedVenue = venue
   - scheduledDate.decideVenueInPerson = true/false
   ↓
8. onConfirm() callback
   ↓
9. Save to backend
```

## Mock Data Structure

### User Coordinates (Midpoint Calculation)
```typescript
const user1Coords = { latitude: 37.7749, longitude: -122.4194 }; // Downtown SF
const user2Coords = { latitude: 37.7849, longitude: -122.4094 }; // North Beach
const midpoint = calculateMidpoint(user1Coords, user2Coords);
// Result: { latitude: 37.7799, longitude: -122.4144 }
```

### Sample Venue Object
```typescript
{
  id: 'venue_1',
  name: 'Blue Bottle Coffee',
  type: 'coffee_shop',
  category: 'Coffee & Tea',
  address: '66 Mint St, San Francisco, CA 94103',
  distance: 0.3,
  rating: 4.5,
  reviewCount: 1243,
  priceLevel: '$$',
  imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  coordinates: {
    latitude: 37.7799,
    longitude: -122.4144,
  },
}
```

## User Interaction States

### State 1: Initial Load
- Modal slides up from bottom
- Header shows "Choose a Venue"
- Time badge shows "Morning Date" or "Evening Date"
- All venue cards rendered
- No selection (neutral state)

### State 2: Venue Selected
- Selected card has green border
- Checkmark appears on card
- Button text changes to "Confirm [Venue Name]"
- Other cards remain selectable

### State 3: Decide in Person Selected
- "Decide in Person" card highlighted
- Orange border and tint
- Button text: "Continue Without Venue"
- Venue cards remain selectable

### State 4: Confirming
- Button pressed
- Modal dismisses
- Callback fires with selection
- Parent screen processes confirmation

## Responsive Design

### Card Width
```typescript
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // 20px padding on each side
```

### Image Heights
- Venue photo: 180px fixed
- Icon containers: 64px diameter circles
- Venue cards: Auto height based on content

### Spacing
- Modal padding: 20px horizontal
- Card gap: 16px between cards
- Internal padding: 16-24px
- Bottom safe area: Handled by SafeAreaView

## Accessibility Features

### Text Contrast
- White text on dark backgrounds (Navy gradient)
- Dark text on white cards
- Minimum 4.5:1 contrast ratio

### Touch Targets
- All buttons minimum 44x44 points
- Card touch area: Full card height/width
- Clear visual feedback on press

### Screen Readers
- Venue cards: Announces name, rating, distance
- Selection state: Announces when selected
- Buttons: Clear action labels

## Animation States

### Modal Entrance
```typescript
animationType="slide" // Bottom to top slide
```

### Card Selection
```typescript
activeOpacity={0.8} // Subtle press feedback
```

### Gradient Overlays
```typescript
colors={['transparent', 'rgba(0,0,0,0.7)']}
// Smooth gradient on images
```

## Error States (Future Enhancement)

### No Venues Available
```
┌────────────────────────────────────────┐
│                                        │
│         😕                             │
│                                        │
│    No venues found nearby              │
│                                        │
│    Try "Decide in Person" or          │
│    adjust your location                │
│                                        │
└────────────────────────────────────────┘
```

### Loading State
```
┌────────────────────────────────────────┐
│                                        │
│         ⏳                             │
│                                        │
│    Finding great spots nearby...      │
│                                        │
└────────────────────────────────────────┘
```

## Best Practices

1. **Always provide "Decide in Person" option**
   - Reduces pressure on users
   - Allows flexibility
   - Prevents decision paralysis

2. **Show real distance**
   - Calculate from midpoint between users
   - Display in miles or km based on locale
   - Filter venues within reasonable distance (< 2 miles)

3. **Quality photos**
   - Use high-resolution images
   - Show interior/ambiance
   - Avoid stock photos when possible

4. **Accurate information**
   - Verify venue is still open
   - Check current ratings
   - Confirm address accuracy
   - Show price range

5. **Performance**
   - Lazy load images
   - Cache venue data
   - Preload common venues
   - Quick modal animations

## Integration Checklist

- [ ] Import VenueSuggestionsModal component
- [ ] Add onVenueSelected callback prop
- [ ] Update ScheduledDate state with venue selection
- [ ] Show modal after date confirmation
- [ ] Handle "decide in person" option
- [ ] Save venue selection to backend
- [ ] Test with morning/afternoon/evening times
- [ ] Verify image loading
- [ ] Test selection states
- [ ] Check responsive layout on different screen sizes

## Quick Start

```tsx
// 1. Import
import VenueSuggestionsModal from './components/VenueSuggestionsModal';

// 2. Add state
const [showVenues, setShowVenues] = useState(false);
const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

// 3. Render
<VenueSuggestionsModal
  visible={showVenues}
  timeSlot={scheduledDate.selectedSlot}
  onSelectVenue={(venue) => {
    setSelectedVenue(venue);
    setShowVenues(false);
  }}
  onDecideInPerson={() => {
    setSelectedVenue(null);
    setShowVenues(false);
  }}
  onClose={() => setShowVenues(false)}
/>
```

Done!
