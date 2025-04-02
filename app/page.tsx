'use client';
import { useEffect, useState } from 'react';
import { getAllEntries, deleteEntryById, DiaryEntry } from '../lib/storage';
import EntryCard from '../components/EntryCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { 
  RiAddLine, 
  RiBookOpenLine, 
  RiBookletLine,
  RiQuillPenLine,
  RiSearchLine,
  RiMoonClearLine,
  RiSunLine
} from 'react-icons/ri';
import { useTheme } from 'next-themes';

export default function HomePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  
  const fetchEntries = async () => {
    setIsLoading(true);
    const fetchedEntries = await getAllEntries();
    setEntries(fetchedEntries);
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchEntries();
  }, []);
  
  const handleDelete = async (id: string) => {
    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
      title: 'Delete this entry?',
      text: 'This entry will be permanently deleted',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'hsl(var(--primary))',
      cancelButtonColor: 'hsl(var(--muted))',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      backdrop: `rgba(0,0,0,0.6)`,
      background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
      customClass: {
        popup: 'rounded-xl shadow-xl border border-white/10',
        title: 'text-lg',
        confirmButton: 'rounded-lg',
        cancelButton: 'rounded-lg',
      },
      iconColor: 'hsl(var(--destructive))',
    });
    
    if (result.isConfirmed) {
      await deleteEntryById(id);
      fetchEntries(); // Refresh entries
      
      Swal.fire({
        title: 'Deleted',
        text: 'Your entry has been deleted',
        icon: 'success',
        confirmButtonColor: 'hsl(var(--primary))',
        timer: 1500,
        timerProgressBar: true,
        background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-white/10',
        },
      });
    }
  };
  
  // Filter entries based on search query
  const filteredEntries = searchQuery 
    ? entries.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        entry.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-full mx-auto max-w-7xl">
      {/* Hero Section with 2025 Glassmorphism Design */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 to-accent/5 dark:from-primary/5 dark:to-accent/5"
      >
        {/* Abstract animated background elements */}
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary/10 blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-accent/10 blur-3xl animate-glow-pulse"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30"></div>
        
        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute flex items-center justify-center p-3 rounded-full right-5 top-5 backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <RiSunLine size={18} /> : <RiMoonClearLine size={18} />}
        </motion.button>
        
        <div className="relative z-10 flex flex-col items-start p-8 md:p-10">
          <div className="p-2.5 mb-5 rounded-2xl flex items-center justify-center bg-white/15 dark:bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner">
            <RiQuillPenLine size={24} className="text-primary" />
          </div>
          
          <h1 className="mb-2 text-4xl font-bold text-foreground md:text-5xl">
            My Journal
          </h1>
          
          <p className="max-w-2xl mb-7 text-lg text-muted-foreground md:text-xl">
            Capture your thoughts, memories, and inspirations in one beautiful place.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/create">
              <Button className="flex items-center gap-2 px-6 py-6 font-medium transition-all shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-primary/20 hover:shadow-primary/30">
                <RiAddLine className="mr-1" size={18} />
                Create New Entry
                <motion.span 
                  animate={{ x: [0, 3, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }} 
                  className="ml-1 opacity-80"
                >→</motion.span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Search & Entries Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-5 mb-6 md:items-center md:flex-row md:justify-between">
          <h2 className="flex items-center text-2xl font-bold text-foreground">
            Your Entries
            <span className="px-3 py-1 ml-3 text-sm font-medium rounded-full bg-primary/10 text-primary">
              {entries.length}
            </span>
          </h2>
          
          <div className="relative max-w-xs">
            <RiSearchLine className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search entries..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm transition-all bg-transparent border rounded-lg border-border focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          </div>
        ) : filteredEntries.length === 0 && searchQuery ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center border bg-card/50 border-border rounded-xl"
          >
            <div className="flex flex-col items-center justify-center">
              <RiSearchLine className="mb-3 text-muted-foreground" size={32} />
              <h3 className="mb-2 text-xl font-medium text-foreground">No matching entries</h3>
              <p className="mb-4 text-muted-foreground">Try searching with different keywords</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          </motion.div>
        ) : entries.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-8 text-center bg-gradient-glass backdrop-blur-sm border border-white/10 rounded-xl"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-primary/10">
                <RiBookletLine className="text-primary" size={32} />
              </div>
              <h3 className="mb-2 text-xl font-medium text-foreground">No entries yet</h3>
              <p className="mb-6 text-muted-foreground">Start by creating your first journal entry</p>
              <Link href="/create">
                <Button className="font-medium rounded-lg">
                  <RiAddLine className="mr-2" /> Create First Entry
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={itemVariants}
              >
                <Link href={`/view/${entry.id}`} className="block h-full">
                  <EntryCard entry={entry} onDelete={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Floating Action Button for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Link href="/create">
          <Button className="flex items-center justify-center rounded-full shadow-lg w-14 h-14 bg-primary hover:bg-primary/90 shadow-primary/20">
            <RiAddLine size={24} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
