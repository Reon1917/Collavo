"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, EyeOff } from 'lucide-react';
import { ColorTheme, getAllThemes, getThemeDefinition } from '@/lib/themes/definitions';
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
    isLoading,
    previewTheme,
    previewThemeChange,
    clearPreview
  } = useThemeStore();
  
  const { theme: systemTheme } = useTheme();
  const [isApplying, setIsApplying] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<ColorTheme | null>(null);
  
  const allThemes = getAllThemes();
  const isDark = systemTheme === 'dark';
  // const currentDisplayTheme = previewTheme || theme;

  const handleThemeSelect = async (newTheme: ColorTheme) => {
    if (newTheme === theme) return;

    setIsApplying(true);
    try {
      // Apply the theme immediately
      applyThemeToDocument(newTheme, isDark);
      
      // Sync with server if user is logged in
      if (userId) {
        await syncWithServer(userId, newTheme);
        toast.success(`Applied ${getThemeDefinition(newTheme).displayName} theme!`);
      } else {
        setTheme(newTheme);
        toast.success(`Applied ${getThemeDefinition(newTheme).displayName} theme! Sign in to save your preference.`);
      }
    } catch {
      // Even if server sync fails, the theme was still applied locally
      toast.success(`Applied ${getThemeDefinition(newTheme).displayName} theme! (Server sync failed - changes saved locally)`);
      // Minor UI feedback - theme still works locally
    } finally {
      setIsApplying(false);
    }
  };

  const handleThemePreview = (themeToPreview: ColorTheme) => {
    if (themeToPreview === theme) return;
    previewThemeChange(themeToPreview, isDark);
    setHoveredTheme(themeToPreview);
  };

  const handleClearPreview = () => {
    clearPreview(isDark);
    setHoveredTheme(null);
  };

  const ThemeCircle = ({ themeDefinition, isSelected, isPreview }: { 
    themeDefinition: any, 
    isSelected: boolean,
    isPreview: boolean 
  }) => {
    const colors = isDark ? themeDefinition.dark : themeDefinition.light;
    
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div 
            className={cn(
              "w-16 h-16 rounded-full border-4 transition-all duration-300 cursor-pointer relative overflow-hidden",
              isSelected ? "border-primary scale-110 shadow-lg" : "border-border hover:border-primary/50 hover:scale-105",
              isPreview && "ring-4 ring-primary/30"
            )}
            style={{
              background: `conic-gradient(from 0deg, ${colors.primary} 0deg 120deg, ${colors.secondary} 120deg 240deg, ${colors.accent} 240deg 360deg)`,
              boxShadow: isSelected ? `0 8px 25px ${colors.primary}40` : undefined
            }}
          >
            {/* Inner circle for better visibility */}
            <div 
              className="absolute inset-2 rounded-full"
              style={{ backgroundColor: colors.background }}
            />
            
            {/* Center accent */}
            <div 
              className="absolute inset-4 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
          </div>
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="font-medium text-sm text-foreground">
            {themeDefinition.displayName}
          </p>
          {isSelected && (
            <Badge variant="secondary" className="text-xs mt-1">
              Active
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Preference
        </CardTitle>
        <CardDescription>
          Choose your preferred color theme. {hoveredTheme && 'Hover to preview, click to apply.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="flex justify-center">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl">
            {allThemes.map((themeDefinition) => {
              const isSelected = theme === themeDefinition.name;
              const isPreview = previewTheme === themeDefinition.name;
              
              return (
                <Button
                  key={themeDefinition.name}
                  variant="ghost"
                  className="p-4 h-auto flex-col hover:bg-transparent"
                  onClick={() => handleThemeSelect(themeDefinition.name as ColorTheme)}
                  onMouseEnter={() => handleThemePreview(themeDefinition.name as ColorTheme)}
                  onMouseLeave={handleClearPreview}
                  disabled={isLoading || isApplying}
                >
                  <ThemeCircle 
                    themeDefinition={themeDefinition} 
                    isSelected={isSelected}
                    isPreview={isPreview}
                  />
                </Button>
              );
            })}
          </div>
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
        
        {/* Preview Clear Button */}
        {previewTheme && (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearPreview}
              className="gap-2"
            >
              <EyeOff className="h-4 w-4" />
              Clear Preview
            </Button>
          </div>
        )}
        
        {/* Info Section */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Themes automatically adapt to your light/dark mode preference</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-chart-1" />
            <span>Midnight theme is optimized for AMOLED displays</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}