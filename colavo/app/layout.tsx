import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { ThemeProvider } from "@/providers/theme-provider";
import { SessionKiller } from "@/components/ui/session-killer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collavo - Student Project Management",
  description: "Transform chaos into academic excellence with Collavo's student project management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SessionKiller>
              <LoadingWrapper>
                {children}
              </LoadingWrapper>
            </SessionKiller>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
