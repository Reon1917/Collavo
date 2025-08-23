export type ColorTheme = 'default' | 'amoled' | 'creative' | 'energy' | 'daylight' | 'graphite' | 'accessible';

export const ALLOWED_COLOR_THEMES = ['default', 'amoled', 'creative', 'energy', 'daylight', 'graphite', 'accessible'] as const satisfies readonly ColorTheme[];

export interface ThemeColors {
  name: string;
  displayName: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  light: {
    // Base colors
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    
    // Brand colors
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    
    // UI colors
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    
    // Interactive
    border: string;
    input: string;
    ring: string;
    
    // Chart colors
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    
    // Sidebar
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
    sidebarHover: string;
    sidebarHoverForeground: string;
  };
  dark: {
    // Base colors
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    
    // Brand colors
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    
    // UI colors
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    
    // Interactive
    border: string;
    input: string;
    ring: string;
    
    // Chart colors
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    
    // Sidebar
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
    sidebarHover: string;
    sidebarHoverForeground: string;
  };
}

export const themeDefinitions: Record<ColorTheme, ThemeColors> = {
  default: {
    name: 'default',
    displayName: 'Ocean Blue',
    description: 'Clean and professional teal theme',
    preview: {
      primary: '#008080',
      secondary: '#00FFFF',
      accent: '#f0efea'
    },
    light: {
      background: '#f9f8f0',
      foreground: 'oklch(0.129 0.042 264.695)',
      card: '#f9f8f0',
      cardForeground: 'oklch(0.129 0.042 264.695)',
      popover: '#f9f8f0',
      popoverForeground: 'oklch(0.129 0.042 264.695)',
      primary: '#008080',
      primaryForeground: '#ffffff',
      secondary: '#00FFFF',
      secondaryForeground: 'oklch(0.129 0.042 264.695)',
      muted: '#f0efea',
      mutedForeground: 'oklch(0.554 0.046 257.417)',
      accent: '#f0efea',
      accentForeground: '#008080',
      destructive: 'oklch(0.577 0.245 27.325)',
      destructiveForeground: '#ffffff',
      border: '#e5e4dd',
      input: '#e5e4dd',
      ring: '#008080',
      chart1: 'oklch(0.646 0.222 41.116)',
      chart2: 'oklch(0.6 0.118 184.704)',
      chart3: 'oklch(0.398 0.07 227.392)',
      chart4: 'oklch(0.828 0.189 84.429)',
      chart5: 'oklch(0.769 0.188 70.08)',
      sidebar: '#f9f8f0',
      sidebarForeground: 'oklch(0.129 0.042 264.695)',
      sidebarPrimary: '#008080',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#00FFFF',
      sidebarAccentForeground: 'oklch(0.129 0.042 264.695)',
      sidebarBorder: '#e5e4dd',
      sidebarRing: '#008080',
      sidebarHover: '#f0efea',
      sidebarHoverForeground: '#008080',
    },
    dark: {
      background: '#121212',
      foreground: '#f9f8f0',
      card: '#1e1e1e',
      cardForeground: '#f9f8f0',
      popover: '#1e1e1e',
      popoverForeground: '#f9f8f0',
      primary: '#008080',
      primaryForeground: '#ffffff',
      secondary: '#00FFFF',
      secondaryForeground: '#121212',
      muted: '#2a2a2a',
      mutedForeground: '#a1a1a1',
      accent: '#2a2a2a',
      accentForeground: '#00FFFF',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#333333',
      input: '#333333',
      ring: '#00FFFF',
      chart1: '#008080',
      chart2: '#00FFFF',
      chart3: '#0ea5e9',
      chart4: '#8b5cf6',
      chart5: '#ec4899',
      sidebar: '#1e1e1e',
      sidebarForeground: '#f9f8f0',
      sidebarPrimary: '#008080',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#00FFFF',
      sidebarAccentForeground: '#121212',
      sidebarBorder: '#333333',
      sidebarRing: '#00FFFF',
      sidebarHover: '#2a2a2a',
      sidebarHoverForeground: '#00FFFF',
    }
  },
  
  amoled: {
    name: 'amoled',
    displayName: 'Vercel Black',
    description: 'Premium jet black theme inspired by Vercel\'s elegant design',
    preview: {
      primary: '#000000',
      secondary: '#18181b',
      accent: '#666666'
    },
    light: {
      background: '#ffffff',
      foreground: '#000000',
      card: '#fafafa',
      cardForeground: '#000000',
      popover: '#ffffff',
      popoverForeground: '#000000',
      primary: '#000000',
      primaryForeground: '#ffffff',
      secondary: '#f4f4f5',
      secondaryForeground: '#000000',
      muted: '#f9f9f9',
      mutedForeground: '#666666',
      accent: '#e5e5e5',
      accentForeground: '#000000',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e5e5e5',
      input: '#f9f9f9',
      ring: '#000000',
      chart1: '#000000',
      chart2: '#666666',
      chart3: '#999999',
      chart4: '#cccccc',
      chart5: '#e5e5e5',
      sidebar: '#fafafa',
      sidebarForeground: '#000000',
      sidebarPrimary: '#000000',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#f4f4f5',
      sidebarAccentForeground: '#000000',
      sidebarBorder: '#e5e5e5',
      sidebarRing: '#000000',
      sidebarHover: '#f0f0f0',
      sidebarHoverForeground: '#000000',
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      card: '#0a0a0a',
      cardForeground: '#ffffff',
      popover: '#000000',
      popoverForeground: '#ffffff',
      primary: '#ffffff',
      primaryForeground: '#000000',
      secondary: '#1a1a1a',
      secondaryForeground: '#ffffff',
      muted: '#111111',
      mutedForeground: '#888888',
      accent: '#1a1a1a',
      accentForeground: '#ffffff',
      destructive: '#ff4444',
      destructiveForeground: '#ffffff',
      border: '#1a1a1a',
      input: '#111111',
      ring: '#333333',
      chart1: '#ffffff',
      chart2: '#cccccc',
      chart3: '#999999',
      chart4: '#666666',
      chart5: '#333333',
      sidebar: '#000000',
      sidebarForeground: '#ffffff',
      sidebarPrimary: '#ffffff',
      sidebarPrimaryForeground: '#000000',
      sidebarAccent: '#111111',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#1a1a1a',
      sidebarRing: '#333333',
      sidebarHover: '#111111',
      sidebarHoverForeground: '#ffffff',
    }
  },
  
  creative: {
    name: 'creative',
    displayName: 'Creative Purple',
    description: 'Balanced purple theme for creative work',
    preview: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#f3e8ff'
    },
    light: {
      background: '#fefefe',
      foreground: '#1f2937',
      card: '#f8fafc',
      cardForeground: '#1f2937',
      popover: '#ffffff',
      popoverForeground: '#1f2937',
      primary: '#8b5cf6',
      primaryForeground: '#ffffff',
      secondary: '#e0e7ff',
      secondaryForeground: '#3730a3',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      accent: '#f3e8ff',
      accentForeground: '#5b21b6',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e2e8f0',
      input: '#f1f5f9',
      ring: '#8b5cf6',
      chart1: '#8b5cf6',
      chart2: '#a78bfa',
      chart3: '#c4b5fd',
      chart4: '#ddd6fe',
      chart5: '#ede9fe',
      sidebar: '#f8fafc',
      sidebarForeground: '#1f2937',
      sidebarPrimary: '#8b5cf6',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#f3e8ff',
      sidebarAccentForeground: '#5b21b6',
      sidebarBorder: '#e2e8f0',
      sidebarRing: '#8b5cf6',
      sidebarHover: '#f3e8ff',
      sidebarHoverForeground: '#8b5cf6',
    },
    dark: {
      background: '#0f0f23',
      foreground: '#f1f5f9',
      card: '#1e1b4b',
      cardForeground: '#f1f5f9',
      popover: '#1e1b4b',
      popoverForeground: '#f1f5f9',
      primary: '#a78bfa',
      primaryForeground: '#1e1b4b',
      secondary: '#312e81',
      secondaryForeground: '#f1f5f9',
      muted: '#1e1b4b',
      mutedForeground: '#94a3b8',
      accent: '#312e81',
      accentForeground: '#c4b5fd',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#312e81',
      input: '#1e1b4b',
      ring: '#a78bfa',
      chart1: '#a78bfa',
      chart2: '#c4b5fd',
      chart3: '#ddd6fe',
      chart4: '#8b5cf6',
      chart5: '#7c3aed',
      sidebar: '#0f0f23',
      sidebarForeground: '#f1f5f9',
      sidebarPrimary: '#a78bfa',
      sidebarPrimaryForeground: '#1e1b4b',
      sidebarAccent: '#1e1b4b',
      sidebarAccentForeground: '#c4b5fd',
      sidebarBorder: '#312e81',
      sidebarRing: '#a78bfa',
      sidebarHover: '#1e1b4b',
      sidebarHoverForeground: '#a78bfa',
    }
  },
  
  energy: {
    name: 'energy',
    displayName: 'Warm Energy',
    description: 'Balanced warm theme with refined amber accents',
    preview: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fef3c7'
    },
    light: {
      background: '#fefefe',
      foreground: '#1f2937',
      card: '#fffbeb',
      cardForeground: '#1f2937',
      popover: '#ffffff',
      popoverForeground: '#1f2937',
      primary: '#f59e0b',
      primaryForeground: '#ffffff',
      secondary: '#fef3c7',
      secondaryForeground: '#92400e',
      muted: '#f9fafb',
      mutedForeground: '#6b7280',
      accent: '#fef3c7',
      accentForeground: '#92400e',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e5e7eb',
      input: '#f9fafb',
      ring: '#f59e0b',
      chart1: '#f59e0b',
      chart2: '#fbbf24',
      chart3: '#fcd34d',
      chart4: '#fed7aa',
      chart5: '#fef3c7',
      sidebar: '#fffbeb',
      sidebarForeground: '#1f2937',
      sidebarPrimary: '#f59e0b',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#fef3c7',
      sidebarAccentForeground: '#92400e',
      sidebarBorder: '#e5e7eb',
      sidebarRing: '#f59e0b',
      sidebarHover: '#fef3c7',
      sidebarHoverForeground: '#f59e0b',
    },
    dark: {
      background: '#0c0a09',
      foreground: '#f5f5f4',
      card: '#1c1917',
      cardForeground: '#f5f5f4',
      popover: '#1c1917',
      popoverForeground: '#f5f5f4',
      primary: '#fbbf24',
      primaryForeground: '#1c1917',
      secondary: '#44403c',
      secondaryForeground: '#f5f5f4',
      muted: '#292524',
      mutedForeground: '#a8a29e',
      accent: '#44403c',
      accentForeground: '#fbbf24',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#44403c',
      input: '#292524',
      ring: '#fbbf24',
      chart1: '#fbbf24',
      chart2: '#f59e0b',
      chart3: '#d97706',
      chart4: '#b45309',
      chart5: '#92400e',
      sidebar: '#0c0a09',
      sidebarForeground: '#f5f5f4',
      sidebarPrimary: '#fbbf24',
      sidebarPrimaryForeground: '#1c1917',
      sidebarAccent: '#292524',
      sidebarAccentForeground: '#fbbf24',
      sidebarBorder: '#44403c',
      sidebarRing: '#fbbf24',
      sidebarHover: '#1c1917',
      sidebarHoverForeground: '#fbbf24',
    }
  },

  daylight: {
    name: 'daylight',
    displayName: 'Daylight',
    description: 'Classic minimalist light theme with pure white backgrounds',
    preview: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f8fafc'
    },
    light: {
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#ffffff',
      cardForeground: '#0f172a',
      popover: '#ffffff',
      popoverForeground: '#0f172a',
      primary: '#2563eb',
      primaryForeground: '#ffffff',
      secondary: '#f1f5f9',
      secondaryForeground: '#475569',
      muted: '#f8fafc',
      mutedForeground: '#64748b',
      accent: '#f1f5f9',
      accentForeground: '#2563eb',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e2e8f0',
      input: '#f8fafc',
      ring: '#2563eb',
      chart1: '#2563eb',
      chart2: '#7c3aed',
      chart3: '#059669',
      chart4: '#dc2626',
      chart5: '#ea580c',
      sidebar: '#ffffff',
      sidebarForeground: '#0f172a',
      sidebarPrimary: '#2563eb',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#f1f5f9',
      sidebarAccentForeground: '#475569',
      sidebarBorder: '#e2e8f0',
      sidebarRing: '#2563eb',
      sidebarHover: '#f8fafc',
      sidebarHoverForeground: '#2563eb',
    },
    dark: {
      background: '#020617',
      foreground: '#f8fafc',
      card: '#0f172a',
      cardForeground: '#f8fafc',
      popover: '#0f172a',
      popoverForeground: '#f8fafc',
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      secondary: '#1e293b',
      secondaryForeground: '#f8fafc',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      accent: '#1e293b',
      accentForeground: '#3b82f6',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#334155',
      input: '#1e293b',
      ring: '#3b82f6',
      chart1: '#3b82f6',
      chart2: '#8b5cf6',
      chart3: '#10b981',
      chart4: '#f59e0b',
      chart5: '#ef4444',
      sidebar: '#020617',
      sidebarForeground: '#f8fafc',
      sidebarPrimary: '#3b82f6',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#1e293b',
      sidebarAccentForeground: '#94a3b8',
      sidebarBorder: '#334155',
      sidebarRing: '#3b82f6',
      sidebarHover: '#1e293b',
      sidebarHoverForeground: '#3b82f6',
    }
  },

  graphite: {
    name: 'graphite',
    displayName: 'Graphite',
    description: 'Professional muted theme with refined slate grays',
    preview: {
      primary: '#475569',
      secondary: '#64748b',
      accent: '#f1f5f9'
    },
    light: {
      background: '#fdfdfd',
      foreground: '#1e293b',
      card: '#f8fafc',
      cardForeground: '#1e293b',
      popover: '#ffffff',
      popoverForeground: '#1e293b',
      primary: '#475569',
      primaryForeground: '#ffffff',
      secondary: '#e2e8f0',
      secondaryForeground: '#334155',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      accent: '#e2e8f0',
      accentForeground: '#475569',
      destructive: '#991b1b',
      destructiveForeground: '#ffffff',
      border: '#cbd5e1',
      input: '#f1f5f9',
      ring: '#475569',
      chart1: '#475569',
      chart2: '#64748b',
      chart3: '#334155',
      chart4: '#94a3b8',
      chart5: '#cbd5e1',
      sidebar: '#f8fafc',
      sidebarForeground: '#1e293b',
      sidebarPrimary: '#475569',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#e2e8f0',
      sidebarAccentForeground: '#334155',
      sidebarBorder: '#cbd5e1',
      sidebarRing: '#475569',
      sidebarHover: '#f1f5f9',
      sidebarHoverForeground: '#475569',
    },
    dark: {
      background: '#0f172a',
      foreground: '#cbd5e1',
      card: '#1e293b',
      cardForeground: '#cbd5e1',
      popover: '#1e293b',
      popoverForeground: '#cbd5e1',
      primary: '#64748b',
      primaryForeground: '#ffffff',
      secondary: '#334155',
      secondaryForeground: '#cbd5e1',
      muted: '#475569',
      mutedForeground: '#94a3b8',
      accent: '#334155',
      accentForeground: '#cbd5e1',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#475569',
      input: '#334155',
      ring: '#64748b',
      chart1: '#64748b',
      chart2: '#94a3b8',
      chart3: '#475569',
      chart4: '#cbd5e1',
      chart5: '#e2e8f0',
      sidebar: '#0f172a',
      sidebarForeground: '#cbd5e1',
      sidebarPrimary: '#64748b',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#334155',
      sidebarAccentForeground: '#94a3b8',
      sidebarBorder: '#475569',
      sidebarRing: '#64748b',
      sidebarHover: '#334155',
      sidebarHoverForeground: '#64748b',
    }
  },

  accessible: {
    name: 'accessible',
    displayName: 'High Contrast',
    description: 'WCAG AAA compliant theme with maximum contrast for accessibility',
    preview: {
      primary: '#000080',
      secondary: '#4a4a4a',
      accent: '#f5f5f5'
    },
    light: {
      background: '#ffffff',
      foreground: '#000000',
      card: '#ffffff',
      cardForeground: '#000000',
      popover: '#ffffff',
      popoverForeground: '#000000',
      primary: '#000080',
      primaryForeground: '#ffffff',
      secondary: '#f5f5f5',
      secondaryForeground: '#000000',
      muted: '#f0f0f0',
      mutedForeground: '#4a4a4a',
      accent: '#e6e6e6',
      accentForeground: '#000000',
      destructive: '#8b0000',
      destructiveForeground: '#ffffff',
      border: '#000000',
      input: '#ffffff',
      ring: '#000080',
      chart1: '#000080',
      chart2: '#8b0000',
      chart3: '#006400',
      chart4: '#ff8c00',
      chart5: '#4b0082',
      sidebar: '#ffffff',
      sidebarForeground: '#000000',
      sidebarPrimary: '#000080',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#f5f5f5',
      sidebarAccentForeground: '#000000',
      sidebarBorder: '#000000',
      sidebarRing: '#000080',
      sidebarHover: '#e6e6e6',
      sidebarHoverForeground: '#000000',
    },
    dark: {
      background: '#000000',
      foreground: '#ffffff',
      card: '#1a1a1a',
      cardForeground: '#ffffff',
      popover: '#000000',
      popoverForeground: '#ffffff',
      primary: '#ffff00',
      primaryForeground: '#000000',
      secondary: '#333333',
      secondaryForeground: '#ffffff',
      muted: '#4d4d4d',
      mutedForeground: '#b3b3b3',
      accent: '#666666',
      accentForeground: '#ffffff',
      destructive: '#ff4444',
      destructiveForeground: '#000000',
      border: '#ffffff',
      input: '#000000',
      ring: '#ffff00',
      chart1: '#ffff00',
      chart2: '#ff4444',
      chart3: '#00ff00',
      chart4: '#ffa500',
      chart5: '#da70d6',
      sidebar: '#000000',
      sidebarForeground: '#ffffff',
      sidebarPrimary: '#ffff00',
      sidebarPrimaryForeground: '#000000',
      sidebarAccent: '#333333',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#ffffff',
      sidebarRing: '#ffff00',
      sidebarHover: '#4d4d4d',
      sidebarHoverForeground: '#ffffff',
    }
  }
};

export function getThemeDefinition(theme: ColorTheme): ThemeColors {
  return themeDefinitions[theme];
}

export function getAllThemes(): ThemeColors[] {
  return Object.values(themeDefinitions);
}