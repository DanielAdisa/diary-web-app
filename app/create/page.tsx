'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveEntryWithImages } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';
import Swal from 'sweetalert2';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { 
  RiImageAddLine, 
  RiMicLine,
  RiDeleteBin6Line,
  RiArrowLeftLine,
  RiSaveLine,
  RiImageLine,
  RiCloseLine
} from 'react-icons/ri';

// This is defined in the imported VoiceRecorder component, not needed here

export default function CreateEntryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();



  useEffect(() => {
    // Generate image previews when images change
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

  const handleSave = async () => {
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
      
      await saveEntryWithImages(
        {
          id: uuidv4(),
          title,
          content,
          date: new Date().toISOString(),
          imageUrls: [],
          audioUrl: audio || undefined,
        },
        images
      );

      Swal.fire({
        title: 'Entry saved!',
        text: 'Your diary entry has been saved successfully',
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
      console.error('Error saving entry:', error);
      
      Swal.fire({
        title: 'Error',
        text: 'There was a problem saving your entry. Please try again.',
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <RiArrowLeftLine size={16} />
            <span>Back</span>
          </Button>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold md:text-3xl">Create New Entry</h1>
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
        
        {/* Image upload section */}
        <div className="p-5 border rounded-lg bg-card/50 border-border">
          <h2 className="flex items-center mb-4 text-lg font-medium">
            <RiImageLine className="mr-2 text-primary" size={20} /> 
            Add Images
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="relative w-24 h-24 overflow-hidden rounded-lg bg-black/5">
                  <img 
                    src={preview} 
                    alt={`Preview ${index}`} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
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
        
        {/* Audio recording section */}
        <div className="p-5 border rounded-lg bg-card/50 border-border">
          <h2 className="flex items-center mb-4 text-lg font-medium">
            <RiMicLine className="mr-2 text-primary" size={20} /> 
            Voice Recording
          </h2>
          
          <VoiceRecorder 
            onAudioReady={(audio) => setAudio(audio)} 
            onRecordingStateChange={setIsRecording}
          />
        </div>
        
        {/* Save button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={isSubmitting || isRecording}
            animated
            className="px-6 py-6 text-base"
          >
            <RiSaveLine size={18} />
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
