import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

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
          <div className="fixed rounded-full pointer-events-none -top-40 -right-40 w-80 h-80 bg-primary/20 blur-3xl opacity-20 dark:opacity-10"></div>
          <div className="fixed rounded-full pointer-events-none -bottom-40 -left-40 w-80 h-80 bg-accent/20 blur-3xl opacity-20 dark:opacity-10"></div>
          
          {/* Navbar displayed on all routes */}
          <Navbar />
          
          <main className="container relative flex-grow p-4 pt-6 mx-auto z-1 md:pt-10">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
