import { ScheduledDate, DateFeedback } from '../types';

/**
 * Check if the scheduled date time has passed
 */
export function hasDatePassed(scheduledDate: ScheduledDate): boolean {
  const now = new Date();
  const dateTime = new Date(scheduledDate.selectedSlot.date);

  // Parse end time (e.g., "21:00")
  const [hours, minutes] = scheduledDate.selectedSlot.endTime.split(':').map(Number);
  dateTime.setHours(hours, minutes, 0, 0);

  return now > dateTime;
}

/**
 * Check if user has already submitted feedback
 */
export function hasUserSubmittedFeedback(
  scheduledDate: ScheduledDate,
  userId: string
): boolean {
  if (!scheduledDate.feedback) return false;

  if (userId === scheduledDate.user1Id) {
    return !!scheduledDate.feedback.user1;
  }

  if (userId === scheduledDate.user2Id) {
    return !!scheduledDate.feedback.user2;
  }

  return false;
}

/**
 * Check if both users have submitted feedback
 */
export function haveBothUsersSubmittedFeedback(scheduledDate: ScheduledDate): boolean {
  return !!(
    scheduledDate.feedback?.user1 &&
    scheduledDate.feedback?.user2
  );
}

/**
 * Calculate accountability score based on showing up
 */
export function calculateAccountabilityScore(
  currentScore: number = 100,
  showedUp: boolean
): number {
  if (showedUp) {
    // Increase score by 5, max 100
    return Math.min(100, currentScore + 5);
  } else {
    // Decrease score by 15, min 0
    return Math.max(0, currentScore - 15);
  }
}

/**
 * Check if users both showed up
 */
export function didBothUsersShowUp(scheduledDate: ScheduledDate): boolean {
  if (!haveBothUsersSubmittedFeedback(scheduledDate)) return false;

  const user1Feedback = scheduledDate.feedback!.user1!;
  const user2Feedback = scheduledDate.feedback!.user2!;

  return (
    user1Feedback.didMeetInPerson === 'yes' &&
    user2Feedback.didMeetInPerson === 'yes'
  );
}

/**
 * Get accountability badge text based on score
 */
export function getAccountabilityBadge(score: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (score >= 95) {
    return { label: 'Excellent', color: '#10B981', emoji: '⭐' };
  } else if (score >= 85) {
    return { label: 'Great', color: '#10B981', emoji: '✓' };
  } else if (score >= 70) {
    return { label: 'Good', color: '#F59E0B', emoji: '👍' };
  } else if (score >= 50) {
    return { label: 'Fair', color: '#F59E0B', emoji: '⚠️' };
  } else {
    return { label: 'Needs Improvement', color: '#EF4444', emoji: '❌' };
  }
}

/**
 * Check if feedback prompt should be shown
 */
export function shouldShowFeedbackPrompt(
  scheduledDate: ScheduledDate,
  userId: string
): boolean {
  // Date must be confirmed
  if (scheduledDate.status !== 'confirmed') return false;

  // Date time must have passed
  if (!hasDatePassed(scheduledDate)) return false;

  // User must not have submitted feedback yet
  if (hasUserSubmittedFeedback(scheduledDate, userId)) return false;

  return true;
}

/**
 * Format time remaining until date
 */
export function getTimeUntilDate(scheduledDate: ScheduledDate): string {
  const now = new Date();
  const dateTime = new Date(scheduledDate.selectedSlot.date);
  const [hours, minutes] = scheduledDate.selectedSlot.startTime.split(':').map(Number);
  dateTime.setHours(hours, minutes, 0, 0);

  const diff = dateTime.getTime() - now.getTime();

  if (diff < 0) {
    return 'Date has passed';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `in ${days} day${days > 1 ? 's' : ''}`;
  } else if (hoursRemaining > 0) {
    return `in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`;
  } else {
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
  }
}
