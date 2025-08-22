import { ColorTheme, getThemeDefinition } from './definitions';

/**
 * Apply a theme to the document by setting CSS custom properties
 */
export function applyTheme(theme: ColorTheme, isDark: boolean): void {
  const themeDefinition = getThemeDefinition(theme);
  const colors = isDark ? themeDefinition.dark : themeDefinition.light;
  const root = document.documentElement;

  // Apply all theme colors as CSS custom properties
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });

  // Apply additional CSS variables for sidebar hover states
  root.style.setProperty('--sidebar-hover', colors.sidebarHover);
  root.style.setProperty('--sidebar-hover-foreground', colors.sidebarHoverForeground);

  // Store the current theme in localStorage for persistence
  localStorage.setItem('collavo-theme', theme);
}

/**
 * Get the currently saved theme from localStorage
 */
export function getCurrentTheme(): ColorTheme {
  if (typeof window === 'undefined') return 'default';
  return (localStorage.getItem('collavo-theme') as ColorTheme) || 'default';
}

/**
 * Initialize the theme system - should be called on app startup
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;
  
  const savedTheme = getCurrentTheme();
  const isDark = document.documentElement.classList.contains('dark');
  applyTheme(savedTheme, isDark);
}

/**
 * Get status colors that work with the current theme
 */
export function getStatusColors(status: 'success' | 'warning' | 'error' | 'info') {
  const baseColors = {
    success: {
      light: 'bg-green-100 text-green-800 border-green-200',
      dark: 'bg-green-900/20 text-green-200 border-green-800'
    },
    warning: {
      light: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dark: 'bg-yellow-900/20 text-yellow-200 border-yellow-800'
    },
    error: {
      light: 'bg-red-100 text-red-800 border-red-200',
      dark: 'bg-red-900/20 text-red-200 border-red-800'
    },
    info: {
      light: 'bg-blue-100 text-blue-800 border-blue-200',
      dark: 'bg-blue-900/20 text-blue-200 border-blue-800'
    }
  };

  return baseColors[status];
}

/**
 * Get priority colors that work with the current theme
 */
export function getPriorityColors(priority: 'critical' | 'high' | 'medium' | 'low') {
  const colors = {
    critical: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive',
    high: 'bg-chart-4/10 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4',
    medium: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    low: 'bg-muted text-muted-foreground'
  };

  return colors[priority];
}

/**
 * Get event type colors that work with the current theme
 */
export function getEventTypeColors(type: 'meeting' | 'deadline' | 'milestone' | 'reminder') {
  const colors = {
    meeting: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    deadline: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive',
    milestone: 'bg-chart-1/10 text-chart-1 dark:bg-chart-1/20 dark:text-chart-1',
    reminder: 'bg-chart-4/10 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4'
  };

  return colors[type];
}

/**
 * Check if a theme is dark-optimized (like AMOLED)
 */
export function isDarkOptimizedTheme(theme: ColorTheme): boolean {
  return theme === 'amoled';
}

/**
 * Check if a theme is accessibility-focused
 */
export function isAccessibilityTheme(theme: ColorTheme): boolean {
  return theme === 'accessible';
}

/**
 * Get theme category for grouping in UI
 */
export function getThemeCategory(theme: ColorTheme): 'colorful' | 'minimal' | 'professional' | 'accessibility' {
  switch (theme) {
    case 'creative':
    case 'energy':
      return 'colorful';
    case 'daylight':
    case 'amoled':
      return 'minimal';
    case 'default':
    case 'graphite':
      return 'professional';
    case 'accessible':
      return 'accessibility';
    default:
      return 'professional';
  }
}

/**
 * Get theme accent color for UI highlights
 */
export function getThemeAccent(theme: ColorTheme): string {
  const themeDefinition = getThemeDefinition(theme);
  return themeDefinition.preview.primary;
}

/**
 * Generate CSS for theme transitions
 */
export function getThemeTransitionCSS(): string {
  return `
    * {
      transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }
  `;
}