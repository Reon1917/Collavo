"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { useThemeStore } from "@/lib/stores/theme-store";
import { applyTheme } from "@/lib/themes/utils";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted) {
      // Apply theme when dark/light mode changes
      const observer = new MutationObserver(() => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(theme, isDark);
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Initial application
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(theme, isDark);

      return () => observer.disconnect();
    }
    return undefined;
  }, [mounted, theme]);

  if (!mounted) {
    return null;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 