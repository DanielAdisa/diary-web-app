import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";



export const metadata: Metadata = {
  title: 'Diary App',
  description: 'A simple diary app built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <body className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="container flex-grow p-4 mx-auto">
          {children}</main>
        <Footer />
      </body>
    </html>
  );
}
