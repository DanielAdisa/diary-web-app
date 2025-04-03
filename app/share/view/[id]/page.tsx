'use client';

import { useEffect, useState, use } from 'react';
import { getEntryById, DiaryEntry } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { RiCalendarLine, RiImage2Line, RiVolumeUpLine } from 'react-icons/ri';
import { format } from 'date-fns';

// Update the props type to match Next.js expectations
type SharedEntryViewProps = {
  params: Promise<{ id: string }>;
};

export default function SharedEntryView({ params }: SharedEntryViewProps) {
  // Use React.use() to unwrap params
  const { id } = use(params);
  const { theme } = useTheme();
  
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      try {
        const fetchedEntry = await getEntryById(id);
        if (fetchedEntry) {
          setEntry(fetchedEntry);
        } else {
          setError('The diary entry you requested could not be found');
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        setError('An error occurred while loading the entry');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-2 rounded-full border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl p-6 mx-auto text-center">
        <div className="p-8 border rounded-xl bg-card/80">
          <h1 className="mb-4 text-2xl font-bold text-red-500">Entry Not Found</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button onClick={() => window.close()}>Close</Button>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  return (
    <div className="max-w-3xl p-6 mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border rounded-xl bg-card/80"
      >
        <div className="flex items-center mb-4 text-muted-foreground">
          <RiCalendarLine className="mr-2" />
          <time dateTime={entry.date}>
            {format(new Date(entry.date), 'MMMM d, yyyy')}
          </time>
        </div>
        
        <h1 className="mb-6 text-3xl font-bold">{entry.title}</h1>
        
        <div className="mb-8 prose dark:prose-invert max-w-none">
          {entry.content.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
        
        {entry.imageUrls && entry.imageUrls.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4 gap-x-2">
              <RiImage2Line size={20} />
              <h2 className="text-lg font-medium">Photos</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {entry.imageUrls.map((url, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg aspect-video">
                  <Image 
                    src={url} 
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {entry.audioUrl && (
          <div className="mb-6">
            <div className="flex items-center mb-3 gap-x-2">
              <RiVolumeUpLine size={20} />
              <h2 className="text-lg font-medium">Voice Recording</h2>
            </div>
            <audio 
              controls 
              src={entry.audioUrl} 
              className="w-full"
            />
          </div>
        )}
        
        <div className="p-4 mt-8 text-sm text-center border rounded-md bg-muted/50">
          <p className="text-muted-foreground">
            This is a shared diary entry from MyDiary web app.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
