import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { autoArchiveExpiredNotices } from '@/integrations/firebase/noticesService';

const RUN_INTERVAL_MS = 5 * 60 * 1000;

export const useNoticeExpiryArchiver = () => {
  const { isAuthenticated, faculty } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !faculty) return;

    const runSweep = async () => {
      try {
        await autoArchiveExpiredNotices({
          userId: faculty.id,
          isAdmin: faculty.role === 'admin',
        });
      } catch (error) {
        console.error('Auto-archive sweep failed:', error);
      }
    };

    void runSweep();
    const intervalId = window.setInterval(() => {
      void runSweep();
    }, RUN_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, faculty?.id, faculty?.role]);
};
