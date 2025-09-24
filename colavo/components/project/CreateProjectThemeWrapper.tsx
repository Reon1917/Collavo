"use client";

import { PropsWithChildren, useMemo } from "react";
import { useTheme } from "next-themes";
import { useThemeStore } from "@/lib/stores/theme-store";
import { getThemeSurfaceColors } from "@/lib/themes/utils";

export function CreateProjectThemeWrapper({ children }: PropsWithChildren) {
  const { theme: systemTheme } = useTheme();
  const { theme } = useThemeStore();

  const isDark = systemTheme === "dark";

  const { background, card, accent } = useMemo(() => {
    return getThemeSurfaceColors(theme, isDark);
  }, [theme, isDark]);

  const style = useMemo(() => {
    return {
      backgroundImage: `radial-gradient(circle at 20% 20%, ${accent}22, transparent 60%), radial-gradient(circle at 80% 0%, ${card}1a, transparent 55%), radial-gradient(circle at 50% 100%, ${card}26, ${background} 70%)`,
    } as const;
  }, [accent, card, background]);

  return (
    <div className="min-h-screen transition-colors duration-300" style={style}>
      {children}
    </div>
  );
}

