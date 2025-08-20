export type ColorTheme = 'default' | 'amoled' | 'creative' | 'energy';

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
    }
  },
  
  amoled: {
    name: 'amoled',
    displayName: 'Jet Black Premium',
    description: 'True AMOLED optimization with minimal elegant accents',
    preview: {
      primary: '#000000',
      secondary: '#18181b',
      accent: '#3b82f6'
    },
    light: {
      background: '#fafafa',
      foreground: '#0a0a0a',
      card: '#ffffff',
      cardForeground: '#0a0a0a',
      popover: '#ffffff',
      popoverForeground: '#0a0a0a',
      primary: '#000000',
      primaryForeground: '#ffffff',
      secondary: '#18181b',
      secondaryForeground: '#ffffff',
      muted: '#f4f4f5',
      mutedForeground: '#71717a',
      accent: '#3b82f6',
      accentForeground: '#ffffff',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e4e4e7',
      input: '#f4f4f5',
      ring: '#000000',
      chart1: '#000000',
      chart2: '#18181b',
      chart3: '#3b82f6',
      chart4: '#64748b',
      chart5: '#374151',
      sidebar: '#fafafa',
      sidebarForeground: '#0a0a0a',
      sidebarPrimary: '#000000',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#18181b',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#e4e4e7',
      sidebarRing: '#000000',
    },
    dark: {
      background: '#000000',
      foreground: '#fafafa',
      card: '#0a0a0a',
      cardForeground: '#fafafa',
      popover: '#0a0a0a',
      popoverForeground: '#fafafa',
      primary: '#fafafa',
      primaryForeground: '#000000',
      secondary: '#27272a',
      secondaryForeground: '#fafafa',
      muted: '#18181b',
      mutedForeground: '#a1a1aa',
      accent: '#3b82f6',
      accentForeground: '#ffffff',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#27272a',
      input: '#18181b',
      ring: '#3b82f6',
      chart1: '#fafafa',
      chart2: '#a1a1aa',
      chart3: '#3b82f6',
      chart4: '#64748b',
      chart5: '#374151',
      sidebar: '#000000',
      sidebarForeground: '#fafafa',
      sidebarPrimary: '#fafafa',
      sidebarPrimaryForeground: '#000000',
      sidebarAccent: '#27272a',
      sidebarAccentForeground: '#fafafa',
      sidebarBorder: '#27272a',
      sidebarRing: '#3b82f6',
    }
  },
  
  creative: {
    name: 'creative',
    displayName: 'Purple Dreams',
    description: 'Inspiring purple theme for creative minds',
    preview: {
      primary: '#7c3aed',
      secondary: '#d946ef',
      accent: '#fbbf24'
    },
    light: {
      background: '#faf5ff',
      foreground: '#581c87',
      card: '#f3e8ff',
      cardForeground: '#581c87',
      popover: '#f3e8ff',
      popoverForeground: '#581c87',
      primary: '#7c3aed',
      primaryForeground: '#ffffff',
      secondary: '#d946ef',
      secondaryForeground: '#ffffff',
      muted: '#e9d5ff',
      mutedForeground: '#7c2d92',
      accent: '#fbbf24',
      accentForeground: '#92400e',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#c4b5fd',
      input: '#c4b5fd',
      ring: '#7c3aed',
      chart1: '#7c3aed',
      chart2: '#d946ef',
      chart3: '#fbbf24',
      chart4: '#06b6d4',
      chart5: '#10b981',
      sidebar: '#faf5ff',
      sidebarForeground: '#581c87',
      sidebarPrimary: '#7c3aed',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#d946ef',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#c4b5fd',
      sidebarRing: '#7c3aed',
    },
    dark: {
      background: '#1f1b2e',
      foreground: '#e9d5ff',
      card: '#2d1b4e',
      cardForeground: '#e9d5ff',
      popover: '#2d1b4e',
      popoverForeground: '#e9d5ff',
      primary: '#a855f7',
      primaryForeground: '#ffffff',
      secondary: '#f472b6',
      secondaryForeground: '#ffffff',
      muted: '#3f2e5f',
      mutedForeground: '#c4b5fd',
      accent: '#fbbf24',
      accentForeground: '#92400e',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#6d28d9',
      input: '#6d28d9',
      ring: '#a855f7',
      chart1: '#a855f7',
      chart2: '#f472b6',
      chart3: '#fbbf24',
      chart4: '#06b6d4',
      chart5: '#10b981',
      sidebar: '#1f1b2e',
      sidebarForeground: '#e9d5ff',
      sidebarPrimary: '#a855f7',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#f472b6',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#6d28d9',
      sidebarRing: '#a855f7',
    }
  },
  
  energy: {
    name: 'energy',
    displayName: 'Warm Amber',
    description: 'Sophisticated warm theme with muted amber tones',
    preview: {
      primary: '#d97706',
      secondary: '#92400e',
      accent: '#fbbf24'
    },
    light: {
      background: '#fffdf7',
      foreground: '#78716c',
      card: '#fefce8',
      cardForeground: '#78716c',
      popover: '#fefce8',
      popoverForeground: '#78716c',
      primary: '#d97706',
      primaryForeground: '#ffffff',
      secondary: '#92400e',
      secondaryForeground: '#ffffff',
      muted: '#fef3c7',
      mutedForeground: '#a16207',
      accent: '#fbbf24',
      accentForeground: '#92400e',
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      border: '#e5e7eb',
      input: '#f3f4f6',
      ring: '#d97706',
      chart1: '#d97706',
      chart2: '#92400e',
      chart3: '#fbbf24',
      chart4: '#f59e0b',
      chart5: '#b45309',
      sidebar: '#fffdf7',
      sidebarForeground: '#78716c',
      sidebarPrimary: '#d97706',
      sidebarPrimaryForeground: '#ffffff',
      sidebarAccent: '#92400e',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#e5e7eb',
      sidebarRing: '#d97706',
    },
    dark: {
      background: '#1c1917',
      foreground: '#d6d3d1',
      card: '#292524',
      cardForeground: '#d6d3d1',
      popover: '#292524',
      popoverForeground: '#d6d3d1',
      primary: '#fbbf24',
      primaryForeground: '#92400e',
      secondary: '#d97706',
      secondaryForeground: '#ffffff',
      muted: '#3c3835',
      mutedForeground: '#a8a29e',
      accent: '#f59e0b',
      accentForeground: '#78716c',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      border: '#44403c',
      input: '#44403c',
      ring: '#fbbf24',
      chart1: '#fbbf24',
      chart2: '#d97706',
      chart3: '#f59e0b',
      chart4: '#b45309',
      chart5: '#92400e',
      sidebar: '#1c1917',
      sidebarForeground: '#d6d3d1',
      sidebarPrimary: '#fbbf24',
      sidebarPrimaryForeground: '#92400e',
      sidebarAccent: '#d97706',
      sidebarAccentForeground: '#ffffff',
      sidebarBorder: '#44403c',
      sidebarRing: '#fbbf24',
    }
  }
};

export function getThemeDefinition(theme: ColorTheme): ThemeColors {
  return themeDefinitions[theme];
}

export function getAllThemes(): ThemeColors[] {
  return Object.values(themeDefinitions);
}