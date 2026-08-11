import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LanguageMode = 'zh' | 'en';

interface AppState {
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  activeModule: string;
  setActiveModule: (mod: string) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (vol: number) => void;
  streakDays: number;
  incrementStreak: () => void;
  favorites: string[]; // List of favorite IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  offlineCache: Record<string, any>;
  setOfflineCache: (key: string, data: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'zh',
      setLanguage: (lang: LanguageMode) => set({ language: lang }),
      activeModule: 'pronunciation',
      setActiveModule: (mod: string) => set({ activeModule: mod }),
      muted: false,
      setMuted: (muted: boolean) => set({ muted }),
      volume: 0.3,
      setVolume: (volume: number) => set({ volume }),
      streakDays: 1,
      incrementStreak: () => set((state) => ({ streakDays: state.streakDays + 1 })),
      favorites: [],
      toggleFavorite: (id: string) =>
        set((state) => {
          const exists = state.favorites.includes(id);
          return {
            favorites: exists
              ? state.favorites.filter((item) => item !== id)
              : [...state.favorites, id],
          };
        }),
      isFavorite: (id: string) => get().favorites.includes(id),
      offlineCache: {},
      setOfflineCache: (key: string, data: any) =>
        set((state) => ({
          offlineCache: { ...state.offlineCache, [key]: data },
        })),
    }),
    {
      name: 'linguaforge-storage',
    }
  )
);
