import { cn } from '@/lib/utils';

interface ContentLoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function ContentLoading({ 
  className, 
  size = 'md', 
  message = 'Loading...' 
}: ContentLoadingProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const containerHeightClasses = {
    sm: 'min-h-[200px]',
    md: 'min-h-[300px]',
    lg: 'min-h-[400px]'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-6 bg-transparent relative",
      containerHeightClasses[size],
      className
    )}>
      {/* Main Loading Animation */}
      <div className="relative animate-in fade-in duration-500">
        {/* Outer Pulse Ring */}
        <div className={cn(
          "absolute inset-0 border-4 border-[#008080]/30 dark:border-[#00FFFF]/30 rounded-full animate-pulse",
          sizeClasses[size]
        )}></div>
        
        {/* Spinning Ring */}
        <div className={cn(
          "absolute inset-0 border-4 border-transparent border-t-[#008080] dark:border-t-[#00FFFF] rounded-full animate-spin",
          sizeClasses[size]
        )}></div>
        
        {/* Center Icon */}
        <div className={cn(
          "flex items-center justify-center",
          sizeClasses[size]
        )}>
          <div className="w-2 h-2 bg-[#008080] dark:bg-[#00FFFF] rounded-full animate-ping"></div>
        </div>
        
        {/* Glow Effect */}
        <div className={cn(
          "absolute inset-0 bg-[#008080]/20 dark:bg-[#00FFFF]/20 rounded-full blur-xl animate-pulse",
          sizeClasses[size]
        )}></div>
      </div>

      {/* Message with Animation */}
      {message && (
        <div className="text-center space-y-2 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
          
          {/* Animated Progress Dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-[#008080] dark:bg-[#00FFFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-[#008080] dark:bg-[#00FFFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-[#008080] dark:bg-[#00FFFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.teal.600)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
      </div>
    </div>
  );
}

// Enhanced Skeleton loading component with better animations
export function ContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 animate-in fade-in duration-700", className)}>
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse w-1/3"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse w-2/3"></div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse w-4/6"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse border border-gray-100 dark:border-gray-600"
            style={{ animationDelay: `${i * 100}ms` }}
          ></div>
        ))}
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse border border-gray-100 dark:border-gray-600"
            style={{ animationDelay: `${i * 150}ms` }}
          ></div>
        ))}
      </div>
    </div>
  );
} 