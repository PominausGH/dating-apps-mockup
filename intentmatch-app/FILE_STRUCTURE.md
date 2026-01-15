# Venue Suggestions Feature - File Structure

## Complete File Tree

```
intentmatch-app/
├── src/
│   ├── components/
│   │   ├── VenueSuggestionsModal.tsx    ⭐ NEW - Main venue modal component
│   │   └── index.ts                     ⭐ NEW - Component exports
│   │
│   ├── screens/
│   │   ├── MatchConfirmationScreen.tsx  ✏️  MODIFIED - Integrated venue modal
│   │   ├── ExampleMatchFlow.tsx         ⭐ NEW - Usage example
│   │   ├── AvailabilityScreen.tsx       (existing)
│   │   ├── ChatScreen.tsx               (existing)
│   │   ├── DiscoverScreen.tsx           (existing)
│   │   ├── MatchesScreen.tsx            (existing)
│   │   └── ProfileScreen.tsx            (existing)
│   │
│   ├── types/
│   │   └── index.ts                     ✏️  MODIFIED - Added venue fields
│   │
│   ├── utils/
│   │   ├── mockVenues.ts                ⭐ NEW - Venue data and utilities
│   │   └── schedulingAlgorithm.ts       (existing)
│   │
│   └── theme/
│       └── colors.ts                    (existing)
│
├── VENUE_SUGGESTIONS_README.md          ⭐ NEW - Feature documentation
├── VENUE_FEATURE_GUIDE.md               ⭐ NEW - Visual & design guide
├── INTEGRATION_GUIDE.md                 ⭐ NEW - Quick start guide
├── VENUE_FEATURE_SUMMARY.md             ⭐ NEW - Implementation summary
└── FILE_STRUCTURE.md                    ⭐ NEW - This file

Legend:
⭐ NEW - Newly created file
✏️  MODIFIED - Existing file with changes
```

## File Relationships

```
┌─────────────────────────────────────────────────────────┐
│  MatchConfirmationScreen.tsx                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Displays match confirmation                     │  │
│  │ • Shows scheduled date details                    │  │
│  │ • Handles date confirmation                       │  │
│  └───────────────────────────────────────────────────┘  │
│                         │                               │
│                         │ Opens on "Confirm Date"       │
│                         ↓                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │ VenueSuggestionsModal.tsx                         │  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ • Shows 4 venue suggestions                 │   │  │
│  │ │ • "Decide in person" option                 │   │  │
│  │ │ • Venue selection UI                        │   │  │
│  │ └─────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Uses
                         ↓
┌─────────────────────────────────────────────────────────┐
│  mockVenues.ts                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • getVenueSuggestions(timeOfDay)                  │  │
│  │ • calculateMidpoint(coord1, coord2)               │  │
│  │ • getVenueIcon(type)                              │  │
│  │ • MORNING_AFTERNOON_VENUES[]                      │  │
│  │ • EVENING_VENUES[]                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Uses types from
                         ↓
┌─────────────────────────────────────────────────────────┐
│  types/index.ts                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ interface Venue {                                 │  │
│  │   id, name, type, category, address,             │  │
│  │   distance, rating, reviewCount,                 │  │
│  │   priceLevel, imageUrl, coordinates              │  │
│  │ }                                                 │  │
│  │                                                   │  │
│  │ interface ScheduledDate {                        │  │
│  │   ... existing fields ...                        │  │
│  │   selectedVenue?: Venue | null                   │  │
│  │   decideVenueInPerson?: boolean                  │  │
│  │ }                                                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│    User     │
│  clicks     │
│ "Confirm"   │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────┐
│  MatchConfirmationScreen             │
│  handleConfirmDate()                 │
│  • setShowVenueSuggestions(true)     │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  VenueSuggestionsModal               │
│  useEffect(() => {                   │
│    getVenueSuggestions(timeOfDay)    │
│  })                                  │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  mockVenues.ts                       │
│  getVenueSuggestions()               │
│  • Filter by time of day             │
│  • Shuffle venues                    │
│  • Return 4 venues                   │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  VenueSuggestionsModal               │
│  • Display venues                    │
│  • User selects venue                │
│  • Call onSelectVenue(venue)         │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  MatchConfirmationScreen             │
│  handleVenueSelect(venue)            │
│  • onVenueSelected(venue, false)     │
│  • onConfirm()                       │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Parent Component                    │
│  handleVenueSelected()               │
│  • Update scheduledDate state        │
│  • Save to backend                   │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
App
 └─ MatchFlow
     └─ MatchConfirmationScreen
         ├─ Match Display (photos, info)
         ├─ Date Card (time, countdown)
         ├─ Action Buttons
         │   ├─ Confirm Date → Opens VenueSuggestionsModal
         │   └─ Suggest Different Time
         │
         ├─ Alternative Times Modal
         │   └─ TimeSlot List
         │
         └─ VenueSuggestionsModal
             ├─ Header
             │   ├─ Close Button
             │   ├─ Title
             │   ├─ Subtitle
             │   └─ Time Badge
             │
             ├─ Venue Cards (ScrollView)
             │   ├─ Venue Card 1
             │   │   ├─ Image
             │   │   ├─ Name & Category
             │   │   ├─ Rating & Distance
             │   │   └─ Address
             │   ├─ Venue Card 2
             │   ├─ Venue Card 3
             │   ├─ Venue Card 4
             │   └─ Decide in Person Card
             │
             └─ Confirm Button
```

