/**
 * Example Match Flow with Venue Suggestions
 *
 * This file demonstrates how to integrate the venue suggestions feature
 * into your match confirmation flow.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MatchConfirmationScreen from './MatchConfirmationScreen';
import { Match, ScheduledDate, TimeSlot, Venue, User } from '../types';

export default function ExampleMatchFlow() {
  const [showMatchConfirmation, setShowMatchConfirmation] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<ScheduledDate | null>(null);

  // Example data
  const mockUser: User = {
    id: 'user_2',
    name: 'Sarah',
    age: 28,
    bio: 'Coffee enthusiast and weekend hiker',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'],
    occupation: 'Product Designer',
    distance: 3.2,
    availability: [],
    verified: true,
  };

  const mockScheduledDate: ScheduledDate = {
    id: 'scheduled_1',
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
    alternativeSlots: [
      {
        id: 'slot_2',
        userId: 'user_1',
        date: '2026-01-16',
        timeOfDay: 'afternoon',
        startTime: '14:00',
        endTime: '16:00',
        dayName: 'Thursday',
      },
    ],
    status: 'pending_confirmation',
    confirmationDeadline: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    createdAt: new Date(),
  };

  const handleConfirm = () => {
    console.log('Date confirmed!');
    console.log('Selected Venue:', scheduledDate?.selectedVenue);
    console.log('Decide in person:', scheduledDate?.decideVenueInPerson);
    setShowMatchConfirmation(false);
  };

  const handleRequestAlternative = (slot: TimeSlot) => {
    console.log('Alternative time requested:', slot);
    // Update the scheduled date with the new slot
  };

  const handleVenueSelected = (venue: Venue | null, decideInPerson: boolean) => {
    // Update the scheduled date with venue selection
    setScheduledDate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedVenue: venue,
        decideVenueInPerson: decideInPerson,
      };
    });
    console.log('Venue selected:', venue);
    console.log('Decide in person:', decideInPerson);
  };

  const handleClose = () => {
    setShowMatchConfirmation(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example Match Flow</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setScheduledDate(mockScheduledDate);
          setShowMatchConfirmation(true);
        }}
      >
        <Text style={styles.buttonText}>Show Match Confirmation</Text>
      </TouchableOpacity>

      <MatchConfirmationScreen
        visible={showMatchConfirmation}
        matchedUser={mockUser}
        scheduledDate={scheduledDate || mockScheduledDate}
        currentUserId="user_1"
        onConfirm={handleConfirm}
        onRequestAlternative={handleRequestAlternative}
        onVenueSelected={handleVenueSelected}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E63946',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
