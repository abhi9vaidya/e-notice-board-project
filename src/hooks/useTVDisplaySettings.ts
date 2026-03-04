import { useState, useEffect, useCallback } from 'react';

/**
 * TV Display mode controls:
 *  - 'single'  → classic single-notice slideshow (one at a time)
 *  - 'multi'   → multi-notice overview: high-priority + notice grid + achievements
 *  - 'auto'    → alternates between single & multi on a configurable timer
 */
export type TVDisplayMode = 'single' | 'multi' | 'auto';

export interface TVDisplaySettings {
  /** Which layout mode to use */
  displayMode: TVDisplayMode;

  // ── Single mode: per-priority slide durations (seconds) ──────────────────
  singleHighDuration: number;
  singleMediumDuration: number;
  singleNormalDuration: number;

  // ── Multi mode ────────────────────────────────────────────────────────────
  /** How many seconds each "page" of the NOTICES grid shows before flipping */
  multiNoticePageDuration: number;
  /** How many notice cards to show per row in the multi-view grid */
  multiNoticesPerRow: 2 | 3;
  /** How many seconds each high-priority notice is shown in the multi-view */
  multiHighDuration: number;
  /** How many seconds each achievement spotlight is shown in the multi-view */
  multiAchievementDuration: number;

  // ── Auto-switch mode ──────────────────────────────────────────────────────
  /** Seconds to stay in single-slide view before auto-switching to multi view */
  autoSingleDuration: number;
  /** Seconds to stay in multi-notice view before auto-switching to single view */
  autoMultiDuration: number;
  /** Whether to start in single or multi mode when the TV loads */
  autoStartMode: 'single' | 'multi';
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
};

const STORAGE_KEY = 'rbu-tv-display-settings';

export function useTVDisplaySettings() {
  const [settings, setSettings] = useState<TVDisplaySettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...TV_SETTINGS_DEFAULTS, ...JSON.parse(raw) };
    } catch {
      // ignore malformed JSON
    }
    return { ...TV_SETTINGS_DEFAULTS };
  });

  /** Persist a partial settings patch to localStorage and state */
  const updateSettings = useCallback((patch: Partial<TVDisplaySettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  /** Save the full settings object — e.g. from a bulk save button */
  const saveSettings = useCallback((next: TVDisplaySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setSettings(next);
  }, []);

  // Listen for cross-tab changes (Settings page → TV display in another tab)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSettings({ ...TV_SETTINGS_DEFAULTS, ...JSON.parse(e.newValue) });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { settings, updateSettings, saveSettings, defaults: TV_SETTINGS_DEFAULTS };
}
