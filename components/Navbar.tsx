"use client"
import { cn } from "@/lib/utils";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  RiHeartPulseLine,
  RiAddLine,
  RiBook2Line,
  RiMenuLine,
  RiCloseLine,
  RiHomeLine
} from "react-icons/ri";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  const routes = [
    { name: "Home", path: "/", icon: <RiHomeLine className="text-primary" /> },
    { name: "Create", path: "/create", icon: <RiAddLine className="text-primary" /> },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Check if a given route is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full py-3 transition-all duration-300 border-b backdrop-blur-md",
      scrolled 
        ? "bg-background/85 shadow-sm border-border/30" 
        : "bg-background/70 border-transparent"
    )}>
      <div className="container flex items-center justify-between px-4 mx-auto">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <RiHeartPulseLine className="transition-colors text-primary group-hover:text-primary/80" size={24} />
          </motion.div>
          <span className="text-lg font-semibold text-transparent bg-gradient-to-r from-primary to-primary-foreground bg-clip-text">Memoir</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="items-center hidden gap-6 md:flex">
          <div className="flex items-center gap-2">
            {routes.map((route) => (
              <Link 
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 relative",
                  isActive(route.path) 
                    ? "text-foreground bg-accent/10 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                )}
              >
                {route.icon}
                <span>{route.name}</span>
                {isActive(route.path) && (
                  <motion.div 
                    layoutId="navbar-indicator-desktop" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 mx-3 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </Link>
            ))}
          </div>
          
          <ThemeToggle />
          
          <Button variant="gradient" size="sm" asChild animated className="px-5 transition-shadow rounded-full shadow-md hover:shadow-lg">
            <Link href="/create">
              <RiAddLine size={18} className="mr-1" />
              New Entry
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? "close" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isMenuOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t shadow-lg md:hidden border-border/10 bg-background/95 backdrop-blur-lg"
          >
            <div className="container px-4 py-4 mx-auto space-y-3">
              {routes.map((route) => (
                <Link 
                  key={route.path}
                  href={route.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full relative overflow-hidden",
                    isActive(route.path)
                      ? "bg-accent/20 text-foreground shadow-sm" 
                      : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-lg">{route.icon}</span>
                  <span className="font-medium">{route.name}</span>
                  {isActive(route.path) && (
                    <motion.div 
                      layoutId="navbar-indicator-mobile" 
                      className="absolute top-0 bottom-0 left-0 w-1 bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </Link>
              ))}
              
              <div className="pt-3">
                <Button variant="gradient" className="w-full py-6 rounded-lg shadow-md" asChild>
                  <Link href="/create" onClick={() => setIsMenuOpen(false)}>
                    <RiAddLine size={20} className="mr-2" />
                    Create New Entry
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}