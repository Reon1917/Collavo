"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
} 