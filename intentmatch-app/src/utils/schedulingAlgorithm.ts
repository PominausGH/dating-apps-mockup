import { TimeSlot, DateWindow, ScheduledDate } from '../types';

/**
 * Converts DateWindow to TimeSlot format for scheduling
 */
export function dateWindowToTimeSlot(
  window: DateWindow,
  userId: string
): TimeSlot {
  const date = new Date(window.date);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

  return {
    id: window.id,
    userId,
    date: window.date,
    timeOfDay: window.timeSlot as 'morning' | 'afternoon' | 'evening',
    startTime: window.startTime,
    endTime: window.endTime,
    dayName,
  };
}

/**
 * Finds overlapping time slots between two users
 */
export function findOverlappingSlots(
  user1Slots: TimeSlot[],
  user2Slots: TimeSlot[]
): TimeSlot[] {
  const overlapping: TimeSlot[] = [];

  for (const slot1 of user1Slots) {
    for (const slot2 of user2Slots) {
      // Check if same date and same time of day
      if (slot1.date === slot2.date && slot1.timeOfDay === slot2.timeOfDay) {
        // Use slot1 as the template (could be either)
        overlapping.push(slot1);
      }
    }
  }

  return overlapping;
}

/**
 * Ranks time slots by preference
 * Returns score between 0-1 (higher is better)
 */
export function rankTimeSlot(slot: TimeSlot): number {
  const now = new Date();
  const slotDate = new Date(slot.date);

  // Days from now (0.4 weight) - earlier is better
  const daysFromNow = Math.ceil((slotDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysScore = Math.max(0, 1 - (daysFromNow / 14)); // Prefer within 2 weeks

  // Time of day preference (0.3 weight) - evening > afternoon > morning
  let timeScore = 0;
  if (slot.timeOfDay === 'evening') timeScore = 1.0;
  else if (slot.timeOfDay === 'afternoon') timeScore = 0.7;
  else timeScore = 0.4; // morning

  // Weekend bonus (0.3 weight) - Friday/Saturday nights get boost
  const dayOfWeek = slotDate.getDay(); // 0 = Sunday, 6 = Saturday
  let weekendScore = 0.5;
  if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
    weekendScore = 1.0;
  } else if (dayOfWeek === 0 || dayOfWeek === 4) { // Sunday or Thursday
    weekendScore = 0.7;
  }

  // Weighted total
  const totalScore = (daysScore * 0.4) + (timeScore * 0.3) + (weekendScore * 0.3);

  return totalScore;
}

/**
 * Sorts time slots by ranking score (best first)
 */
export function sortSlotsByRank(slots: TimeSlot[]): TimeSlot[] {
  return [...slots].sort((a, b) => rankTimeSlot(b) - rankTimeSlot(a));
}

/**
 * Auto-schedules a date between two users
 * Returns the scheduled date object with selected slot and alternatives
 */
export function autoScheduleDate(
  matchId: string,
  user1Id: string,
  user2Id: string,
  user1Availability: DateWindow[],
  user2Availability: DateWindow[]
): ScheduledDate | null {
  // Convert DateWindows to TimeSlots
  const user1Slots = user1Availability.map(w => dateWindowToTimeSlot(w, user1Id));
  const user2Slots = user2Availability.map(w => dateWindowToTimeSlot(w, user2Id));

  // Find overlapping slots
  const overlapping = findOverlappingSlots(user1Slots, user2Slots);

  if (overlapping.length === 0) {
    return null; // No matching availability
  }

  // Rank and sort overlapping slots
  const rankedSlots = sortSlotsByRank(overlapping);

  // Select top slot
  const selectedSlot = rankedSlots[0];

  // Select up to 2 alternatives
  const alternativeSlots = rankedSlots.slice(1, 3);

  // Create confirmation deadline (1 hour from now)
  const confirmationDeadline = new Date();
  confirmationDeadline.setHours(confirmationDeadline.getHours() + 1);

  return {
    id: `scheduled_${matchId}_${Date.now()}`,
    matchId,
    user1Id,
    user2Id,
    selectedSlot,
    alternativeSlots,
    status: 'pending_confirmation',
    confirmationDeadline,
    createdAt: new Date(),
    confirmedByUser1: false,
    confirmedByUser2: false,
  };
}

/**
 * Formats a time slot into a readable string
 * Example: "Saturday, Jan 11 at 7:00 PM"
 */
export function formatTimeSlot(slot: TimeSlot): string {
  const date = new Date(slot.date);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  // Convert 24h to 12h format
  const [hours, minutes] = slot.startTime.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  return `${slot.dayName}, ${month} ${day} at ${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Gets a human-readable time range for a slot
 * Example: "7:00 PM - 9:00 PM"
 */
export function formatTimeRange(slot: TimeSlot): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
}

/**
 * Checks if confirmation deadline has passed
 */
export function isConfirmationExpired(scheduledDate: ScheduledDate): boolean {
  return new Date() > new Date(scheduledDate.confirmationDeadline);
}

/**
 * Auto-confirms date if deadline passed and no objections
 */
export function autoConfirmIfNeeded(scheduledDate: ScheduledDate): ScheduledDate {
  if (
    scheduledDate.status === 'pending_confirmation' &&
    isConfirmationExpired(scheduledDate)
  ) {
    return {
      ...scheduledDate,
      status: 'confirmed',
      confirmedByUser1: true,
      confirmedByUser2: true,
    };
  }
  return scheduledDate;
}
