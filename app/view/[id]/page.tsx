'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, deleteEntryById, DiaryEntry } from '../../../lib/storage';
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Importing Image component

type ViewEntryPageProps = {
  params: Promise<{ id: string }>; // params is now a Promise
};

export default function ViewEntryPage({ params }: ViewEntryPageProps) {
  // Unwrap the params Promise to get the `id`
  const { id } = use(params);

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const fetchedEntry = await getEntryById(id); // Use unwrapped `id`
        if (fetchedEntry) {
          setEntry(fetchedEntry);
        } else {
          alert('Entry not found.');
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        router.push('/');
      }
    };

    fetchEntry();
  }, [id, router]); // Dependency on unwrapped `id`

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntryById(id); // Use unwrapped `id`
        router.push('/');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  // Carousel navigation functions
  const goToNextImage = () => {
    if (entry && entry.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % entry.imageUrls.length);
    }
  };

  const goToPreviousImage = () => {
    if (entry && entry.imageUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + entry.imageUrls.length) % entry.imageUrls.length);
    }
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!entry) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto overflow-hidden md:p-4">
      <h1 className="mb-4 text-3xl font-bold text-center">{entry.title}</h1>
      <p className="mb-4 text-center text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>

      {/* Show images in a carousel if multiple images exist */}
      {entry.imageUrls && entry.imageUrls.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-center mx-auto md:w-2/3">
            <Image
              src={entry.imageUrls[currentImageIndex]}
              alt={`Diary Entry Image ${currentImageIndex + 1}`}
              width={800}
              height={500}
              className="h-auto mb-4 transition-all duration-500 ease-in-out rounded-lg md:p-4"
            />
          </div>
          
          {/* Carousel navigation buttons */}
          <span
            onClick={goToPreviousImage}
            className="absolute items-center justify-center w-1/2 h-full text-transparent transform -translate-y-1/2 bg-transparent md:text-white md:flex -left-0 md:p-5 md:bg-gray-800 md:rounded-full md:h-0 md:w-0 md:left-2 top-1/2"
          >
            &#10094;
          </span>
          <span
            onClick={goToNextImage}
            className="absolute items-center justify-center w-1/2 h-full text-transparent transform -translate-y-1/2 bg-transparent md:text-white md:flex -right-0 md:p-5 md:bg-gray-800 md:rounded-full md:h-0 md:w-0 md:right-2 top-1/2"
          >
            &#10095;
          </span>

          {/* Carousel indicators (dots) */}
          <div className="absolute flex mb-4 space-x-4 transform -translate-x-1/2 h-fit -bottom-6 left-1/2">
            {entry.imageUrls.map((_, index) => (
              <span
                key={index}
                onClick={() => handleImageClick(index)}
                className={` md:h-5 h-3 md:w-5 w-3 rounded-full ${index === currentImageIndex ? 'bg-primary cursor-pointer' : 'bg-gray-300 cursor-pointer'}`}
              />
            ))}
          </div>
        </div>
      )}

      <p className="h-auto p-4 mt-6 rounded-sm text-stone-100 bg-stone-950">{entry.content}</p>

      <div className="flex items-center justify-between w-full gap-4 mt-10">
        <Button onClick={handleDelete} className="">
          Delete Entry
        </Button>
        <Button onClick={() => router.push(`/edit/${entry.id}`)} className="">
          Edit Entry
        </Button>
      </div>
    </div>
  );
}
