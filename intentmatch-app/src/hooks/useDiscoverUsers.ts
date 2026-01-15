import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { DateWindow } from '../types';

export interface DiscoverProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  distance: string;
  bio: string;
  availability: string;
  availabilitySlots: DateWindow[];
  photos: string[];
  verified: boolean;
  alreadyLikedYou?: boolean;
}

export function useDiscoverUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Query users collection
        // Limit to 20 users for now (pagination can be added later)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(20));

        const querySnapshot = await getDocs(q);

        const fetchedUsers: DiscoverProfile[] = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();

          // Exclude current user
          if (doc.id === currentUser.uid) {
            return;
          }

          // Only show users with complete profiles
          if (!userData.name || !userData.age || !userData.bio) {
            return;
          }

          // Transform to DiscoverProfile format
          const profile: DiscoverProfile = {
            id: doc.id,
            name: userData.name,
            age: userData.age,
            occupation: userData.occupation || 'Not specified',
            distance: '-- miles', // TODO: Calculate based on location
            bio: userData.bio,
            availability: 'Check availability', // TODO: Get from availability subcollection
            availabilitySlots: [], // TODO: Fetch from subcollection
            photos: userData.photos && userData.photos.length > 0
              ? userData.photos
              : ['https://i.pravatar.cc/400?img=' + (Math.floor(Math.random() * 70) + 1)],
            verified: userData.verified || false,
            alreadyLikedYou: false, // TODO: Check matches collection
          };

          fetchedUsers.push(profile);
        });

        // Shuffle users for variety
        const shuffled = fetchedUsers.sort(() => Math.random() - 0.5);

        setUsers(shuffled);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const refreshUsers = async () => {
    // Re-fetch users
    setLoading(true);
    // The useEffect will handle the refetch
  };

  return {
    users,
    loading,
    error,
    refreshUsers,
  };
}
