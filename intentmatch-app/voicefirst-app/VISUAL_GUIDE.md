# VoiceFirst App - Visual Guide

A visual walkthrough of the progressive photo blur/reveal system.

## Blur Progression Visual

### 0 Messages - Completely Hidden (100% Blur)

```
┌────────────────────────────────┐
│                                │
│         ███████████            │
│         ███████████            │
│         ███████████            │
│            🔒                   │
│     "Send a message            │
│       to reveal"               │
│                                │
│         ███████████            │
│         ███████████            │
│         ███████████            │
└────────────────────────────────┘
```

**User sees**: Lock icon, complete blur
**Blur intensity**: 100%
**Progress**: 0%

---

### 1-2 Messages - Highly Blurred (80% Blur)

```
┌────────────────────────────────┐
│                                │
│         ████████░░             │
│         ████████░░             │
│         ████████░░             │
│         ████████░░             │
│         ████████░░             │
│                                │
│    ▓░░░░░░░░░   12% unlocked  │
└────────────────────────────────┘
```

**User sees**: Slight outline visible, progress bar
**Blur intensity**: 80%
**Progress**: 12% (1 msg) or 25% (2 msgs)
**Hint**: "Send 3 messages to reveal more"

---

### 3-4 Messages - Partially Visible (50% Blur)

```
┌────────────────────────────────┐
│                                │
│         █████░░░░░             │
│         █████░░░░░             │
│         █████░░░░░             │
│         █████░░░░░             │
│         █████░░░░░             │
│                                │
│    ▓▓▓▓▓░░░░░   50% unlocked  │
└────────────────────────────────┘
```

**User sees**: Face shape visible, some features
**Blur intensity**: 50%
**Progress**: 37% (3 msgs) or 50% (4 msgs)
**Hint**: "Send 5 messages to reveal more"

---

### 5-7 Messages - Mostly Clear (20% Blur)

```
┌────────────────────────────────┐
│                                │
│         ██░░░░░░░░             │
│         ██░░░░░░░░             │
│         ██░░░░░░░░             │
│         ██░░░░░░░░             │
│         ██░░░░░░░░             │
│                                │
│    ▓▓▓▓▓▓▓░░░   75% unlocked  │
└────────────────────────────────┘
```

**User sees**: Details visible, slight blur
**Blur intensity**: 20%
**Progress**: 62% (5 msgs) to 87% (7 msgs)
**Hint**: "Send 8 messages to fully unlock"

---

### 8+ Messages - Fully Revealed (0% Blur)

```
┌────────────────────────────────┐
│                                │
│         ░░░░░░░░░░             │
│         ░░░░░░░░░░             │
│      ✨  PHOTO UNLOCKED!  ✨   │
│                                │
│         ░░░░░░░░░░             │
│         ░░░░░░░░░░             │
│                                │
│    ▓▓▓▓▓▓▓▓▓▓  100% unlocked  │
└────────────────────────────────┘
```

**User sees**: Crystal clear photo, celebration
**Blur intensity**: 0%
**Progress**: 100%
**Celebration**: "Photo Unlocked! You've built a great connection"

---

## Screen Layouts

### DiscoverScreen Layout

```
┌─────────────────────────────────────┐
│  VoiceFirst                    ⚙    │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐    │
│   │                           │    │
│   │    ██████████████████     │    │
│   │    ██████████████████     │    │
│   │    ██ 100% BLURRED ██     │    │
│   │    ██████████████████     │    │
│   │    ██████████████████     │    │
│   │         🔒                │    │
│   │                           │    │
│   │  Sarah, 28                │    │
│   │  📍 2.3 miles             │    │
│   │  💼 Product Designer      │    │
│   │                           │    │
│   │  🔒 Photo reveals after   │    │
│   │     you match and chat    │    │
│   └───────────────────────────┘    │
│                                     │
│        ❌      ⭐      ❤️           │
└─────────────────────────────────────┘
```

**Note**: All photos are 100% blurred in discovery

---

### MatchesScreen Layout

```
┌─────────────────────────────────────┐
│  Matches  (6)                       │
├─────────────────────────────────────┤
│  ℹ️ Photos unlock as you exchange   │
│     messages                        │
├─────────────────────────────────────┤
│  New Matches                        │
│                                     │
│  [██]    [██]    [██]              │
│  NEW     NEW     NEW               │
│  Sophia  Ava     Mia               │
├─────────────────────────────────────┤
│  Conversations                      │
│                                     │
│  [░░] Sarah           🔴           │
│      10/8 messages                 │
│      📅 Saturday 7pm               │
│                                     │
│  [██] Emma                         │
│  ░░░ 5/8 messages                  │
│      📅 Sunday 2pm                 │
│                                     │
│  [███] Jessica        🔴           │
│  ████░░░ 2/8 messages              │
│      ⏰ 18 hours left              │
│                                     │
│  [███] Olivia         🔴           │
│  ███████████ 0/8                   │
│      "Just matched!"               │
└─────────────────────────────────────┘
```