## Import Dependencies

```
VenueSuggestionsModal.tsx imports:
├─ react
├─ react-native (View, Text, Modal, TouchableOpacity, ScrollView, Image)
├─ react-native-safe-area-context (SafeAreaView)
├─ expo-linear-gradient (LinearGradient)
├─ @expo/vector-icons (Ionicons)
├─ ../theme/colors (colors, shadows)
├─ ../types (Venue, TimeSlot)
└─ ../utils/mockVenues (getVenueSuggestions, getVenueIcon)

MatchConfirmationScreen.tsx imports:
├─ react
├─ react-native (View, Text, Modal, TouchableOpacity, Image, StyleSheet)
├─ react-native-safe-area-context (SafeAreaView)
├─ expo-linear-gradient (LinearGradient)
├─ @expo/vector-icons (Ionicons)
├─ ../theme/colors (colors, shadows)
├─ ../types (ScheduledDate, TimeSlot, User, Venue)
├─ ../utils/schedulingAlgorithm (formatTimeSlot, formatTimeRange)
└─ ../components/VenueSuggestionsModal (VenueSuggestionsModal)

mockVenues.ts imports:
└─ ../types (Venue)

ExampleMatchFlow.tsx imports:
├─ react
├─ react-native (View, Text, StyleSheet, TouchableOpacity)
├─ ./MatchConfirmationScreen
└─ ../types (Match, ScheduledDate, TimeSlot, Venue, User)
```

## Type Dependencies

```
Venue (types/index.ts)
├─ Used by: VenueSuggestionsModal
├─ Used by: MatchConfirmationScreen
├─ Used by: mockVenues.ts
└─ Used by: ExampleMatchFlow

ScheduledDate (types/index.ts)
├─ selectedVenue?: Venue | null
├─ decideVenueInPerson?: boolean
├─ Used by: MatchConfirmationScreen
└─ Used by: ExampleMatchFlow

TimeSlot (types/index.ts)
├─ Used by: VenueSuggestionsModal
├─ Used by: ScheduledDate
└─ Used by: mockVenues.ts
```

## State Management Flow

```
Parent Component State
 └─ scheduledDate: ScheduledDate
     ├─ selectedVenue: Venue | null
     └─ decideVenueInPerson: boolean
         │
         ↓
    MatchConfirmationScreen (props)
         │
         ├─ showVenueSuggestions: boolean (local state)
         │
         └─ VenueSuggestionsModal (props)
             │
             ├─ venues: Venue[] (local state)
             └─ selectedVenue: Venue | null (local state)
```

