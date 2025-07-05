'use client';

interface ScrollbarStylesProps {
  className?: string;
}

/**
 * Consolidated scrollbar styling component for consistent scrollbar appearance across the app
 * Provides thin, styled scrollbars that work well in both light and dark themes
 * Also includes scrollbar-none utility for hiding scrollbars when needed
 * 
 * @param className - Optional custom class name for dynamic styling (defaults to 'scrollbar-thin')
 * 
 * Usage:
 * - <ScrollbarStyles /> - Applies default scrollbar-thin styles
 * - <ScrollbarStyles className="custom-scrollbar" /> - Applies custom scrollbar styles
 * - Use 'scrollbar-none' class to hide scrollbars completely
 */
export function ScrollbarStyles({ className = 'scrollbar-thin' }: ScrollbarStylesProps) {
  return (
    <style>{`
      .${className} {
        scrollbar-width: thin;
        scrollbar-color: rgb(156 163 175) transparent;
      }
      
      .${className}::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      
      .${className}::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .${className}::-webkit-scrollbar-thumb {
        background-color: rgb(156 163 175);
        border-radius: 2px;
        border: none;
      }
      
      .${className}::-webkit-scrollbar-thumb:hover {
        background-color: rgb(107 114 128);
      }
      
      .${className}::-webkit-scrollbar-corner {
        background: transparent;
      }
      
      /* Dark theme styles */
      .dark .${className} {
        scrollbar-color: rgb(75 85 99) transparent;
      }
      
      .dark .${className}::-webkit-scrollbar-thumb {
        background-color: rgb(75 85 99);
      }
      
      .dark .${className}::-webkit-scrollbar-thumb:hover {
        background-color: rgb(107 114 128);
      }
      
      .scrollbar-none {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      
      .scrollbar-none::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  );
}

// For backward compatibility, export the main component as ScrollbarStylesCSS
export const ScrollbarStylesCSS = ScrollbarStyles; 