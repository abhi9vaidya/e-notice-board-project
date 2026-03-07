import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/integrations/firebase/types';
import {
  getArchivedNotices as fetchArchivedNotices,
  getAllNotices,
  updateNotice,
  deleteNotice
} from '@/integrations/firebase/noticesService';
import type { Notice } from '@/integrations/firebase/types';

export const useArchive = () => {
  const [archivedNotices, setArchivedNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadArchived = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch explicitly archived notices
      const manuallyArchived = await fetchArchivedNotices();

      // Fetch all active notices and identify the expired ones (auto-archived)
      const allUnarchived = await getAllNotices();
      const nowMs = Date.now();
      const expiredNotices = allUnarchived.filter(n => n.isDraft !== true && n.endTime.getTime() < nowMs);

      // Combine and sort them by date
      const combined = [...manuallyArchived, ...expiredNotices]
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      setArchivedNotices(combined);
    } catch (err) {
      console.error('Error fetching archived notices:', err);
      toast({ title: 'Error', description: 'Failed to load archive.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadArchived(); }, [loadArchived]);

  // Restore (sets isArchived back to false, extends endTime if expired)
  const restoreNotice = useCallback(async (id: string): Promise<boolean> => {
    try {
      const notice = archivedNotices.find(n => n.id === id);
      const isExpired = notice && notice.endTime.getTime() < Date.now();

      const updates: Record<string, any> = { isArchived: false };
      if (isExpired) {
        const newEndTime = new Date();
        newEndTime.setDate(newEndTime.getDate() + 7);
        updates.endTime = newEndTime;
      }

      await updateNotice(id, updates);
      toast({
        title: 'Notice restored',
        description: isExpired
          ? 'Notice restored and extended by 7 days.'
          : 'Notice has been restored from archive.'
      });
      await loadArchived();
      return true;
    } catch (err) {
      console.error('Error restoring notice:', err);
      toast({ title: 'Error', description: 'Failed to restore notice.', variant: 'destructive' });
      return false;
    }
  }, [archivedNotices, toast, loadArchived]);

  // Permanently delete from archive
  const deleteFromArchive = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteNotice(id);
      toast({ title: 'Notice deleted', description: 'Notice permanently removed.' });
      await loadArchived();
      return true;
    } catch (err) {
      console.error('Error deleting notice:', err);
      toast({ title: 'Error', description: 'Failed to delete notice.', variant: 'destructive' });
      return false;
    }
  }, [toast, loadArchived]);

  // Clear all archived notices
  const clearArchive = useCallback(async (): Promise<boolean> => {
    try {
      for (const notice of archivedNotices) {
        await deleteNotice(notice.id);
      }
      toast({ title: 'Archive cleared', description: 'All archived notices have been deleted.' });
      await loadArchived();
      return true;
    } catch (err) {
      console.error('Error clearing archive:', err);
      toast({ title: 'Error', description: 'Failed to clear archive.', variant: 'destructive' });
      return false;
    }
  }, [archivedNotices, toast, loadArchived]);

  // Get archive statistics
  const getArchiveStats = useCallback(() => {
    const byCategory = archivedNotices.reduce((acc, notice) => {
      acc[notice.category] = (acc[notice.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMonth = archivedNotices.reduce((acc, notice) => {
      const month = new Date(notice.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { byCategory, byMonth, total: archivedNotices.length };
  }, [archivedNotices]);

  return {
    archivedNotices,
    loading,
    refetch: loadArchived,
    restoreNotice,
    deleteFromArchive,
    clearArchive,
    getArchiveStats,
  };
};
