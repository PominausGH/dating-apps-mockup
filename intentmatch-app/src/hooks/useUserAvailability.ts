import { useState, useEffect } from 'react';
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { DateWindow } from '../types';

export function useUserAvailability() {
  const { currentUser } = useAuth();
  const [availability, setAvailability] = useState<DateWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setAvailability([]);
      setLoading(false);
      return;
    }

    // Subscribe to availability changes in real-time
    const availabilityRef = collection(db, 'users', currentUser.uid, 'availability');

    const unsubscribe = onSnapshot(
      availabilityRef,
      (snapshot) => {
        const slots: DateWindow[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          slots.push({
            id: doc.id,
            date: data.date,
            timeSlot: data.timeSlot,
            label: data.label,
            startTime: data.startTime,
            endTime: data.endTime,
          });
        });

        // Sort by date
        slots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setAvailability(slots);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching availability:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return {
    availability,
    loading,
    error,
  };
}
