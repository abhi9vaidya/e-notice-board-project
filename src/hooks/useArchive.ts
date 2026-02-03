import { useState, useCallback, useEffect } from 'react';
import { Notice } from '@/types/notice';

export interface ArchivedNotice extends Notice {
  archivedAt: Date;
  archivedBy: string;
}

const ARCHIVE_STORAGE_KEY = 'notice-archive';

export const useArchive = () => {
  const [archivedNotices, setArchivedNotices] = useState<ArchivedNotice[]>(() => {
    const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((notice: ArchivedNotice) => ({
          ...notice,
          startTime: new Date(notice.startTime),
          endTime: new Date(notice.endTime),
          createdAt: new Date(notice.createdAt),
          updatedAt: new Date(notice.updatedAt),
          archivedAt: new Date(notice.archivedAt),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archivedNotices));
  }, [archivedNotices]);

  // Archive a notice
  const archiveNotice = useCallback((notice: Notice, archivedBy: string) => {
    const archived: ArchivedNotice = {
      ...notice,
      archivedAt: new Date(),
      archivedBy,
    };
    setArchivedNotices(prev => [archived, ...prev]);
  }, []);

  // Restore from archive
  const restoreNotice = useCallback((id: string): Notice | null => {
    const archived = archivedNotices.find(n => n.id === id);
    if (archived) {
      const { archivedAt, archivedBy, ...notice } = archived;
      setArchivedNotices(prev => prev.filter(n => n.id !== id));
      return notice;
    }
    return null;
  }, [archivedNotices]);

  // Permanently delete from archive
  const deleteFromArchive = useCallback((id: string) => {
    setArchivedNotices(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all archived notices
  const clearArchive = useCallback(() => {
    setArchivedNotices([]);
  }, []);

  // Get archive statistics
  const getArchiveStats = useCallback(() => {
    const byCategory = archivedNotices.reduce((acc, notice) => {
      acc[notice.category] = (acc[notice.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMonth = archivedNotices.reduce((acc, notice) => {
      const month = new Date(notice.archivedAt).toLocaleDateString('en-US', { 
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
    archiveNotice,
    restoreNotice,
    deleteFromArchive,
    clearArchive,
    getArchiveStats,
  };
};
