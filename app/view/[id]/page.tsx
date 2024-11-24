'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, deleteEntryById, DiaryEntry } from '../../../lib/storage';
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // Importing Image component
import { FaPlay } from "react-icons/fa6";
import { FaRegCirclePause } from "react-icons/fa6";
import { FaPause } from "react-icons/fa6";

type ViewEntryPageProps = {
  params: Promise<{ id: string }>; // params is now a Promise
};

export default function ViewEntryPage({ params }: ViewEntryPageProps) {
  const { id } = use(params);

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // Progress in percentage
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const fetchedEntry = await getEntryById(id);
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
  }, [id, router]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntryById(id);
        router.push('/');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
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
      const clickX = e.nativeEvent.offsetX;
      const progress = clickX / progressBar.clientWidth;
      audioRef.current.currentTime = progress * audioRef.current.duration;
    }
  };

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

  if (!entry) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto overflow-hidden md:p-4">
      <h1 className="mb-4 text-3xl font-bold text-center">{entry.title}</h1>
      <p className="mb-4 text-center text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>

      {entry.imageUrls && entry.imageUrls.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-center mx-auto md:w-2/3">
            <Image
              src={entry.imageUrls[currentImageIndex]}
              alt={`Diary Entry Image ${currentImageIndex + 1}`}
              width={800}
              height={500}
              className="h-auto mb-6 transition-all duration-500 ease-in-out rounded-lg md:mb-4 md:p-4"
            />
          </div>
          <span onClick={goToPreviousImage} className="absolute items-center justify-center w-1/2 h-full text-transparent transform -translate-y-1/2 bg-transparent cursor-pointer md:text-white md:flex -left-0 md:p-5 md:bg-gray-800 md:rounded-full md:h-0 md:w-0 md:left-2 top-1/2">
            &#10094;
          </span>
          <span onClick={goToNextImage} className="absolute items-center justify-center w-1/2 h-full text-transparent transform -translate-y-1/2 bg-transparent cursor-pointer md:text-white md:flex -right-0 md:p-5 md:bg-gray-800 md:rounded-full md:h-0 md:w-0 md:right-2 top-1/2">
            &#10095;
          </span>
        </div>
      )}

      {entry.audioUrl && (
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-bold">Audio Recording:</h2>
          <div className="relative flex items-center w-full max-w-xl p-4 mx-auto shadow-lg rounded-xl bg-black/20">
            <button
              onClick={togglePlayPause}
              className="flex items-center justify-center w-12 h-12 p-2 font-bold text-white rounded-full shadow-lg bg-stone-900 focus:outline-none"
            >
              {audioPlaying ? <FaPause />   : <FaPlay />  }
            </button>
            <div
              className="relative flex-grow h-2 mx-4 rounded cursor-pointer bg-stone-300"
              onClick={handleProgressClick}
            >
              <div
                className="absolute top-0 left-0 h-full rounded bg-stone-800"
                style={{ width: `${audioProgress}%` }}
              ></div>
            </div>
            <audio
              ref={audioRef}
              src={entry.audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={() => setAudioPlaying(false)}
              className="hidden"
            />
          </div>
        </div>
      )}

      <p className="h-auto p-4 mt-6 rounded-sm text-stone-100 bg-stone-950">{entry.content}</p>

      <div className="flex items-center justify-between w-full gap-4 mt-10">
        <Button onClick={handleDelete} className="bg-red-500">
          Delete Entry
        </Button>
        <Button onClick={() => router.push(`/edit/${entry.id}`)} className="bg-yellow-500">
          Edit Entry
        </Button>
      </div>
    </div>
  );
}
