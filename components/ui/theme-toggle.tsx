'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { RiSunLine, RiMoonClearLine, RiComputerLine } from 'react-icons/ri';
import { Button } from './button';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className={`${className}`}>
      <div className="flex items-center p-1 space-x-1 border rounded-lg bg-card/50 border-border">
        <ThemeButton 
          active={theme === 'light'} 
          onClick={() => setTheme('light')}
          tooltip="Light mode"
        >
          <RiSunLine size={18} />
        </ThemeButton>
        
        <ThemeButton 
          active={theme === 'dark'} 
          onClick={() => setTheme('dark')}
          tooltip="Dark mode"
        >
          <RiMoonClearLine size={18} />
        </ThemeButton>
        
        <ThemeButton 
          active={theme === 'system'} 
          onClick={() => setTheme('system')}
          tooltip="System preference"
        >
          <RiComputerLine size={18} />
        </ThemeButton>
      </div>
    </div>
  );
}

function ThemeButton({ 
  active, 
  onClick, 
  children, 
  tooltip 
}: { 
  active: boolean, 
  onClick: () => void, 
  children: React.ReactNode,
  tooltip: string 
}) {
  return (
    <div className="relative group">
      <Button 
        variant="ghost"
        size="icon"
        aria-label={tooltip}
        onClick={onClick}
        className={`relative ${active ? 'bg-primary text-primary-foreground' : ''}`}
      >
        {children}
      </Button>
      <span className="absolute invisible px-2 py-1 text-xs transition-opacity -translate-x-1/2 border rounded-md opacity-0 bottom-full left-1/2 whitespace-nowrap text-foreground bg-background border-border group-hover:visible group-hover:opacity-100">
        {tooltip}
      </span>
      {active && (
        <motion.div 
          layoutId="theme-active-indicator"
          className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
          transition={{ type: "spring", duration: 0.4 }}
        />
      )}
    </div>
  );
}