**Note**: Different blur levels based on message count

---

### ChatScreen Layout

```
┌─────────────────────────────────────┐
│  ← [██] Sarah    ℹ️                 │
│     ░░░ 62% revealed                │
├─────────────────────────────────────┤
│  📅 Date Scheduled!                 │
│     Saturday 7pm @ Blue Bottle     │
├─────────────────────────────────────┤
│  ✨ Send 3 more messages to unlock  │
├─────────────────────────────────────┤
│                                     │
│  "Hey! Excited to meet!"       Them │
│  2:30 PM                            │
│                                     │
│                        "Me too!" Me │
│                            2:32 PM  │
│                                     │
│  "Let's go to Blue Bottle"    Them │
│  2:35 PM                            │
│                                     │
├─────────────────────────────────────┤
│  ➕  [Type a message...]       ↗️  │
└─────────────────────────────────────┘
```

**Note**: Header photo shows current blur level

---

### BlurDemoScreen Layout

```
┌─────────────────────────────────────┐
│  Progressive Blur Demo              │
│  VoiceFirst Photo Reveal System     │
├─────────────────────────────────────┤
│                                     │
│       ┌─────────────────┐           │
│       │                 │           │
│       │   ███████       │           │
│       │   Photo with    │           │
│       │   Blur Effect   │           │
│       │                 │           │
│       │ ▓▓▓▓░░  62%     │           │
│       └─────────────────┘           │
│                                     │
│  Messages: 5  Blur: 20%  Progress: 62%│
├─────────────────────────────────────┤
│  Controls:                          │
│                                     │
│      ➖   5 messages   ➕           │
│                                     │
│         [Reset to 0]                │
│                                     │
│  Quick Presets:                     │
│  [0 msgs]  [2 msgs]  [4 msgs]      │
│  [7 msgs]  [8 msgs]                │
├─────────────────────────────────────┤
│  Features:                          │
│  ✓ Progressive blur reduction       │
│  ✓ Animated transitions             │
│  ✓ Progress indicator               │
│  ✓ Celebration animation            │
└─────────────────────────────────────┘
```

**Note**: Interactive demo for testing

---

## Animation Sequences

### Message Send Animation

```
User sends message
       ↓
┌─────────────┐
│   Frame 1   │  Header photo at current blur
│   Scale: 1  │  (e.g., 50% blur, 4 messages)
└─────────────┘
       ↓
┌─────────────┐
│   Frame 2   │  Slight scale up
│  Scale: 1.1 │  Green overlay appears
│     🔓      │  "Unlocking..."
└─────────────┘
       ↓
┌─────────────┐
│   Frame 3   │  Blur reduces
│   Scale: 1  │  (Now 20% blur, 5 messages)
│             │  Progress bar animates
└─────────────┘
       ↓
Complete!
```

**Duration**: ~500ms
**Triggers**: At milestones (1, 3, 5, 8 messages)

---

### Unlock Celebration Animation

```
Message 8 sent
       ↓
┌─────────────┐
│   Frame 1   │  Photo at 20% blur
│  Opacity: 0 │  Celebration overlay hidden
└─────────────┘
       ↓
┌─────────────┐
│   Frame 2   │  Blur drops to 0%
│  Scale: 0.5 │  Overlay starts appearing
│  Opacity: 0 │
└─────────────┘
       ↓
┌─────────────┐
│   Frame 3   │  Gradient overlay visible
│   Scale: 1  │      ✨
│  Opacity: 1 │  "Photo Unlocked!"
│             │  You've built a connection
└─────────────┘
       ↓ (stays 2 seconds)
┌─────────────┐
│   Frame 4   │  Overlay fades out
│   Scale: 1  │  Clear photo remains
│  Opacity: 0 │
└─────────────┘
       ↓
Complete!
```

**Duration**: ~3 seconds total
**Triggers**: Only at 8th message

---

## Progress Bar Visualization

### Progress Bar States

**0 Messages (0%)**
```
[░░░░░░░░░░] 0% unlocked
```

**2 Messages (25%)**
```
[▓▓░░░░░░░░] 25% unlocked
```

**4 Messages (50%)**
```
[▓▓▓▓▓░░░░░] 50% unlocked
```

**6 Messages (75%)**
```
[▓▓▓▓▓▓▓▓░░] 75% unlocked
```

**8 Messages (100%)**
```
[▓▓▓▓▓▓▓▓▓▓] 100% unlocked
```

---

## User Journey Flowchart

