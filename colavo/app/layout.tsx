import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

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
  icons: {
    icon: [
      { url: "/icon/webicon-collavo.png", sizes: "1024x1024", type: "image/png" },
      { url: "/icon/webicon-collavo.png", sizes: "32x32", type: "image/png" },
      { url: "/icon/webicon-collavo.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/icon/webicon-collavo.png",
    apple: "/icon/webicon-collavo.png",
  },
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
          <QueryProvider>
            <AuthProvider>
              <LoadingWrapper>
                {children}
              </LoadingWrapper>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
