"use client";

import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from "react";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { User } from "@/types";
import { isNotNullish } from "@/utils";

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

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const sessionData = authClient.useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isLoading = sessionData.isPending || !isInitialized;
  const isAuthenticated = Boolean(user && sessionData.data?.user);

  useEffect(() => {
    if (!sessionData.isPending) {
      const sessionUser = sessionData.data?.user;
      
      if (sessionUser && isNotNullish(sessionUser)) {
        const transformedUser: User = {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          ...(sessionUser.image !== undefined && { image: sessionUser.image }),
          ...(sessionUser.emailVerified !== undefined && { emailVerified: sessionUser.emailVerified }),
          ...(sessionUser.createdAt !== undefined && { createdAt: sessionUser.createdAt }),
          ...(sessionUser.updatedAt !== undefined && { updatedAt: sessionUser.updatedAt }),
        };
        setUser(transformedUser);
      } else {
        setUser(null);
      }
      
      setIsInitialized(true);
    }
  }, [sessionData.data, sessionData.isPending]);

  const refetch = useCallback(async (): Promise<void> => {
    try {
      await sessionData.refetch();
      await new Promise(resolve => setTimeout(resolve, 0));
    } catch (error) {
              if (process.env.NODE_ENV === 'development') {
          console.error("Failed to refetch session:", error);
        }
    }
  }, [sessionData]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    refetch,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <Toaster />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 