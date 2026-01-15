import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export interface MatchData {
  id: string;
  name: string;
  photo: string;
  lastMessage?: string;
  scheduledDate?: string;
  expiresIn?: string;
  unread: boolean;
  matchedAt: Date;
  hasMessages: boolean;
}

export interface NewMatchData {
  id: string;
  name: string;
  photo: string;
}

export function useMatches() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [newMatches, setNewMatches] = useState<NewMatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setMatches([]);
      setNewMatches([]);
      setLoading(false);
      return;
    }

    // Query matches where current user is involved
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('userIds', 'array-contains', currentUser.uid),
      orderBy('matchedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const matchesWithMessages: MatchData[] = [];
          const matchesWithoutMessages: NewMatchData[] = [];

          for (const matchDoc of snapshot.docs) {
            const matchData = matchDoc.data();
            const otherUserId = matchData.user1Id === currentUser.uid
              ? matchData.user2Id
              : matchData.user1Id;

            // Get other user's profile
            const userRef = doc(db, 'users', otherUserId);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            const hasMessages = matchData.lastMessageAt != null;
            const unreadCount = matchData.unreadCount?.[currentUser.uid] || 0;

            // Format scheduled date if exists
            let scheduledDateStr: string | undefined;
            if (matchData.scheduledDate?.selectedSlot) {
              const slot = matchData.scheduledDate.selectedSlot;
              scheduledDateStr = `${slot.dayName} ${slot.startTime}`;
              if (matchData.scheduledDate.selectedVenue?.name) {
                scheduledDateStr += ` @ ${matchData.scheduledDate.selectedVenue.name}`;
              }
            }

            // Calculate expiration if no date scheduled
            let expiresIn: string | undefined;
            if (!matchData.scheduledDate && matchData.confirmationDeadline) {
              const deadline = matchData.confirmationDeadline.toDate();
              const now = new Date();
              const diff = deadline.getTime() - now.getTime();
              if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                expiresIn = `${hours} hours left to schedule`;
              }
            }

            if (hasMessages) {
              matchesWithMessages.push({
                id: matchDoc.id,
                name: userData?.name || 'Unknown',
                photo: userData?.primaryPhotoUrl || userData?.photos?.[0] || 'https://i.pravatar.cc/100',
                lastMessage: matchData.lastMessageText,
                scheduledDate: scheduledDateStr,
                expiresIn,
                unread: unreadCount > 0,
                matchedAt: matchData.matchedAt?.toDate() || new Date(),
                hasMessages: true,
              });
            } else {
              matchesWithoutMessages.push({
                id: matchDoc.id,
                name: userData?.name || 'Unknown',
                photo: userData?.primaryPhotoUrl || userData?.photos?.[0] || 'https://i.pravatar.cc/100',
              });
            }
          }

          setMatches(matchesWithMessages);
          setNewMatches(matchesWithoutMessages);
          setError(null);
        } catch (err: any) {
          console.error('Error processing matches:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching matches:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return {
    matches,
    newMatches,
    loading,
    error,
    totalCount: matches.length + newMatches.length,
  };
}
