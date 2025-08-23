"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, Monitor, Smartphone } from 'lucide-react';
import { ColorTheme, getAllThemes, getThemeDefinition, ThemeColors } from '@/lib/themes/definitions';
import { useThemeStore } from '@/lib/stores/theme-store';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ThemePickerProps {
  userId?: string;
  className?: string;
}

export function ThemePicker({ userId, className }: ThemePickerProps) {
  const { 
    theme, 
    setTheme, 
    applyThemeToDocument, 
    syncWithServer, 
    isLoading
  } = useThemeStore();
  
  const { theme: systemTheme } = useTheme();
  const [isApplying, setIsApplying] = useState(false);
  
  const allThemes = getAllThemes();
  const isDark = systemTheme === 'dark';

  const handleThemeSelect = async (newTheme: ColorTheme) => {
    if (newTheme === theme) return;

    setIsApplying(true);
    try {
      applyThemeToDocument(newTheme, isDark);
      
      if (userId) {
        await syncWithServer(userId, newTheme);
        toast.success(`Applied ${getThemeDefinition(newTheme).displayName} theme!`);
      } else {
        setTheme(newTheme);
        toast.success(`Applied ${getThemeDefinition(newTheme).displayName} theme! Sign in to save your preference.`);
      }
    } catch {
      toast.success(`Applied ${getThemeDefinition(newTheme).displayName} theme! (Server sync failed - changes saved locally)`);
    } finally {
      setIsApplying(false);
    }
  };

  // Compact mockup component
  const ThemeMockup = ({ themeDefinition, isDarkMode }: { 
    themeDefinition: ThemeColors, 
    isDarkMode: boolean 
  }) => {
    const colors = isDarkMode ? themeDefinition.dark : themeDefinition.light;
    
    return (
      <div className="w-full h-20 rounded-md overflow-hidden border border-border/30 shadow-sm bg-background">
        {/* Header bar */}
        <div 
          className="h-3 flex items-center justify-between px-1.5 border-b border-border/30"
          style={{ backgroundColor: colors.card }}
        >
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-red-500/70" />
            <div className="w-1 h-1 rounded-full bg-yellow-500/70" />
            <div className="w-1 h-1 rounded-full bg-green-500/70" />
          </div>
          <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: colors.mutedForeground }} />
        </div>
        
        {/* Content area */}
        <div className="h-17 p-1.5 space-y-1" style={{ backgroundColor: colors.background }}>
          {/* Top bar */}
          <div 
            className="h-2.5 rounded-sm px-1.5 flex items-center justify-between"
            style={{ backgroundColor: colors.card }}
          >
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: colors.primary }} />
            <div className="w-2 h-0.5 rounded-full" style={{ backgroundColor: colors.mutedForeground }} />
          </div>
          
          {/* Content rows */}
          <div className="space-y-0.5">
            <div className="flex gap-1">
              <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: colors.secondary }} />
              <div className="flex-1 h-1.5 rounded-sm" style={{ backgroundColor: colors.muted }} />
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-1.5 rounded-sm" style={{ backgroundColor: colors.accent }} />
              <div className="flex-1 h-1.5 rounded-sm" style={{ backgroundColor: colors.muted }} />
            </div>
            <div className="flex gap-1 justify-end">
              <div className="w-4 h-1.5 rounded-sm" style={{ backgroundColor: colors.primary }} />
              <div className="w-4 h-1.5 rounded-sm" style={{ backgroundColor: colors.border }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ThemeCard = ({ themeDefinition, isSelected }: { 
    themeDefinition: ThemeColors, 
    isSelected: boolean 
  }) => {
    return (
      <div className={cn(
        "group relative transition-all duration-200 cursor-pointer rounded-lg border border-border/50",
        "hover:border-primary/40 hover:shadow-sm",
        isSelected && "border-primary/60 shadow-sm ring-1 ring-primary/20"
      )}>
        <div className="p-3 space-y-3">
          <ThemeMockup themeDefinition={themeDefinition} isDarkMode={isDark} />
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="font-medium text-sm text-foreground truncate">
                {themeDefinition.displayName}
              </h3>
              {isSelected && (
                <div className="bg-primary text-primary-foreground rounded-full p-1 flex-shrink-0">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] flex items-center justify-center">
              {themeDefinition.description}
            </p>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Preference
        </CardTitle>
        <CardDescription>
          Choose your preferred color theme. Click on a theme to apply it instantly.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Compact grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {allThemes.map((themeDefinition) => {
            const isSelected = theme === themeDefinition.name;
            
            return (
              <div
                key={themeDefinition.name}
                onClick={() => !isLoading && !isApplying && handleThemeSelect(themeDefinition.name as ColorTheme)}
                className={cn(
                  "transition-opacity",
                  (isLoading || isApplying) && "opacity-50 pointer-events-none"
                )}
              >
                <ThemeCard 
                  themeDefinition={themeDefinition} 
                  isSelected={isSelected}
                />
              </div>
            );
          })}
        </div>
        
        {/* Loading State */}
        {(isLoading || isApplying) && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              {isApplying ? 'Applying theme...' : 'Loading...'}
            </div>
          </div>
        )}
        
        {/* Info Section */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Monitor className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Themes automatically adapt to your system&apos;s light/dark mode preference</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Smartphone className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>All themes are optimized for mobile and desktop viewing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}