'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, deleteEntryById, DiaryEntry } from '../../../lib/storage';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
  RiShareLine
} from 'react-icons/ri';

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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      try {
        const fetchedEntry = await getEntryById(id);
        if (fetchedEntry) {
          setEntry(fetchedEntry);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-2 rounded-full border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!entry) return null;

  const hasImages = Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/">
        <Button variant="ghost" size="sm" className="flex items-center gap-1 mb-6 text-muted-foreground hover:text-foreground">
          <RiArrowLeftLine size={16} />
          <span>Back</span>
        </Button>
      </Link>
      
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
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-6 border-t border-border/50"
        >
          <div className="flex gap-2">
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
