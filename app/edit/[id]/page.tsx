'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, updateEntry, DiaryEntry } from '../../../lib/storage';
import { fileToBase64 } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useTheme } from 'next-themes';
import VoiceRecorder from '@/components/VoiceRecorder';
import Image from 'next/image';
import { 
  RiImageAddLine,
  RiMicLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiImageLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiCheckLine
} from 'react-icons/ri';

type EditEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = use(params);
  const { theme } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [existingAudio, setExistingAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      try {
        const entry = await getEntryById(id);
        if (entry) {
          setTitle(entry.title);
          setContent(entry.content);
          setExistingImages(Array.isArray(entry.imageUrls) ? entry.imageUrls : []);
          setExistingAudio(entry.audioUrl || null);
        } else {
          Swal.fire({
            title: 'Entry not found',
            text: 'The diary entry you wanted to edit could not be found',
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
        console.error('Failed to fetch entry:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [id, router, theme]);

  useEffect(() => {
    // Generate image previews when new images are selected
    const previews: string[] = [];
    images.forEach(image => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previews.push(e.target.result as string);
          if (previews.length === images.length) {
            setImagePreviews([...previews]);
          }
        }
      };
      reader.readAsDataURL(image);
    });
    
    if (images.length === 0) {
      setImagePreviews([]);
    }
  }, [images]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Swal.fire({
        title: 'Missing title',
        text: 'Please enter a title for your entry',
        icon: 'warning',
        confirmButtonColor: 'hsl(var(--primary))',
        background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-white/10',
        },
      });
      return;
    }

    if (!content.trim()) {
      Swal.fire({
        title: 'Missing content',
        text: 'Please write something in your diary entry',
        icon: 'warning',
        confirmButtonColor: 'hsl(var(--primary))',
        background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-white/10',
        },
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert new images to base64 and get URLs
      const imagePromises = images.map(file => fileToBase64(file));
      const newImageUrls = await Promise.all(imagePromises);
      
      // Combine existing and new images
      const allImageUrls = [...existingImages, ...newImageUrls];
      
      // Use the new audio if provided, otherwise keep existing
      const audioUrl = audio !== null ? audio : existingAudio;

      const updatedEntry: DiaryEntry = {
        id,
        title,
        content,
        date: new Date().toISOString(),
        imageUrls: allImageUrls,
        audioUrl: audioUrl || undefined,
      };

      await updateEntry(updatedEntry);

      Swal.fire({
        title: 'Entry updated!',
        text: 'Your diary entry has been updated successfully',
        icon: 'success',
        confirmButtonColor: 'hsl(var(--primary))',
        timer: 1500,
        timerProgressBar: true,
        background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-white/10',
        },
      });

      router.push(`/view/${id}`);
    } catch (error) {
      console.error('Error updating entry:', error);
      
      Swal.fire({
        title: 'Error',
        text: 'There was a problem updating your entry. Please try again.',
        icon: 'error',
        confirmButtonColor: 'hsl(var(--primary))',
        background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
        customClass: {
          popup: 'rounded-xl shadow-xl border border-white/10',
        },
      });
      
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-2 rounded-full border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/view/${id}`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine size={16} />
            <span>Back</span>
          </Button>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold md:text-3xl">Edit Entry</h1>
        </motion.div>
        
        <div className="w-20"></div> {/* Placeholder for layout balance */}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Title input */}
        <div>
          <input
            type="text"
            placeholder="Entry title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 text-lg font-medium transition-all bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary border-border"
          />
        </div>
        
        {/* Content textarea */}
        <div>
          <textarea
            placeholder="Write your thoughts here..."
            value={content}
            rows={12}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 transition-all bg-transparent border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary border-border"
          />
        </div>
        
        {/* Images section */}
        <div className="p-5 border rounded-lg bg-card/50 border-border">
          <h2 className="flex items-center mb-4 text-lg font-medium">
            <RiImageLine className="mr-2 text-primary" size={20} /> 
            Images
          </h2>
          
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Current images</h3>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((imageUrl, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="relative w-24 h-24 overflow-hidden rounded-lg bg-black/5">
                      <Image
                        src={imageUrl}
                        alt={`Existing image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute flex items-center justify-center p-1 transition-opacity bg-black rounded-full opacity-0 -top-2 -right-2 group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <RiCloseLine className="text-white" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add new images */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Add new images</h3>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group">
                  <div className="relative w-24 h-24 overflow-hidden rounded-lg bg-black/5">
                    <img 
                      src={preview} 
                      alt={`New image ${index + 1}`} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute flex items-center justify-center p-1 transition-opacity bg-black rounded-full opacity-0 -top-2 -right-2 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <RiCloseLine className="text-white" size={14} />
                  </button>
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center w-24 h-24 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary hover:bg-primary/5">
                <RiImageAddLine size={24} className="mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Audio recording section */}
        <div className="p-5 border rounded-lg bg-card/50 border-border">
          <h2 className="flex items-center mb-4 text-lg font-medium">
            <RiMicLine className="mr-2 text-primary" size={20} /> 
            Voice Recording
          </h2>
          
          {existingAudio ? (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Current recording</h3>
              <div className="flex items-center justify-between p-3 border rounded-lg border-border">
                <audio
                  controls
                  src={existingAudio}
                  className="w-full h-10 max-w-md"
                >
                  Your browser does not support the audio element.
                </audio>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExistingAudio(null)}
                  className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <RiDeleteBin6Line size={16} />
                </Button>
              </div>
              
              <div className="flex items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExistingAudio(null)}
                  className="flex items-center gap-1.5"
                >
                  <RiMicLine size={16} />
                  Record new audio
                </Button>
              </div>
            </div>
          ) : (
            <VoiceRecorder 
              onAudioReady={(audio) => setAudio(audio)} 
              onRecordingStateChange={setIsRecording}
            />
          )}
        </div>
        
        {/* Update button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleUpdate}
            disabled={isSubmitting || isRecording}
            animated
            className="px-6 py-6 text-base"
          >
            <RiCheckLine size={18} />
            {isSubmitting ? 'Saving...' : 'Update Entry'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
