'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveEntryWithImages } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import VoiceRecorder from '@/components/VoiceRecorder'; // Voice Recorder component

export default function CreateEntryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [audio, setAudio] = useState<string | null>(null); // Store Base64 audio
  const router = useRouter();

  const handleSave = async () => {
    if (!title || !content) {
      alert('Please fill out all fields.');
      return;
    }

    await saveEntryWithImages(
      {
        id: uuidv4(),
        title,
        content,
        date: new Date().toISOString(),
        imageUrls: [], // Placeholder, will be set by saveEntryWithImages
        audioUrl: audio || undefined, // Save Base64 audio if available
      },
      images
    );

    router.push('/');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Create New Entry</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 mb-4 border rounded"
      />
      <textarea
        placeholder="Content"
        value={content}
        rows={15}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 mb-4 border rounded"
      />

      <label htmlFor="image-upload" className="block mb-2 text-lg font-medium text-gray-700">
        Upload Images
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="block w-full px-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm"
      />

      <h2 className="mt-6 mb-2 text-xl font-medium">Record Voice</h2>
      <VoiceRecorder onAudioReady={(audio) => setAudio(audio)} />

      <Button onClick={handleSave} className="px-4 py-2 mt-4 text-white rounded bg-primary">
        Save Entry
      </Button>
    </div>
  );
}
