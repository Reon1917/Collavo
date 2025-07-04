'use client';

interface ScrollbarStylesProps {
  className?: string;
}

/**
 * Reusable component for consistent scrollbar styling across the app
 * Provides thin, styled scrollbars that work well in both light and dark themes
 */
export function ScrollbarStyles({ className = 'scrollbar-thin' }: ScrollbarStylesProps) {
  return (
    <style jsx>{`
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
      :global(.dark) .${className} {
        scrollbar-color: rgb(75 85 99) transparent;
      }
      
      :global(.dark) .${className}::-webkit-scrollbar-thumb {
        background-color: rgb(75 85 99);
      }
      
      :global(.dark) .${className}::-webkit-scrollbar-thumb:hover {
        background-color: rgb(107 114 128);
      }
    `}</style>
  );
}

/**
 * Alternative implementation using CSS-in-JS for better performance
 * Use this when you need multiple scrollbar variants
 */
export function ScrollbarStylesCSS() {
  return (
    <style>{`
      .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: rgb(156 163 175) transparent;
      }
      
      .scrollbar-thin::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgb(156 163 175);
        border-radius: 2px;
        border: none;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgb(107 114 128);
      }
      
      .scrollbar-thin::-webkit-scrollbar-corner {
        background: transparent;
      }
      
      /* Dark theme styles */
      .dark .scrollbar-thin {
        scrollbar-color: rgb(75 85 99) transparent;
      }
      
      .dark .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgb(75 85 99);
      }
      
      .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
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