```
START
  │
  ▼
┌────────────┐
│  Discover  │  Swipe profiles
│   Screen   │  Photos 100% blurred
└─────┬──────┘
      │ Swipe Right
      ▼
┌────────────┐
│  Match!    │  Other user also liked you
└─────┬──────┘
      │
      ▼
┌────────────┐
│   Matches  │  See match in list
│   Screen   │  Photo still blurred
└─────┬──────┘
      │ Tap to chat
      ▼
┌────────────┐
│    Chat    │  Send 1st message
│   Screen   │  Blur: 100% → 80%
└─────┬──────┘  Animation: ✓
      │
      ├─► Send 2nd message
      │   Blur: 80% (no change)
      │
      ├─► Send 3rd message
      │   Blur: 80% → 50%
      │   Animation: ✓
      │
      ├─► Send 4th message
      │   Blur: 50% (no change)
      │
      ├─► Send 5th message
      │   Blur: 50% → 20%
      │   Animation: ✓
      │
      ├─► Send 6-7 messages
      │   Blur: 20% (no change)
      │
      └─► Send 8th message
          Blur: 20% → 0%
          Animation: ✓
          Celebration: ✓
          │
          ▼
      ┌────────────┐
      │  Unlocked  │  Photo fully visible
      │   Forever  │  Continue chatting
      └────────────┘
```

---

## Component Layers

### BlurredPhoto Component Layers (Z-Index)

```
Layer 5 (Top)
┌─────────────────────────────────────┐
│   Celebration Overlay (z-index: 5)  │
│   [Conditional: unlocked]           │
│   - Gradient background             │
│   - Sparkles icon                   │
│   - "Photo Unlocked!" text          │
└─────────────────────────────────────┘

Layer 4
┌─────────────────────────────────────┐
│   Progress Bar (z-index: 4)         │
│   [Conditional: !unlocked]          │
│   - Progress bar background         │
│   - Filled portion (animated)       │
│   - Percentage text                 │
└─────────────────────────────────────┘

Layer 3
┌─────────────────────────────────────┐
│   Lock Icon (z-index: 3)            │
│   [Conditional: messageCount === 0] │
│   - Lock icon                       │
│   - "Send a message" text           │
└─────────────────────────────────────┘

Layer 2
┌─────────────────────────────────────┐
│   BlurView (z-index: 2)             │
│   [Conditional: blurIntensity > 0]  │
│   - Blur overlay                    │
│   - Dynamic intensity               │
└─────────────────────────────────────┘

Layer 1 (Bottom)
┌─────────────────────────────────────┐
│   Base Image (z-index: 1)           │
│   [Always visible]                  │
│   - Profile photo                   │
└─────────────────────────────────────┘
```

---

## Color Scheme

### Primary Colors

- **Primary Red**: `#E63946` - Main brand color
- **Secondary Navy**: `#1D3557` - Text, headers
- **Accent Orange**: `#F4A261` - Highlights
- **Success Green**: `#10B981` - Progress, success states
- **Light Background**: `#F1FAEE` - Screen backgrounds

### Blur Overlay

- **Tint**: Light (iOS) / Default (Android)
- **Gradient**: `rgba(0,0,0,0)` → `rgba(0,0,0,0.8)`

### Celebration Gradient

- **Start**: `rgba(230, 57, 70, 0.95)` (Primary Red)
- **End**: `rgba(244, 162, 97, 0.95)` (Accent Orange)

---

## Icon Reference

- 🔒 **Lock Closed**: Locked photo (messageCount: 0)
- 🔓 **Lock Open**: Unlocking animation
- ✨ **Sparkles**: Celebration, photo unlocked
- 📅 **Calendar**: Scheduled date
- ⏰ **Time**: Expiring match
- 🔴 **Red Dot**: Unread messages
- ➕ **Plus**: Add action
- ➖ **Minus**: Remove action
- ↗️ **Send Arrow**: Send message
- ← **Back Arrow**: Navigation back
- ⚙ **Settings**: Settings/filters
- ℹ️ **Info**: Information banner

---

## Responsive Sizing

### Photo Sizes by Context

**Discovery Card**
- Width: Screen width - 40px
- Height: 60% of screen height
- Border radius: 20px

**Match List Item**
- Width: 60px
- Height: 60px
- Border radius: 30px (circular)

**New Match Thumbnail**
- Width: 70px
- Height: 70px
- Border radius: 35px (circular)

**Chat Header**
- Width: 40px
- Height: 40px
- Border radius: 20px (circular)

**Demo Screen**
- Width: 300px
- Height: 400px
- Border radius: 20px

---

## Accessibility

### Screen Reader Descriptions

**0 messages**:
> "Sarah's profile photo, completely hidden. Send a message to start revealing the photo."

**5 messages**:
> "Sarah's profile photo, 62% revealed. Send 3 more messages to fully unlock."

**8+ messages**:
> "Sarah's profile photo, fully revealed."

### Color Contrast

All text meets WCAG AA standards:
- White text on primary red: 4.5:1
- Navy text on light background: 12.5:1
- Success green on light background: 3.2:1

---

This visual guide provides a comprehensive overview of how the progressive blur system works and appears to users throughout their journey.
