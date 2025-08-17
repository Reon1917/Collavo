"use client";

import { useAuth } from "@/providers/auth-provider";

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export function LoadingWrapper({ children }: LoadingWrapperProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="text-center space-y-8 animate-in fade-in duration-500">
          {/* Logo/Brand Area with Pulse Animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto relative">
              {/* Outer Ring */}
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary/30 dark:border-secondary/30 rounded-full animate-pulse"></div>
              {/* Spinning Ring */}
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[#008080] dark:border-t-[#00FFFF] rounded-full animate-spin"></div>
              {/* Center Dot with Scale Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-primary dark:bg-secondary rounded-full animate-ping"></div>
              </div>
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/20 dark:bg-secondary/20 rounded-full blur-xl animate-pulse"></div>
          </div>

          {/* Text Content with Stagger Animation */}
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Loading Collavo
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground max-w-md mx-auto leading-relaxed">
              Please wait while we set things up...
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-64 mx-auto animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="h-1 bg-muted dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#008080] to-[#00FFFF] dark:from-[#008080] dark:to-[#00FFFF] rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Floating Dots Animation */}
          <div className="flex justify-center space-x-2 animate-in fade-in duration-1000 delay-700">
            <div className="w-2 h-2 bg-primary dark:bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary dark:bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary dark:bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.600)_1px,transparent_1px)] bg-[length:24px_24px] animate-pulse"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 