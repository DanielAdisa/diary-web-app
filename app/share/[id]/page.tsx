'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, DiaryEntry } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useTheme } from 'next-themes';
import { 
  RiArrowLeftLine,
  RiFileCopyLine,
  RiLinkM,
  RiShareLine,
  RiWhatsappLine,
  RiTwitterXLine,
  RiCheckLine,
  RiFacebookCircleLine,
  RiShieldLine
} from 'react-icons/ri';

type ShareEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default function ShareEntryPage({ params }: ShareEntryPageProps) {
  const { id } = use(params);
  const { theme } = useTheme();
  const router = useRouter();

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      try {
        const fetchedEntry = await getEntryById(id);
        if (fetchedEntry) {
          setEntry(fetchedEntry);
          generateShareLink(fetchedEntry);
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

  const generateShareLink = async (entryData: DiaryEntry) => {
    setIsGeneratingLink(true);
    setShareError(null);
    
    try {
      const url = `${window.location.origin}/share/view/${id}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share link:', error);
      setShareError('Failed to generate sharing link. Please try again.');
      setShareUrl(`${window.location.origin}/share/view/${id}`);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      Swal.fire({
        title: 'Link Copied!',
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        Swal.fire({
          title: 'Copy Failed',
          text: 'Please manually select and copy the link',
          icon: 'error',
          confirmButtonColor: 'hsl(var(--primary))',
          background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
        });
      }
      
      document.body.removeChild(textArea);
    }
  };

  const shareWithPlatform = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    
    Swal.fire({
      title: `Shared on ${platform}!`,
      icon: 'success',
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 2000,
      background: theme === 'dark' ? 'hsl(220 30% 12%)' : 'hsl(0 0% 100%)',
    });
  };

  const shareViaWhatsapp = () => {
    const shareText = `Check out my diary entry: ${entry?.title}\n\n${shareUrl}`;
    shareWithPlatform('WhatsApp', `https://wa.me/?text=${encodeURIComponent(shareText)}`);
  };

  const shareViaTwitter = () => {
    const shareText = `Check out my diary entry: ${entry?.title}`;
    shareWithPlatform('Twitter', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
  };

  const shareViaFacebook = () => {
    shareWithPlatform('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Diary Entry: ${entry?.title}`,
          text: `Check out my diary entry: ${entry?.title}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  if (isLoading || isGeneratingLink) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-2 rounded-full border-primary/30 border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!entry) return null;

  return (
    <div className="max-w-3xl p-6 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 group"
        onClick={() => router.back()}
      >
        <RiArrowLeftLine className="mr-2 transition-transform group-hover:-translate-x-1" size={18} />
        Back
      </Button>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border rounded-xl bg-card/80"
      >
        <h1 className="mb-2 text-2xl font-bold">Share "{entry.title}"</h1>
        <p className="mb-6 text-muted-foreground">
          Generate a shareable link for others to view this diary entry
        </p>
        
        <div className="p-4 mb-6 border rounded-lg bg-muted/30">
          <label className="block mb-2 text-sm font-medium text-muted-foreground">
            Shareable Link
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1 px-3 py-2 overflow-hidden border bg-background rounded-l-md">
              <RiLinkM className="flex-shrink-0 mr-2 text-muted-foreground" />
              <input 
              title='Shareable Link'
                type="text" 
                readOnly 
                value={shareUrl}
                className="w-full overflow-hidden bg-transparent outline-none text-ellipsis"
              />
            </div>
            <Button 
              onClick={copyToClipboard} 
              variant="secondary"
              className="flex items-center gap-1.5 rounded-l-none"
            >
              {copied ? (
                <>
                  <RiCheckLine size={18} className="text-green-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine size={18} />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
          {shareError && (
            <p className="mt-2 text-sm text-red-500">{shareError}</p>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Share via</h2>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              onClick={shareViaWhatsapp}
              className="flex items-center gap-2"
            >
              <RiWhatsappLine size={20} className="text-green-500" />
              WhatsApp
            </Button>
            
            <Button 
              variant="outline"
              onClick={shareViaTwitter}
              className="flex items-center gap-2"
            >
              <RiTwitterXLine size={20} />
              Twitter
            </Button>
            
            <Button 
              variant="outline"
              onClick={shareViaFacebook}
              className="flex items-center gap-2"
            >
              <RiFacebookCircleLine size={20} className="text-blue-500" />
              Facebook
            </Button>
            
            {typeof navigator.share === 'function' && (
              <Button 
                variant="outline"
                onClick={shareNatively}
                className="flex items-center gap-2"
              >
                <RiShareLine size={20} className="text-primary" />
                Share
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-4 mt-8 text-sm border rounded-md bg-muted/50">
          <div className="flex items-start">
            <RiShieldLine size={20} className="mr-2 mt-0.5 text-accent" />
            <div>
              <h3 className="font-medium">About sharing</h3>
              <p className="mt-1 text-muted-foreground">
                Anyone with this link can view this diary entry. No account required.
              </p>
              <p className="mt-3 text-muted-foreground">
                <span className="font-medium text-foreground">Note:</span> Shared entries 
                will be accessible until you delete the original entry.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}