import { DiaryEntry } from '../lib/storage';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  RiCalendarLine, 
  RiImage2Line, 
  RiDeleteBin6Line, 
  RiEditBoxLine,
  RiMicLine,
  RiArrowRightLine
} from 'react-icons/ri';

type EntryCardProps = {
  entry: DiaryEntry;
  onDelete: (e: React.MouseEvent) => void;
};

export default function EntryCard({ entry, onDelete }: EntryCardProps) {
  // Ensure imageUrls is defined and is an array
  const imageUrls = Array.isArray(entry.imageUrls) ? entry.imageUrls : [];
  const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative h-full overflow-hidden border glass-card rounded-xl border-white/10 bg-gradient-glass backdrop-blur-sm dark:bg-black/20 hover:shadow-xl hover:shadow-primary/5 group"
    >
      {/* Animated highlight effects */}
      <div className="absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-shimmer" 
        style={{ backgroundSize: '200% 100%' }}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute -bottom-2 -right-2 w-32 h-32 rounded-full bg-primary/5 dark:bg-primary/10 blur-2xl group-hover:bg-primary/10 transition-all duration-500 opacity-0 group-hover:opacity-100"
      />
      
      {/* Cover Image (if available) */}
      {imageUrls.length > 0 && (
        <div className="relative w-full overflow-hidden h-44 bg-black/5">
          <Image
            src={imageUrls[0]}
            alt={entry.title}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {imageUrls.length > 1 && (
            <div className="absolute flex items-center px-2 py-1 text-xs font-medium text-white rounded-lg top-3 right-3 bg-black/50 backdrop-blur-sm">
              <RiImage2Line className="mr-1" size={14} />
              +{imageUrls.length - 1}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Title with gradient effect */}
        <h2 className="mb-2 text-xl font-semibold text-transparent transition-all duration-300 bg-clip-text bg-gradient-to-r from-foreground to-foreground/80 group-hover:from-primary group-hover:to-accent">
          {entry.title}
        </h2>

        {/* Date and audio indicator */}
        <div className="flex items-center mb-3 text-sm text-muted-foreground">
          <RiCalendarLine size={15} className="mr-1.5" />
          {formattedDate}
          
          {/* Audio indicator if present */}
          {entry.audioUrl && (
            <motion.div 
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center ml-3 text-accent"
            >
              <RiMicLine size={15} className="mr-1" />
              <span className="text-xs font-medium">Audio</span>
            </motion.div>
          )}
        </div>

        {/* Content preview */}
        <p className="mb-5 text-sm text-muted-foreground/90 line-clamp-2">
          {entry.content}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/40">
          <div className="inline-flex items-center justify-center text-xs font-medium text-primary group-hover:text-accent transition-colors">
            <span className="mr-1">Read entry</span>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut",
                repeatDelay: 0.5
              }}
            >
              <RiArrowRightLine size={14} />
            </motion.div>
          </div>
          
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Edit functionality would go here
              }}
              className="p-2 transition-colors rounded-full text-muted-foreground hover:text-accent hover:bg-accent/10"
              aria-label="Edit entry"
            >
              <RiEditBoxLine size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-2 transition-colors rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete entry"
            >
              <RiDeleteBin6Line size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
