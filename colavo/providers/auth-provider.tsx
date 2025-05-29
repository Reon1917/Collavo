"use client";

import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from "react";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const sessionData = authClient.useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (sessionData.data?.user) {
      setUser(sessionData.data.user);
    } else {
      setUser(null);
    }
    if (!isInitialized && !sessionData.isPending) {
      setIsInitialized(true);
    }
  }, [sessionData.data, sessionData.isPending, isInitialized]);

  const refetch = useCallback(async () => {
    try {
      await sessionData.refetch();
      await new Promise(resolve => setTimeout(resolve, 0));
    } catch (error) {
      console.error('Session refetch error:', error);
    }
  }, [sessionData.refetch]);

  const value: AuthContextType = {
    user,
    isLoading: sessionData.isPending || !isInitialized,
    isAuthenticated: !!user,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 