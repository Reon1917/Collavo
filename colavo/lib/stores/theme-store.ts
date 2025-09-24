import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColorTheme } from '@/lib/themes/definitions';
import { applyTheme } from '@/lib/themes/utils';

interface ThemeState {
  theme: ColorTheme;
  isLoading: boolean;
  
  // Actions
  setTheme: (theme: ColorTheme) => void;
  applyThemeToDocument: (theme: ColorTheme, isDark: boolean) => void;
  syncWithServer: (userId: string, theme: ColorTheme) => Promise<void>;
  loadUserTheme: (userId: string) => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      isLoading: false,

      setTheme: (theme: ColorTheme) => {
        set({ theme });
      },

      applyThemeToDocument: (theme: ColorTheme, isDark: boolean) => {
        applyTheme(theme, isDark);
        set({ theme });
      },

      syncWithServer: async (_userId: string, theme: ColorTheme) => {
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
            await response.json().catch(() => ({}));
            // Failed to sync theme with server
            // Don't throw error - continue with local theme change
          }

          set({ theme, isLoading: false });
        } catch {
          // Error syncing theme with server
          // Still set the theme locally even if server sync fails
          set({ theme, isLoading: false });
          // Don't throw the error - let the theme change succeed locally
        }
      },

      loadUserTheme: async () => {
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
        } catch {
          // Error loading user theme
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'collavo-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);