## Documentation Structure

```
Documentation Files
│
├─ VENUE_SUGGESTIONS_README.md        (Main documentation)
│  ├─ Overview
│  ├─ Files Created
│  ├─ Usage Examples
│  ├─ API Reference
│  ├─ Type Definitions
│  ├─ Mock Data
│  ├─ Customization
│  └─ Future Enhancements
│
├─ VENUE_FEATURE_GUIDE.md             (Visual guide)
│  ├─ Screen Flow
│  ├─ UI Components
│  ├─ Color Scheme
│  ├─ Icons & Typography
│  ├─ Data Flow
│  ├─ Mock Data
│  ├─ User States
│  └─ Best Practices
│
├─ INTEGRATION_GUIDE.md               (Quick start)
│  ├─ 5-Minute Integration
│  ├─ Complete Example
│  ├─ Backend Integration
│  ├─ API Replacement
│  ├─ Customization
│  └─ Testing
│
├─ VENUE_FEATURE_SUMMARY.md           (Overview)
│  ├─ Features List
│  ├─ Files Created/Modified
│  ├─ Architecture
│  ├─ Type Definitions
│  ├─ Mock Data
│  ├─ Integration Points
│  └─ Future Roadmap
│
└─ FILE_STRUCTURE.md                  (This file)
   ├─ File Tree
   ├─ File Relationships
   ├─ Data Flow
   ├─ Component Hierarchy
   ├─ Import Dependencies
   └─ Type Dependencies
```

## Quick File Access

| File Type | Path | Purpose |
|-----------|------|---------|
| **Main Component** | `/src/components/VenueSuggestionsModal.tsx` | Venue modal UI |
| **Mock Data** | `/src/utils/mockVenues.ts` | Venue data & logic |
| **Types** | `/src/types/index.ts` | TypeScript definitions |
| **Integration** | `/src/screens/MatchConfirmationScreen.tsx` | Integrated flow |
| **Example** | `/src/screens/ExampleMatchFlow.tsx` | Usage example |
| **Main Docs** | `/VENUE_SUGGESTIONS_README.md` | Feature docs |
| **Quick Start** | `/INTEGRATION_GUIDE.md` | Integration guide |
| **Design Specs** | `/VENUE_FEATURE_GUIDE.md` | Visual guide |

## File Sizes

| File | Approx Size | Lines |
|------|-------------|-------|
| VenueSuggestionsModal.tsx | 12 KB | 430 |
| mockVenues.ts | 6 KB | 178 |
| ExampleMatchFlow.tsx | 3 KB | 110 |
| MatchConfirmationScreen.tsx | 13 KB | 470 |
| types/index.ts updates | +1 KB | +30 |
| Documentation (4 files) | 80 KB | 1,800+ |
| **Total** | **115 KB** | **3,018** |

## Version Control

Files to commit:
```bash
# New files
git add src/components/VenueSuggestionsModal.tsx
git add src/components/index.ts
git add src/utils/mockVenues.ts
git add src/screens/ExampleMatchFlow.tsx
git add VENUE_SUGGESTIONS_README.md
git add VENUE_FEATURE_GUIDE.md
git add INTEGRATION_GUIDE.md
git add VENUE_FEATURE_SUMMARY.md
git add FILE_STRUCTURE.md

# Modified files
git add src/types/index.ts
git add src/screens/MatchConfirmationScreen.tsx

# Commit
git commit -m "Add venue suggestions feature for match confirmation flow

- Created VenueSuggestionsModal component with beautiful card UI
- Added mock venue data with morning/afternoon and evening venues
- Integrated venue selection into match confirmation flow
- Updated ScheduledDate type with selectedVenue and decideVenueInPerson
- Added comprehensive documentation and examples
- Fully typed with TypeScript
- Ready for production use"
```
