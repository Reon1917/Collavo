export type ColorTheme = 'default' | 'amoled' | 'creative' | 'energy' | 'daylight' | 'graphite' | 'accessible' | 'girly';

export const ALLOWED_COLOR_THEMES = ['default', 'amoled', 'creative', 'energy', 'daylight', 'graphite', 'accessible', 'girly'] as const satisfies readonly ColorTheme[];

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
    displayName: 'Ocean Breeze',
    description: 'Fresh blue theme inspired by ocean waves and clear skies',
    preview: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#e0f2fe'
    },
    light: {
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#f0f9ff',
      cardForeground: '#0f172a',
      popover: '#ffffff',
      popoverForeground: '#0f172a',
      primary: '#0ea5e9',
      primaryForeground: '#ffffff',
      secondary: '#e0f2fe',
      secondaryForeground: '#0c4a6e',
      muted: '#f0f9ff',
      mutedForeground: '#64748b',
      accent: '#cffafe',
      accentForeground: '#06b6d4',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#67e8f9',
      input: '#f0f9ff',
      ring: '#06b6d4',
      chart1: '#0ea5e9',
      chart2: '#06b6d4',
      chart3: '#22d3ee',
      chart4: '#0891b2',
      chart5: '#0e7490',
      sidebar: '#f0f9ff',
      sidebarForeground: '#0f172a',
      sidebarPrimary: '#0ea5e9',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#e0f2fe',
      sidebarAccentForeground: '#06b6d4',
      sidebarBorder: '#67e8f9',
      sidebarRing: '#0ea5e9',
      sidebarHover: '#cffafe',
      sidebarHoverForeground: '#06b6d4',
    },
    dark: {
      background: '#020617',
      foreground: '#f8fafc',
      card: '#0f172a',
      cardForeground: '#f8fafc',
      popover: '#0f172a',
      popoverForeground: '#f8fafc',
      primary: '#22d3ee',
      primaryForeground: '#020617',
      secondary: '#164e63',
      secondaryForeground: '#cffafe',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      accent: '#164e63',
      accentForeground: '#67e8f9',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#0891b2',
      input: '#1e293b',
      ring: '#22d3ee',
      chart1: '#22d3ee',
      chart2: '#0ea5e9',
      chart3: '#06b6d4',
      chart4: '#0891b2',
      chart5: '#0e7490',
      sidebar: '#020617',
      sidebarForeground: '#f8fafc',
      sidebarPrimary: '#22d3ee',
      sidebarPrimaryForeground: '#020617',
      sidebarAccent: '#1e293b',
      sidebarAccentForeground: '#67e8f9',
      sidebarBorder: '#0891b2',
      sidebarRing: '#22d3ee',
      sidebarHover: '#164e63',
      sidebarHoverForeground: '#67e8f9',
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
    displayName: 'Creative Cosmos',
    description: 'Vibrant purple and pink gradient theme for creative minds',
    preview: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#fdf2f8'
    },
    light: {
      background: '#fefefe',
      foreground: '#1f2937',
      card: '#fdf2f8',
      cardForeground: '#1f2937',
      popover: '#ffffff',
      popoverForeground: '#1f2937',
      primary: '#8b5cf6',
      primaryForeground: '#ffffff',
      secondary: '#fce7f3',
      secondaryForeground: '#be185d',
      muted: '#f3e8ff',
      mutedForeground: '#64748b',
      accent: '#fdf2f8',
      accentForeground: '#ec4899',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e879f9',
      input: '#f3e8ff',
      ring: '#ec4899',
      chart1: '#8b5cf6',
      chart2: '#ec4899',
      chart3: '#a78bfa',
      chart4: '#f472b6',
      chart5: '#c084fc',
      sidebar: '#fdf2f8',
      sidebarForeground: '#1f2937',
      sidebarPrimary: '#8b5cf6',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#fce7f3',
      sidebarAccentForeground: '#ec4899',
      sidebarBorder: '#e879f9',
      sidebarRing: '#8b5cf6',
      sidebarHover: '#fce7f3',
      sidebarHoverForeground: '#ec4899',
    },
    dark: {
      background: '#0f0f23',
      foreground: '#f1f5f9',
      card: '#1e1b4b',
      cardForeground: '#f1f5f9',
      popover: '#1e1b4b',
      popoverForeground: '#f1f5f9',
      primary: '#a78bfa',
      primaryForeground: '#0f0f23',
      secondary: '#831843',
      secondaryForeground: '#fce7f3',
      muted: '#312e81',
      mutedForeground: '#94a3b8',
      accent: '#831843',
      accentForeground: '#f472b6',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#7c3aed',
      input: '#312e81',
      ring: '#f472b6',
      chart1: '#a78bfa',
      chart2: '#f472b6',
      chart3: '#c084fc',
      chart4: '#ec4899',
      chart5: '#8b5cf6',
      sidebar: '#0f0f23',
      sidebarForeground: '#f1f5f9',
      sidebarPrimary: '#a78bfa',
      sidebarPrimaryForeground: '#0f0f23',
      sidebarAccent: '#312e81',
      sidebarAccentForeground: '#f472b6',
      sidebarBorder: '#7c3aed',
      sidebarRing: '#a78bfa',
      sidebarHover: '#312e81',
      sidebarHoverForeground: '#f472b6',
    }
  },
  
  energy: {
    name: 'energy',
    displayName: 'Solar Flare',
    description: 'Dynamic warm theme with fiery orange and gold gradients',
    preview: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#fed7aa'
    },
    light: {
      background: '#fefefe',
      foreground: '#1f2937',
      card: '#fff7ed',
      cardForeground: '#1f2937',
      popover: '#ffffff',
      popoverForeground: '#1f2937',
      primary: '#ea580c',
      primaryForeground: '#ffffff',
      secondary: '#fed7aa',
      secondaryForeground: '#9a3412',
      muted: '#fef3c7',
      mutedForeground: '#6b7280',
      accent: '#ffedd5',
      accentForeground: '#dc2626',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#fb923c',
      input: '#fef3c7',
      ring: '#dc2626',
      chart1: '#ea580c',
      chart2: '#dc2626',
      chart3: '#f97316',
      chart4: '#fbbf24',
      chart5: '#f59e0b',
      sidebar: '#fff7ed',
      sidebarForeground: '#1f2937',
      sidebarPrimary: '#ea580c',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#fed7aa',
      sidebarAccentForeground: '#dc2626',
      sidebarBorder: '#fb923c',
      sidebarRing: '#ea580c',
      sidebarHover: '#fed7aa',
      sidebarHoverForeground: '#dc2626',
    },
    dark: {
      background: '#0c0a09',
      foreground: '#f5f5f4',
      card: '#1c1917',
      cardForeground: '#f5f5f4',
      popover: '#1c1917',
      popoverForeground: '#f5f5f4',
      primary: '#f97316',
      primaryForeground: '#0c0a09',
      secondary: '#7f1d1d',
      secondaryForeground: '#fed7aa',
      muted: '#44403c',
      mutedForeground: '#a8a29e',
      accent: '#7f1d1d',
      accentForeground: '#fb923c',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#ea580c',
      input: '#44403c',
      ring: '#f97316',
      chart1: '#f97316',
      chart2: '#ef4444',
      chart3: '#fbbf24',
      chart4: '#ea580c',
      chart5: '#dc2626',
      sidebar: '#0c0a09',
      sidebarForeground: '#f5f5f4',
      sidebarPrimary: '#f97316',
      sidebarPrimaryForeground: '#0c0a09',
      sidebarAccent: '#44403c',
      sidebarAccentForeground: '#fb923c',
      sidebarBorder: '#ea580c',
      sidebarRing: '#f97316',
      sidebarHover: '#1c1917',
      sidebarHoverForeground: '#fb923c',
    }
  },

  daylight: {
    name: 'daylight',
    displayName: 'Forest Haven',
    description: 'Cozy nature theme with muted greens and earthy tones',
    preview: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#d1fae5'
    },
    light: {
      background: '#fefffe',
      foreground: '#1f2937',
      card: '#f7fdf9',
      cardForeground: '#1f2937',
      popover: '#ffffff',
      popoverForeground: '#1f2937',
      primary: '#059669',
      primaryForeground: '#ffffff',
      secondary: '#d1fae5',
      secondaryForeground: '#047857',
      muted: '#f7fdf9',
      mutedForeground: '#6b7280',
      accent: '#ecfdf5',
      accentForeground: '#065f46',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#34d399',
      input: '#f7fdf9',
      ring: '#047857',
      chart1: '#059669',
      chart2: '#047857',
      chart3: '#10b981',
      chart4: '#6ee7b7',
      chart5: '#34d399',
      sidebar: '#f7fdf9',
      sidebarForeground: '#1f2937',
      sidebarPrimary: '#059669',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#d1fae5',
      sidebarAccentForeground: '#047857',
      sidebarBorder: '#34d399',
      sidebarRing: '#059669',
      sidebarHover: '#d1fae5',
      sidebarHoverForeground: '#047857',
    },
    dark: {
      background: '#0c1410',
      foreground: '#f0fdf4',
      card: '#1a2e20',
      cardForeground: '#f0fdf4',
      popover: '#1a2e20',
      popoverForeground: '#f0fdf4',
      primary: '#10b981',
      primaryForeground: '#0c1410',
      secondary: '#064e3b',
      secondaryForeground: '#d1fae5',
      muted: '#1a2e20',
      mutedForeground: '#a1a1aa',
      accent: '#064e3b',
      accentForeground: '#a7f3d0',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#10b981',
      input: '#1a2e20',
      ring: '#10b981',
      chart1: '#10b981',
      chart2: '#059669',
      chart3: '#047857',
      chart4: '#6ee7b7',
      chart5: '#34d399',
      sidebar: '#0c1410',
      sidebarForeground: '#f0fdf4',
      sidebarPrimary: '#10b981',
      sidebarPrimaryForeground: '#0c1410',
      sidebarAccent: '#1a2e20',
      sidebarAccentForeground: '#a7f3d0',
      sidebarBorder: '#10b981',
      sidebarRing: '#10b981',
      sidebarHover: '#064e3b',
      sidebarHoverForeground: '#a7f3d0',
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
  },

  girly: {
    name: 'girly',
    displayName: 'Rose Garden',
    description: 'Elegant pink and rose gold theme with soft romantic touches',
    preview: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      accent: '#fdf2f8'
    },
    light: {
      background: '#fefcfe',
      foreground: '#1f2937',
      card: '#fdf2f8',
      cardForeground: '#1f2937',
      popover: '#ffffff',
      popoverForeground: '#1f2937',
      primary: '#f43f5e',
      primaryForeground: '#ffffff',
      secondary: '#fce7f3',
      secondaryForeground: '#be185d',
      muted: '#fef7ff',
      mutedForeground: '#64748b',
      accent: '#fce7f3',
      accentForeground: '#fb7185',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#f9a8d4',
      input: '#fef7ff',
      ring: '#fb7185',
      chart1: '#f43f5e',
      chart2: '#fb7185',
      chart3: '#f472b6',
      chart4: '#f9a8d4',
      chart5: '#fce7f3',
      sidebar: '#fdf2f8',
      sidebarForeground: '#1f2937',
      sidebarPrimary: '#f43f5e',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#fce7f3',
      sidebarAccentForeground: '#fb7185',
      sidebarBorder: '#f9a8d4',
      sidebarRing: '#f43f5e',
      sidebarHover: '#fce7f3',
      sidebarHoverForeground: '#fb7185',
    },
    dark: {
      background: '#0f0a0d',
      foreground: '#fdf2f8',
      card: '#1f1419',
      cardForeground: '#fdf2f8',
      popover: '#1f1419',
      popoverForeground: '#fdf2f8',
      primary: '#fb7185',
      primaryForeground: '#0f0a0d',
      secondary: '#881337',
      secondaryForeground: '#fce7f3',
      muted: '#4c1d24',
      mutedForeground: '#d1d5db',
      accent: '#881337',
      accentForeground: '#f472b6',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#be185d',
      input: '#4c1d24',
      ring: '#fb7185',
      chart1: '#fb7185',
      chart2: '#f472b6',
      chart3: '#f9a8d4',
      chart4: '#f43f5e',
      chart5: '#e11d48',
      sidebar: '#0f0a0d',
      sidebarForeground: '#fdf2f8',
      sidebarPrimary: '#fb7185',
      sidebarPrimaryForeground: '#0f0a0d',
      sidebarAccent: '#1f1419',
      sidebarAccentForeground: '#f472b6',
      sidebarBorder: '#be185d',
      sidebarRing: '#fb7185',
      sidebarHover: '#4c1d24',
      sidebarHoverForeground: '#f472b6',
    }
  }
};

export function getThemeDefinition(theme: ColorTheme): ThemeColors {
  return themeDefinitions[theme];
}

export function getAllThemes(): ThemeColors[] {
  return Object.values(themeDefinitions);
}