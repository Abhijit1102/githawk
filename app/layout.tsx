import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-prodiver";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "GitHawk",
  description: "GitHub review assistant for smarter code insights",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}

            <Toaster
              position="top-center"
              richColors
              expand={false}
              toastOptions={{
                className:
                  "animate-in slide-in-from-top-4 fade-in duration-300",
              }}
            />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
