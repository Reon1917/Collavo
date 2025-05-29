"use client";

import { useAuth } from "@/providers/auth-provider";

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export function LoadingWrapper({ children }: LoadingWrapperProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Collavo</h2>
          <p className="text-gray-600">Please wait while we set things up...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 