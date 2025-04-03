'use client';
import { useEffect, useState } from 'react';
import { getAllEntries, deleteEntryById, DiaryEntry } from '../lib/storage';
import EntryCard from '../components/EntryCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiAddLine, 
  RiBookOpenLine, 
  RiBookletLine,
  RiQuillPenLine,
  RiSearchLine,
  RiMoonClearLine,
  RiSunLine,
  RiFilterLine,
  RiCalendarLine,
  RiSortAsc,
  RiSortDesc,
  RiArchiveLine,
  RiPriceTag3Line
} from 'react-icons/ri';
import { useTheme } from 'next-themes';

type SortOption = 'newest' | 'oldest' | 'alphabetical';
type FilterOption = 'all' | 'hasImage' | 'hasAudio';

export default function HomePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    withImages: 0,
    withAudio: 0,
    thisMonth: 0
  });
  const { theme, setTheme } = useTheme();
  
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const fetchedEntries = await getAllEntries();
      setEntries(fetchedEntries);
      
      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      setStats({
        total: fetchedEntries.length,
        withImages: fetchedEntries.filter(entry => entry.imageUrls?.length > 0).length,
        withAudio: fetchedEntries.filter(entry => entry.audioUrl).length,
        thisMonth: fetchedEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        }).length
      });
    } catch (error) {
      console.error('Error fetching entries:', error);
      // Show error message
      Swal.fire({
        title: 'Error',
        text: 'Failed to load your entries',
        icon: 'error',
        confirmButtonColor: 'hsl(var(--primary))'
      });
    } finally {
      setIsLoading(false);
    }
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
  
  // Sort entries
  const sortEntries = (entries: DiaryEntry[]) => {
    switch (sortBy) {
      case 'newest':
        return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'oldest':
        return [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'alphabetical':
        return [...entries].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return entries;
    }
  };
  
  // Filter entries
  const filterEntries = (entries: DiaryEntry[]) => {
    switch (filterBy) {
      case 'hasImage':
        return entries.filter(entry => entry.imageUrls?.length > 0);
      case 'hasAudio':
        return entries.filter(entry => entry.audioUrl);
      default:
        return entries;
    }
  };
  
  // Filter entries based on search query and apply sorting
  const processedEntries = sortEntries(
    filterEntries(
      searchQuery 
        ? entries.filter(entry => 
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            entry.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : entries
    )
  );
  
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

  // Stats cards row
  const renderStatsCards = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4"
    >
      {/* Total Entries */}
      <div className="overflow-hidden transition-colors border rounded-xl bg-card/50 border-border/30 backdrop-blur-sm hover:border-primary/30 group">
        <div className="p-4">
          <div className="flex items-center justify-center p-2 mb-2 transition-colors rounded-full w-9 h-9 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <RiBookletLine size={18} />
          </div>
          <p className="text-sm text-muted-foreground">Total Entries</p>
          <h4 className="text-2xl font-bold text-foreground">{stats.total}</h4>
        </div>
      </div>
      
      {/* This Month */}
      <div className="overflow-hidden transition-colors border rounded-xl bg-card/50 border-border/30 backdrop-blur-sm hover:border-primary/30 group">
        <div className="p-4">
          <div className="flex items-center justify-center p-2 mb-2 transition-colors rounded-full w-9 h-9 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground">
            <RiCalendarLine size={18} />
          </div>
          <p className="text-sm text-muted-foreground">This Month</p>
          <h4 className="text-2xl font-bold text-foreground">{stats.thisMonth}</h4>
        </div>
      </div>
      
      {/* With Images */}
      <div className="overflow-hidden transition-colors border rounded-xl bg-card/50 border-border/30 backdrop-blur-sm hover:border-primary/30 group">
        <div className="p-4">
          <div className="flex items-center justify-center p-2 mb-2 transition-colors rounded-full w-9 h-9 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <RiBookOpenLine size={18} />
          </div>
          <p className="text-sm text-muted-foreground">With Images</p>
          <h4 className="text-2xl font-bold text-foreground">{stats.withImages}</h4>
        </div>
      </div>
      
      {/* With Audio */}
      <div className="overflow-hidden transition-colors border rounded-xl bg-card/50 border-border/30 backdrop-blur-sm hover:border-primary/30 group">
        <div className="p-4">
          <div className="flex items-center justify-center p-2 mb-2 transition-colors rounded-full w-9 h-9 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground">
            <RiArchiveLine size={18} />
          </div>
          <p className="text-sm text-muted-foreground">With Audio</p>
          <h4 className="text-2xl font-bold text-foreground">{stats.withAudio}</h4>
        </div>
      </div>
    </motion.div>
  );

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
        <div className="absolute bottom-0 right-0 rounded-full w-60 h-60 bg-accent/10 blur-3xl animate-glow-pulse"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30"></div>
        
        <div className="relative z-10 flex flex-col items-start p-8 md:p-10">
          <div className="p-2.5 mb-5 rounded-2xl flex items-center justify-center bg-white/15 dark:bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner">
            <RiQuillPenLine size={24} className="text-primary" />
          </div>
          
          <h1 className="mb-2 text-4xl font-bold text-foreground md:text-5xl">
            My Journal
          </h1>
          
          <p className="max-w-2xl text-lg mb-7 text-muted-foreground md:text-xl">
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

            <Button 
              variant="outline" 
              className="gap-2 px-5 py-6 font-medium border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl"
              onClick={() => {
                if (stats.total > 0) {
                  // Get a random entry ID from available entries
                  const randomIndex = Math.floor(Math.random() * entries.length);
                  const randomId = entries[randomIndex].id;
                  // Navigate to the random entry
                  window.location.href = `/view/${randomId}`;
                } else {
                  Swal.fire({
                    title: 'No entries',
                    text: 'Create your first entry to use this feature',
                    icon: 'info',
                    confirmButtonColor: 'hsl(var(--primary))'
                  });
                }
              }}
            >
              <RiBookOpenLine size={18} />
              Random Entry
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Statistics Cards */}
      {!isLoading && entries.length > 0 && renderStatsCards()}
      
      {/* Search & Entries Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-5 mb-6 md:items-center md:flex-row md:justify-between">
          <h2 className="flex items-center text-2xl font-bold text-foreground">
            Your Entries
            <span className="px-3 py-1 ml-3 text-sm font-medium rounded-full bg-primary/10 text-primary">
              {processedEntries.length}
            </span>
          </h2>
          
          <div className="flex flex-wrap gap-3 lg:gap-4">
            {/* Search input */}
            <div className="relative md:w-64">
              <RiSearchLine className="absolute transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search entries..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm transition-all bg-transparent border rounded-lg border-border focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            
            {/* Filter dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9"
                onClick={() => {
                  setShowFilterOptions(!showFilterOptions);
                  setShowSortOptions(false);
                }}
              >
                <RiFilterLine size={18} />
                <span className="hidden sm:inline">Filter</span>
                {filterBy !== 'all' && <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">1</span>}
              </Button>
              
              <AnimatePresence>
                {showFilterOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 z-50 mt-2 overflow-hidden border shadow-lg bg-card/90 backdrop-blur-sm border-border rounded-xl w-44"
                  >
                    <div className="py-1">
                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/10 ${filterBy === 'all' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setFilterBy('all');
                          setShowFilterOptions(false);
                        }}
                      >
                        All Entries
                      </button>
                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/10 ${filterBy === 'hasImage' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setFilterBy('hasImage');
                          setShowFilterOptions(false);
                        }}
                      >
                        With Images
                      </button>
                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/10 ${filterBy === 'hasAudio' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setFilterBy('hasAudio');
                          setShowFilterOptions(false);
                        }}
                      >
                        With Audio
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Sort dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9"
                onClick={() => {
                  setShowSortOptions(!showSortOptions);
                  setShowFilterOptions(false);
                }}
              >
                {sortBy === 'newest' ? <RiSortDesc size={18} /> : <RiSortAsc size={18} />}
                <span className="hidden sm:inline">Sort</span>
              </Button>
              
              <AnimatePresence>
                {showSortOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 z-50 mt-2 overflow-hidden border shadow-lg bg-card/90 backdrop-blur-sm border-border rounded-xl w-44"
                  >
                    <div className="py-1">
                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/10 ${sortBy === 'newest' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setSortBy('newest');
                          setShowSortOptions(false);
                        }}
                      >
                        Newest First
                      </button>
                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/10 ${sortBy === 'oldest' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setSortBy('oldest');
                          setShowSortOptions(false);
                        }}
                      >
                        Oldest First
                      </button>
                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-primary/10 ${sortBy === 'alphabetical' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => {
                          setSortBy('alphabetical');
                          setShowSortOptions(false);
                        }}
                      >
                        Alphabetical
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center border h-60 rounded-xl border-border bg-card/30 backdrop-blur-sm">
            <div className="w-12 h-12 mb-4 border-2 rounded-full border-primary/30 border-t-primary animate-spin"></div>
            <p className="text-muted-foreground">Loading your journal entries...</p>
          </div>
        ) : processedEntries.length === 0 && searchQuery ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center border bg-card/50 border-border rounded-xl"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 mb-4 rounded-full bg-secondary/50">
                <RiSearchLine className="text-muted-foreground" size={32} />
              </div>
              <h3 className="mb-2 text-xl font-medium text-foreground">No matching entries</h3>
              <p className="mb-6 text-muted-foreground">
                {filterBy !== 'all' 
                  ? `No entries match your search query with the current filter.` 
                  : `Try searching with different keywords`}
              </p>
              <div className="flex gap-3">
                {filterBy !== 'all' && (
                  <Button variant="secondary" onClick={() => setFilterBy('all')}>
                    Clear Filter
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </div>
            </div>
          </motion.div>
        ) : entries.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-12 text-center border bg-gradient-glass backdrop-blur-sm border-white/10 rounded-xl"
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
          <>
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${sortBy}-${filterBy}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                variants={containerVariants}
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              >
                {processedEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
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
            </AnimatePresence>
            
            {/* No results with filter enabled */}
            {processedEntries.length === 0 && filterBy !== 'all' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 mt-8 text-center border bg-card/50 border-border rounded-xl"
              >
                <div className="flex flex-col items-center justify-center">
                  <RiFilterLine className="mb-3 text-muted-foreground" size={32} />
                  <h3 className="mb-2 text-xl font-medium text-foreground">No entries match your filter</h3>
                  <p className="mb-4 text-muted-foreground">Try selecting a different filter option</p>
                  <Button variant="outline" onClick={() => setFilterBy('all')}>
                    Clear Filter
                  </Button>
                </div>
              </motion.div>
            )}
          </>
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
