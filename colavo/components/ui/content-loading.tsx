import { Loader2 } from 'lucide-react';
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
    md: 'min-h-[400px]',
    lg: 'min-h-[500px]'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4 bg-transparent",
      containerHeightClasses[size],
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-[#008080] dark:text-[#00FFFF]",
        sizeClasses[size]
      )} />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {message}
        </p>
      )}
    </div>
  );
}

// Skeleton loading component for more detailed loading states
export function ContentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
} 