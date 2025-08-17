"use client";

import * as React from "react";

export type ColorTheme = 'default' | 'purple' | 'forest';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = React.createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = React.useState<ColorTheme>('default');

  const setColorTheme = React.useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-purple', 'theme-forest');
    
    // Add new theme class if not default
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    // Store preference in localStorage
    localStorage.setItem('color-theme', theme);
  }, []);

  // Initialize theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme') as ColorTheme;
    if (savedTheme && ['default', 'purple', 'forest'].includes(savedTheme)) {
      setColorTheme(savedTheme);
    }
  }, [setColorTheme]);

  const value = React.useMemo(
    () => ({
      colorTheme,
      setColorTheme,
    }),
    [colorTheme, setColorTheme]
  );

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = React.useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}
