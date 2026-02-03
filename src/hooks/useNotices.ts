import { useState, useCallback, useMemo } from 'react';
import { Notice, Category, Priority, Template } from '@/types/notice';
import { mockNotices } from '@/data/mockNotices';
import { useArchive } from './useArchive';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from './useNotifications';

// TODO: Replace with Firebase Firestore hooks when integrating backend

export interface NoticeFormData {
  title: string;
  description: string;
  category: Category;
  customCategory?: string;
  priority: Priority;
  template: Template;
  facultyName: string;
  imageUrl?: string;
  startTime: Date;
  endTime: Date;
}

const NOTICES_STORAGE_KEY = 'active-notices';

// Load notices from localStorage or use mock data
const loadNotices = (): Notice[] => {
  const stored = localStorage.getItem(NOTICES_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((notice: Notice) => ({
        ...notice,
        startTime: new Date(notice.startTime),
        endTime: new Date(notice.endTime),
        createdAt: new Date(notice.createdAt),
        updatedAt: new Date(notice.updatedAt),
      }));
    } catch {
      return mockNotices;
    }
  }
  return mockNotices;
};

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>(loadNotices);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { archiveNotice } = useArchive();
  const { faculty } = useAuth();
  const { notifyNewNotice } = useNotifications();

  // Persist notices to localStorage
  const persistNotices = useCallback((updatedNotices: Notice[]) => {
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(updatedNotices));
  }, []);

  // Filter out expired notices and apply category filter
  const filteredNotices = useMemo(() => {
    const now = new Date();
    return notices
      .filter(notice => new Date(notice.endTime) > now)
      .filter(notice => selectedCategory === 'all' || notice.category === selectedCategory)
      .sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [notices, selectedCategory]);

  // Check if notice was created/updated within last 5 hours
  const isRecent = useCallback((notice: Notice): boolean => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    return new Date(notice.updatedAt) > fiveHoursAgo;
  }, []);

  // Add new notice
  const addNotice = useCallback((data: NoticeFormData) => {
    const newNotice: Notice = {
      ...data,
      id: `notice-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotices(prev => {
      const updated = [newNotice, ...prev];
      persistNotices(updated);
      return updated;
    });
    
    // Send notification for new notice
    notifyNewNotice(data.title, data.priority);
  }, [persistNotices, notifyNewNotice]);

  // Update existing notice
  const updateNotice = useCallback((id: string, data: Partial<NoticeFormData>) => {
    setNotices(prev => {
      const updated = prev.map(notice =>
        notice.id === id
          ? { ...notice, ...data, updatedAt: new Date() }
          : notice
      );
      persistNotices(updated);
      return updated;
    });
  }, [persistNotices]);

  // Delete notice (moves to archive)
  const deleteNotice = useCallback((id: string) => {
    const noticeToArchive = notices.find(n => n.id === id);
    if (noticeToArchive) {
      archiveNotice(noticeToArchive, faculty?.name || 'Unknown');
    }
    setNotices(prev => {
      const updated = prev.filter(notice => notice.id !== id);
      persistNotices(updated);
      return updated;
    });
  }, [notices, archiveNotice, faculty?.name, persistNotices]);

  return {
    notices: filteredNotices,
    allNotices: notices,
    selectedCategory,
    setSelectedCategory,
    isRecent,
    addNotice,
    updateNotice,
    deleteNotice,
  };
};
