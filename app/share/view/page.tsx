'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  RiPlayFill, 
  RiPauseFill, 
  RiVolumeMuteFill, 
  RiVolumeUpFill,
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLinkM,
  RiInformationLine,
  RiFileTextLine,
  RiLayoutGridLine,
  RiAlignLeft,
  RiImageLine
} from 'react-icons/ri';
import { cn } from '@/lib/utils';

type DiaryEntryData = {
  title: string;
  content: string;
  date: string;
  imageUrls: string[]; // Array of Base64 image strings
  audioUrl?: string | null;
};

type ViewMode = 'picture' | 'entry';

export default function SharedEntryViewPage() {
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const router = useRouter();

  const [entry, setEntry] = useState<DiaryEntryData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('entry');
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
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
    
    if (viewMode === 'picture' && imageContainerRef.current && entry?.imageUrls?.length) {
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
    const loadSharedEntry = () => {
      setIsLoading(true);
      try {
        const data = searchParams.get('data');
        
        if (!data) {
          setError('No entry data found in URL');
          setIsLoading(false);
          return;
        }
        
        // Decode the URL data
        const decodedData = JSON.parse(atob(decodeURIComponent(data)));
        setEntry(decodedData);
        
        if (decodedData.imageUrls?.length > 0 && (!decodedData.content || decodedData.content.trim() === '')) {
          setViewMode('picture');
        }
      } catch (error) {
        console.error('Error loading shared entry:', error);
        setError('Could not load the shared entry. The link may be invalid or corrupted.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedEntry();
  }, [searchParams]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-4">
        <div className="max-w-md p-6 text-center border rounded-xl bg-card">
          <RiInformationLine className="mx-auto mb-4 text-destructive" size={48} />
          <h1 className="mb-2 text-xl font-bold text-destructive">Error Loading Entry</h1>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button 
            onClick={() => router.push('/')} 
            variant="outline"
            className="flex items-center mx-auto gap-1.5"
          >
            <RiArrowLeftLine size={16} />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  const hasImages = Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0;
  
  if (viewMode === 'picture' && hasImages) {
    return (
      <div className="relative min-h-[calc(100vh-68px)]">
        <div className="p-4 bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{entry.title}</h1>
            <div className="p-2 ml-auto text-xs rounded-md bg-muted/70">
              <RiLinkM className="inline-block mr-1" size={14} />
              Shared Entry
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
        </div>
        
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
        
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center w-full px-4 py-3 border-t bg-background/80 backdrop-blur-md border-border/40">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleViewMode}
            className="flex items-center gap-2"
          >
            <RiAlignLeft size={16} />
            <span className="ml-1">Text View</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{entry.title}</h1>
          <p className="mt-1 text-muted-foreground">{formatDate(entry.date)}</p>
        </div>
        <div className="p-2 ml-auto text-sm rounded-md bg-muted/70">
          <RiLinkM className="inline-block mr-1" size={14} />
          Shared Entry
        </div>
      </div>
      
      <div className="space-y-8">
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
            <div 
              className="whitespace-pre-wrap text-card-foreground"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </motion.div>
        )}
        
        {hasImages && (
          <div className="flex justify-center pt-4 mt-6 border-t border-border/50">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleViewMode}
              className="flex items-center gap-1.5"
            >
              <RiLayoutGridLine size={16} />
              <span>Image View</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}