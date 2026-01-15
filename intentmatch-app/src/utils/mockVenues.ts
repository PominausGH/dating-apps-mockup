import { Venue } from '../types';

// Mock coordinates for demonstration (San Francisco area)
export const MOCK_USER_COORDINATES = {
  user1: { latitude: 37.7749, longitude: -122.4194 }, // Downtown SF
  user2: { latitude: 37.7849, longitude: -122.4094 }, // North Beach
};

// Calculate midpoint between two coordinates
export const calculateMidpoint = (
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): { latitude: number; longitude: number } => {
  return {
    latitude: (coord1.latitude + coord2.latitude) / 2,
    longitude: (coord1.longitude + coord2.longitude) / 2,
  };
};

// Mock venues for different time slots
export const MORNING_AFTERNOON_VENUES: Venue[] = [
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
  },
  {
    id: 'venue_2',
    name: 'Sightglass Coffee',
    type: 'coffee_shop',
    category: 'Coffee Roasters',
    address: '270 7th St, San Francisco, CA 94103',
    distance: 0.5,
    rating: 4.6,
    reviewCount: 2156,
    priceLevel: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
    coordinates: {
      latitude: 37.7779,
      longitude: -122.4104,
    },
  },
  {
    id: 'venue_3',
    name: 'The Mill',
    type: 'cafe',
    category: 'Bakery & Coffee',
    address: '736 Divisadero St, San Francisco, CA 94117',
    distance: 0.7,
    rating: 4.4,
    reviewCount: 987,
    priceLevel: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80',
    coordinates: {
      latitude: 37.7819,
      longitude: -122.4244,
    },
  },
  {
    id: 'venue_4',
    name: 'Philz Coffee',
    type: 'coffee_shop',
    category: 'Coffee Shop',
    address: '748 Van Ness Ave, San Francisco, CA 94102',
    distance: 0.4,
    rating: 4.3,
    reviewCount: 1876,
    priceLevel: '$',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    coordinates: {
      latitude: 37.7829,
      longitude: -122.4204,
    },
  },
  {
    id: 'venue_5',
    name: 'Tartine Bakery',
    type: 'cafe',
    category: 'Bakery & Cafe',
    address: '600 Guerrero St, San Francisco, CA 94110',
    distance: 0.6,
    rating: 4.7,
    reviewCount: 3421,
    priceLevel: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&q=80',
    coordinates: {
      latitude: 37.7759,
      longitude: -122.4244,
    },
  },
];

export const EVENING_VENUES: Venue[] = [
  {
    id: 'venue_6',
    name: 'Foreign Cinema',
    type: 'restaurant',
    category: 'California Cuisine',
    address: '2534 Mission St, San Francisco, CA 94110',
    distance: 0.8,
    rating: 4.6,
    reviewCount: 2543,
    priceLevel: '$$$',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
    coordinates: {
      latitude: 37.7589,
      longitude: -122.4194,
    },
  },
  {
    id: 'venue_7',
    name: 'Beretta',
    type: 'restaurant',
    category: 'Italian Tapas',
    address: '1199 Valencia St, San Francisco, CA 94110',
    distance: 0.5,
    rating: 4.5,
    reviewCount: 1876,
    priceLevel: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    coordinates: {
      latitude: 37.7549,
      longitude: -122.4204,
    },
  },
  {
    id: 'venue_8',
    name: 'Trick Dog',
    type: 'bar',
    category: 'Craft Cocktails',
    address: '3010 20th St, San Francisco, CA 94110',
    distance: 0.6,
    rating: 4.7,
    reviewCount: 3198,
    priceLevel: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
    coordinates: {
      latitude: 37.7579,
      longitude: -122.4124,
    },
  },
  {
    id: 'venue_9',
    name: 'ABV',
    type: 'bar',
    category: 'Wine Bar',
    address: '3174 16th St, San Francisco, CA 94103',
    distance: 0.4,
    rating: 4.4,
    reviewCount: 1234,
    priceLevel: '$$',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
    coordinates: {
      latitude: 37.7649,
      longitude: -122.4214,
    },
  },
  {
    id: 'venue_10',
    name: 'Nopa',
    type: 'restaurant',
    category: 'American Contemporary',
    address: '560 Divisadero St, San Francisco, CA 94117',
    distance: 0.7,
    rating: 4.5,
    reviewCount: 2765,
    priceLevel: '$$$',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4374,
    },
  },
];

// Get venue suggestions based on time of day
export const getVenueSuggestions = (timeOfDay: 'morning' | 'afternoon' | 'evening'): Venue[] => {
  const venues = timeOfDay === 'evening' ? EVENING_VENUES : MORNING_AFTERNOON_VENUES;

  // Return 4 random venues
  const shuffled = [...venues].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
};

// Get icon name for venue type
export const getVenueIcon = (type: Venue['type']): string => {
  switch (type) {
    case 'coffee_shop':
      return 'cafe-outline';
    case 'cafe':
      return 'cafe-outline';
    case 'restaurant':
      return 'restaurant-outline';
    case 'bar':
      return 'wine-outline';
    case 'lounge':
      return 'wine-outline';
    default:
      return 'location-outline';
  }
};
