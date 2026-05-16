import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export type TVDisplayMode = 'single' | 'multi' | 'auto';

export interface TVDisplaySettings {
  displayMode: TVDisplayMode;
  singleHighDuration: number;
  singleMediumDuration: number;
  singleNormalDuration: number;
  multiNoticePageDuration: number;
  multiNoticesPerRow: 2 | 3;
  multiHighDuration: number;
  multiAchievementDuration: number;
  autoSingleDuration: number;
  autoMultiDuration: number;
  autoStartMode: 'single' | 'multi';
  tvTheme: 'dark' | 'light';
  tvSafeAreaPercent: number;
  tvUiScalePercent: number;
  tvFontScalePercent: number;
}

export const TV_SETTINGS_DEFAULTS: TVDisplaySettings = {
  displayMode: 'single',
  singleHighDuration: 18,
  singleMediumDuration: 13,
  singleNormalDuration: 10,
  multiNoticePageDuration: 15,
  multiNoticesPerRow: 3,
  multiHighDuration: 20,
  multiAchievementDuration: 20,
  autoSingleDuration: 120,
  autoMultiDuration: 60,
  autoStartMode: 'single',
  tvTheme: 'dark',
  tvSafeAreaPercent: 4,
  tvUiScalePercent: 105,
  tvFontScalePercent: 100,
};

const STORAGE_KEY = 'rbu-tv-display-settings';

export function useTVDisplaySettings() {
  const [settings, setSettings] = useState<TVDisplaySettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...TV_SETTINGS_DEFAULTS, ...JSON.parse(raw) };
    } catch {
      // Ignore malformed JSON.
    }

    return { ...TV_SETTINGS_DEFAULTS };
  });

  const [loading, setLoading] = useState(true);

  // Sync state with Firestore in real-time
  useEffect(() => {
    const docRef = doc(db, 'settings', 'tv_display');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSettings((prev) => {
            const next = { ...prev, ...data } as TVDisplaySettings;
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
              // Ignore quota errors.
            }
            return next;
          });
        }
      },
      (error) => {
        console.error('Error listening to TV display settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = useCallback((patch: Partial<TVDisplaySettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota errors.
      }
      return next;
    });

    // Persist to Firestore asynchronously
    const docRef = doc(db, 'settings', 'tv_display');
    return setDoc(docRef, patch, { merge: true });
  }, []);

  const saveSettings = useCallback((next: TVDisplaySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors.
    }
    setSettings(next);

    // Persist to Firestore asynchronously
    const docRef = doc(db, 'settings', 'tv_display');
    return setDoc(docRef, next, { merge: true });
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      try {
        setSettings({ ...TV_SETTINGS_DEFAULTS, ...JSON.parse(event.newValue) });
      } catch {
        // Ignore malformed JSON from other tabs.
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { settings, updateSettings, saveSettings, defaults: TV_SETTINGS_DEFAULTS, loading };
}
