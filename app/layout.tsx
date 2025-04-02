import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Modern font using Google Fonts for reliable cross-platform compatibility
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-modern',
});

export const metadata: Metadata = {
  title: 'Memoir | Modern Diary App',
  description: 'A futuristic diary application for capturing your moments in style',
  keywords: 'diary, journal, notes, memories, digital diary',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80 ${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Subtle noise texture for depth */}
          <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-[0.015] dark:opacity-[0.03] pointer-events-none z-0"></div>
          
          {/* Gradient accents */}
          <div className="fixed -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none"></div>
          <div className="fixed -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none"></div>
          
          <main className="container relative flex-grow p-4 mx-auto z-1 pt-6 md:pt-10">
            {/* Global theme toggle in top right */}
            <div className="absolute z-10 top-6 right-6">
              <ThemeToggle />
            </div>
            
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
