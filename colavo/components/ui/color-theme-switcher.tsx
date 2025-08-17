"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useColorTheme, type ColorTheme } from "@/providers/color-theme-provider";
import { Palette, Check } from "lucide-react";

interface ColorThemeOption {
  id: ColorTheme;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

const colorThemeOptions: ColorThemeOption[] = [
  {
    id: 'default',
    name: 'Ocean Teal',
    description: 'Calming teal and cyan tones',
    primaryColor: '#008080',
    secondaryColor: '#00FFFF',
    backgroundColor: '#f9f8f0',
  },
  {
    id: 'purple',
    name: 'Creative Purple',
    description: 'Vibrant purple and pink combination',
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
    backgroundColor: '#fefcfb',
  },
  {
    id: 'forest',
    name: 'Nature Green',
    description: 'Fresh green with warm gold accents',
    primaryColor: '#059669',
    secondaryColor: '#d97706',
    backgroundColor: '#fefffe',
  },
];

export function ColorThemeSwitcher() {
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Color Theme</CardTitle>
        </div>
        <CardDescription>
          Choose your preferred color palette for the interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {colorThemeOptions.map((option) => (
            <div
              key={option.id}
              className={`relative rounded-lg border-2 transition-all duration-200 ${
                colorTheme === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Button
                variant="ghost"
                className="w-full h-auto p-4 justify-start text-left"
                onClick={() => setColorTheme(option.id)}
              >
                <div className="flex items-center space-x-4 w-full">
                  {/* Color Preview */}
                  <div className="flex space-x-1">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: option.primaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: option.secondaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-border"
                      style={{ backgroundColor: option.backgroundColor }}
                    />
                  </div>
                  
                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                  
                  {/* Selected Indicator */}
                  {colorTheme === option.id && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
          <strong>Note:</strong> Your theme preference will be saved and applied across all pages. 
          Changes take effect immediately.
        </div>
      </CardContent>
    </Card>
  );
}
