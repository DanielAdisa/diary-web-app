'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveEntry } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';

export default function CreateEntryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]); // Store Base64 strings
  const router = useRouter();

  // Convert images to Base64 and store in state
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const base64Images = await Promise.all(files.map(fileToBase64));
      setImages(base64Images);
    }
  };

  // Utility function to convert a file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file); // Convert file to Base64
    });
  };

  const handleSave = async () => {
    if (!title || !content) {
      alert('Please fill out all fields.');
      return;
    }

    const newEntry = {
      id: uuidv4(),
      title,
      content,
      date: new Date().toISOString(),
      imageUrls: images, // Store Base64 strings of images
    };

    await saveEntry(newEntry);
    router.push('/');
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
        className="w-full p-2 mb-4 border rounded"
      />
      <label
        htmlFor="image-upload"
        className="block mb-2 text-lg font-medium text-gray-700"
      >
        Upload Images
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="block w-full px-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Select one or more images to upload"
      />
      <Button
        onClick={handleSave}
        className="px-4 py-2 mt-4 text-white rounded bg-primary"
      >
        Save Entry
      </Button>
    </div>
  );
}
