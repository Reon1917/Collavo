import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColorTheme } from '@/lib/themes/definitions';
import { applyTheme } from '@/lib/themes/utils';

interface ThemeState {
  theme: ColorTheme;
  isLoading: boolean;
  previewTheme: ColorTheme | null;
  
  // Actions
  setTheme: (theme: ColorTheme) => void;
  applyThemeToDocument: (theme: ColorTheme, isDark: boolean) => void;
  syncWithServer: (userId: string, theme: ColorTheme) => Promise<void>;
  loadUserTheme: (userId: string) => Promise<void>;
  
  // Preview actions
  previewThemeChange: (theme: ColorTheme, isDark: boolean) => void;
  clearPreview: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'default',
      isLoading: false,
      previewTheme: null,

      setTheme: (theme: ColorTheme) => {
        set({ theme });
      },

      applyThemeToDocument: (theme: ColorTheme, isDark: boolean) => {
        applyTheme(theme, isDark);
        set({ theme });
      },

      syncWithServer: async (userId: string, theme: ColorTheme) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/user/theme-preference', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ theme }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync theme with server');
          }

          set({ theme, isLoading: false });
        } catch (error) {
          console.error('Error syncing theme:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      loadUserTheme: async (userId: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/user/theme-preference');
          
          if (response.ok) {
            const data = await response.json();
            const theme = data.theme as ColorTheme;
            set({ theme, isLoading: false });
            
            // Apply the loaded theme
            const isDark = document.documentElement.classList.contains('dark');
            applyTheme(theme, isDark);
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error loading user theme:', error);
          set({ isLoading: false });
        }
      },

      previewThemeChange: (theme: ColorTheme, isDark: boolean) => {
        applyTheme(theme, isDark);
        set({ previewTheme: theme });
      },

      clearPreview: (isDark: boolean) => {
        const { theme } = get();
        applyTheme(theme, isDark);
        set({ previewTheme: null });
      },
    }),
    {
      name: 'collavo-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);