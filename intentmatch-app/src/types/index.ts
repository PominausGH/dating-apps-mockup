export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  occupation: string;
  distance: number;
  availability: DateWindow[];
  verified: boolean;
}

export interface UserProfile extends User {
  email: string;
  accountabilityScore: number;
  dateCount: number;
  rating: number;
  primaryPhotoUrl?: string;
  profileCompleted?: boolean;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  matchRate?: number;
  totalDates?: number;
  avgRating?: number;
  isActive?: boolean;
  isPremium?: boolean;
  premiumExpiresAt?: Date;
  createdAt: Date;
  lastActiveAt: Date;
  searchPreferences?: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    gender: 'male' | 'female' | 'any';
  };
}

export interface DateWindow {
  id: string;
  date: string; // ISO date string
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  label: string;
  startTime: string; // "09:00"
  endTime: string; // "12:00"
}

export interface TimeSlot {
  id: string;
  userId: string;
  date: string; // ISO date: "2026-01-15"
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  startTime: string; // "18:00"
  endTime: string; // "21:00"
  dayName: string; // "Saturday"
}

export interface Match {
  id: string;
  user: User;
  matchedAt: string;
  lastMessageAt?: string;
  scheduledDate?: ScheduledDate;
  chatExpiresAt: string;
  unreadCount?: number;
  accountabilityScore?: number; // 0-100, based on showing up to dates
}

export interface ScheduledDate {
  id: string;
  matchId: string;
  user1Id: string;
  user2Id: string;
  selectedSlot: TimeSlot;
  alternativeSlots: TimeSlot[];
  status: 'pending_confirmation' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  venuesSuggested?: Venue[];
  selectedVenue?: Venue | null;
  decideVenueInPerson?: boolean;
  scheduledFor?: Date;
  confirmationDeadline: Date;
  createdAt: Date;
  autoConfirmedAt?: Date;
  completedAt?: Date;
  confirmedByUser1?: boolean;
  confirmedByUser2?: boolean;
  feedback?: {
    user1?: DateFeedback;
    user2?: DateFeedback;
  };
}

export interface Venue {
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

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  createdAt?: Date;
  readAt?: Date;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Profile: { userId: string };
  Chat: { matchId: string };
  ScheduleDate: { matchId: string };
  DateFeedback: { matchId: string; scheduledDateId: string };
};

export type MainTabParamList = {
  Discover: undefined;
  Matches: undefined;
  Availability: undefined;
  Settings: undefined;
};

// Date Feedback Types
export interface DateFeedback {
  userId: string;
  dateId: string;
  rating: number; // 1-5 stars
  didMeetInPerson: 'yes' | 'no' | 'rescheduled';
  dateQuality: 'great' | 'good' | 'okay' | 'not_good';
  wouldSeeAgain: 'yes' | 'maybe' | 'no';
  additionalFeedback?: string;
  submittedAt: Date;
}

export interface AccountabilityUpdate {
  userId: string;
  showedUp: boolean;
  dateId: string;
  timestamp: Date;
}
