import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/context/AuthContext';

export interface PendingRecord {
  id: string;
  name: string;
  email: string;
  department: string;
}

export const usePendingRequests = () => {
  const { faculty } = useAuth();
  const [pending, setPending] = useState<PendingRecord[]>([]);

  useEffect(() => {
    // Only admins should listen for pending requests
    if (faculty?.role !== 'admin') {
      setPending([]);
      return;
    }

    const q = query(collection(db, 'profiles'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const records: PendingRecord[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? 'Unknown',
          email: data.email ?? '',
          department: data.department ?? '',
        };
      });
      setPending(records);
    });

    return () => unsubscribe();
  }, [faculty?.role]);

  return pending;
};
