'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, deleteEntryById, DiaryEntry } from '../../../lib/storage';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useTheme } from 'next-themes';
import { 
  RiPlayFill, 
  RiPauseFill, 
  RiVolumeMuteFill, 
  RiVolumeUpFill,
  RiArrowLeftLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiImageLine,
  RiImageAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiShareLine,
  RiFileTextLine,
  RiLayoutGridLine,
  RiAlignLeft
} from 'react-icons/ri';
import { cn } from '@/lib/utils';

type ViewMode = 'picture' | 'entry';

type ViewEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default function ViewEntryPage({ params }: ViewEntryPageProps) {
  const { id } = use(params);
  const { theme } = useTheme();

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('entry');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX.current) return;
      
      touchEndX.current = e.changedTouches[0].clientX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      
      const swipeDistance = touchEndX.current - touchStartX.current;
      const minSwipeDistance = 50;
      
      if (swipeDistance > minSwipeDistance && entry?.imageUrls?.length) {
        goToPreviousImage();
      } else if (swipeDistance < -minSwipeDistance && entry?.imageUrls?.length) {
        goToNextImage();
      }
      
      touchStartX.current = null;
      touchEndX.current = null;
    };
    
    if (viewMode === 'picture' && imageContainerRef.current) {
      const element = imageContainerRef.current;
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [viewMode, entry]);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      try {
        const fetchedEntry = await getEntryById(id);
        if (fetchedEntry) {
          setEntry(fetchedEntry);
          if (fetchedEntry.imageUrls?.length > 0 && (!fetchedEntry.content || fetchedEntry.content.trim() === '')) {
            setViewMode('picture');
          }
        } else {
          Swal.fire({
            title: 'Entry not found',
            text: 'The diary entry you requested could not be found',
            icon: 'error',
            confirmButtonColor: 'hsl(var(--primary))',
            background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
            customClass: {
              popup: 'rounded-xl shadow-xl border border-white/10',
            },
          }).then(() => {
            router.push('/');
          });
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [id, router, theme]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete this entry?',
      text: 'This entry will be permanently deleted',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'hsl(var(--destructive))',
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
      try {
        await deleteEntryById(id);
        
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
        
        router.push('/');
      } catch (error) {
        console.error('Error deleting entry:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete entry. Please try again.',
          icon: 'error',
          confirmButtonColor: 'hsl(var(--primary))',
        });
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = audioVolume;
        setIsMuted(false);
      } else {
        setAudioVolume(audioRef.current.volume);
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress || 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickPositionRelative = e.clientX - rect.left;
      const progressBarWidth = rect.width;
      const progress = clickPositionRelative / progressBarWidth;
      audioRef.current.currentTime = progress * audioRef.current.duration;
    }
  };

  const goToNextImage = () => {
    if (entry && entry.imageUrls?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % entry.imageUrls.length);
    }
  };

  const goToPreviousImage = () => {
    if (entry && entry.imageUrls?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + entry.imageUrls.length) % entry.imageUrls.length);
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'entry' ? 'picture' : 'entry');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-2 rounded-full border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!entry) return null;

  const hasImages = Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0;
  
  if (viewMode === 'picture' && hasImages) {
    return (
      <div className="relative min-h-[calc(100vh-68px)]">
        <div 
          ref={imageContainerRef}
          className="relative flex items-center justify-center w-full h-[80vh] bg-black/90"
        >
          <Image
            src={entry.imageUrls[currentImageIndex]}
            alt={`Diary entry image ${currentImageIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
          
          <div className="absolute z-10 flex items-center justify-between w-full px-4 transform -translate-y-1/2 top-1/2">
            <button 
              onClick={goToPreviousImage}
              className="flex items-center justify-center p-3 transition-all rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
              aria-label="Previous image"
            >
              <RiArrowLeftSLine className="text-white" size={24} />
            </button>
            
            <button 
              onClick={goToNextImage}
              className="flex items-center justify-center p-3 transition-all rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
              aria-label="Next image"
            >
              <RiArrowRightSLine className="text-white" size={24} />
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/80 to-transparent">
            <h1 className="text-xl font-bold">{entry.title}</h1>
            <p className="text-sm text-white/70">{formatDate(entry.date)}</p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <span className="flex items-center">
                  <RiImageLine className="mr-1" size={14} />
                  {currentImageIndex + 1}/{entry.imageUrls.length}
                </span>
              </div>
              
              {entry.audioUrl && (
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center p-2 transition-all rounded-full bg-white/20 hover:bg-white/30"
                >
                  {audioPlaying ? <RiPauseFill size={18} /> : <RiPlayFill size={18} />}
                </button>
              )}
            </div>
          </div>
          
          {entry.imageUrls.length > 1 && (
            <div className="absolute bottom-20 flex gap-1.5 left-1/2 transform -translate-x-1/2">
              {entry.imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {entry.audioUrl && (
            <audio
              ref={audioRef}
              src={entry.audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={() => setAudioPlaying(false)}
              className="hidden"
            />
          )}
        </div>
        
        {entry.content && entry.content.trim() !== '' && (
          <div className="max-w-xl p-4 mx-auto mt-4">
            <div className="p-4 italic border rounded-lg text-muted-foreground border-border/50 bg-muted/30 line-clamp-3">
              "{entry.content}"
            </div>
          </div>
        )}
        
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between w-full px-4 py-3 border-t bg-background/80 backdrop-blur-md border-border/40">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleViewMode}
              className="flex items-center gap-2"
            >
              <RiAlignLeft size={16} />
              <span className="ml-1 sr-only sm:not-sr-only">Text View</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/share/${entry.id}`)}
              className="text-accent"
            >
              <RiShareLine size={18} />
              <span className="ml-1 sr-only sm:not-sr-only">Share</span>
            </Button>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
          >
            <RiDeleteBin6Line size={18} />
            <span className="ml-1 sr-only sm:not-sr-only">Delete</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <div className="space-y-8">
        <div className="relative">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold md:text-4xl"
          >
            {entry.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-2 text-muted-foreground"
          >
            {formatDate(entry.date)}
          </motion.p>
        </div>
        
        {hasImages && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative overflow-hidden rounded-lg bg-black/5 aspect-[16/9]"
          >
            <Image
              src={entry.imageUrls[currentImageIndex]}
              alt={`Diary entry image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            />
            
            {entry.imageUrls.length > 1 && (
              <>
                <div className="absolute z-10 flex items-center justify-between w-full px-4 transform -translate-y-1/2 top-1/2">
                  <button 
                    onClick={goToPreviousImage}
                    className="flex items-center justify-center p-2 transition-all rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
                    aria-label="Previous image"
                  >
                    <RiArrowLeftSLine className="text-white" size={20} />
                  </button>
                  <button 
                    onClick={goToNextImage}
                    className="flex items-center justify-center p-2 transition-all rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
                    aria-label="Next image"
                  >
                    <RiArrowRightSLine className="text-white" size={20} />
                  </button>
                </div>
                
                <div className="absolute bottom-4 flex gap-1.5 left-1/2 transform -translate-x-1/2">
                  {entry.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            
            <div className="absolute flex items-center justify-center px-3 py-1 text-xs text-white rounded-lg top-3 right-3 bg-black/50 backdrop-blur-sm">
              <RiImageLine className="mr-1.5" size={14} />
              {currentImageIndex + 1} / {entry.imageUrls.length}
            </div>
          </motion.div>
        )}
        
        {entry.audioUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6"
          >
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Audio recording</h3>
            <div className="flex items-center p-4 space-x-4 glass-card rounded-xl">
              <button
                onClick={togglePlayPause}
                className="flex items-center justify-center w-10 h-10 text-white rounded-full shadow-lg bg-primary hover:bg-primary/90 focus:outline-none"
              >
                {audioPlaying ? <RiPauseFill size={20} /> : <RiPlayFill size={20} />}
              </button>
              
              <div className="flex-grow">
                <div
                  className="relative h-2 rounded-full cursor-pointer bg-primary/20"
                  onClick={handleProgressClick}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-primary"
                    style={{ width: `${audioProgress}%` }}
                  ></div>
                  <div 
                    className="absolute w-3 h-3 transform -translate-y-1/2 rounded-full shadow-md top-1/2 bg-primary"
                    style={{ left: `${audioProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={toggleMute}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                {isMuted ? <RiVolumeMuteFill size={18} /> : <RiVolumeUpFill size={18} />}
              </button>
              
              <audio
                ref={audioRef}
                src={entry.audioUrl}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => setAudioPlaying(false)}
                className="hidden"
              />
            </div>
          </motion.div>
        )}
        
        {entry.content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="p-6 leading-relaxed border rounded-xl bg-card/50 border-border"
          >
            <div className="whitespace-pre-wrap text-card-foreground">
              {entry.content}
            </div>
          </motion.div>
        )}
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-border/50"
        >
          <div className="flex gap-2">
            {hasImages && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleViewMode}
                className="flex items-center gap-1.5"
              >
                <RiLayoutGridLine size={16} />
                <span>Image View</span>
              </Button>
            )}
          
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/edit/${entry.id}`)}
              className="flex items-center gap-1.5"
            >
              <RiEditLine size={16} />
              <span>Edit</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/share/${entry.id}`)}
              className="flex items-center gap-1.5 text-accent hover:text-accent-foreground"
            >
              <RiShareLine size={16} />
              <span>Share</span>
            </Button>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-1.5"
          >
            <RiDeleteBin6Line size={16} />
            <span>Delete</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
