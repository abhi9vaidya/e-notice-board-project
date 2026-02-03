import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const useNotifications = () => {
  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Send browser notification
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    // Always show toast for in-app notification with custom styling
    toast.success(title, {
      description: body,
      duration: 8000,
      position: 'top-right',
      style: {
        background: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        border: 'none',
      },
    });

    // Also try browser notification
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'notice-notification-' + Date.now(),
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.log('Browser notification failed:', err);
      }
    }
  }, []);

  // Notify about new notice
  const notifyNewNotice = useCallback((noticeTitle: string, priority: string) => {
    const urgentPrefix = priority === 'high' ? '🚨 URGENT: ' : '';
    sendNotification(
      `${urgentPrefix}New Notice Added`,
      noticeTitle,
    );
  }, [sendNotification]);

  // Initialize on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    requestPermission,
    sendNotification,
    notifyNewNotice,
  };
};
