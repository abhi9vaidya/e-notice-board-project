import { useCallback, useEffect, useState } from 'react';

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
  }, []);

  const saveSettings = useCallback((next: TVDisplaySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors.
    }
    setSettings(next);
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

  return { settings, updateSettings, saveSettings, defaults: TV_SETTINGS_DEFAULTS };
}
