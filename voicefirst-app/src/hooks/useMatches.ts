import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToMatches } from '../services/matchService';
import { VoiceMatch } from '../types';

export function useMatches() {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<VoiceMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToMatches(currentUser.uid, (fetchedMatches) => {
      setMatches(fetchedMatches);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return {
    matches,
    loading,
    error,
    totalCount: matches.length,
  };
}
