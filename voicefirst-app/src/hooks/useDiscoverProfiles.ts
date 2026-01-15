import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { VoiceProfile } from '../types';

export function useDiscoverProfiles() {
  const { currentUser } = useAuth();
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      try {
        setLoading(true);

        // Get users who have voice intros
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('voiceIntroUri', '!=', ''),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const fetchedProfiles: VoiceProfile[] = [];

        // Get already swiped users to exclude
        const swipesRef = collection(db, 'swipes');
        const swipesQuery = query(swipesRef, where('swiperId', '==', currentUser.uid));
        const swipesSnapshot = await getDocs(swipesQuery);
        const swipedUserIds = new Set(swipesSnapshot.docs.map(d => d.data().targetId));

        for (const userDoc of querySnapshot.docs) {
          // Exclude current user and already swiped
          if (userDoc.id === currentUser.uid || swipedUserIds.has(userDoc.id)) {
            continue;
          }

          const userData = userDoc.data();

          // Only include users with voice intros
          if (!userData.voiceIntroUri) continue;

          fetchedProfiles.push({
            id: userDoc.id,
            name: 'Mystery Match', // Name hidden until match
            age: userData.age || 0,
            distance: '-- miles away', // TODO: Calculate from location
            tagline: userData.bio || 'Voice intro available',
            voiceDuration: userData.voiceIntroDuration || 30,
            voiceUri: userData.voiceIntroUri,
            photoBlurred: true,
            photoRevealLevel: 0,
            photos: userData.photos || [],
          });
        }

        // Shuffle for variety
        const shuffled = fetchedProfiles.sort(() => Math.random() - 0.5);
        setProfiles(shuffled);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching profiles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUser]);

  const refreshProfiles = () => {
    setLoading(true);
    // Re-trigger useEffect
  };

  return {
    profiles,
    loading,
    error,
    refreshProfiles,
  };
}
