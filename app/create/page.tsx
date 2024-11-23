'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveEntry } from '../../lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';

export default function CreateEntryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]); // Store selected files
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files)); // Convert file list to array
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      alert('Please fill out all fields.');
      return;
    }

    // Assuming you're uploading the images and getting the URLs from somewhere (e.g., a cloud service)
    const imageUrls = await uploadImages(images);

    const newEntry = {
      id: uuidv4(),
      title,
      content,
      date: new Date().toISOString(),
      imageUrls, // Store the array of image URLs
    };

    await saveEntry(newEntry);
    router.push('/');
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    // Implement your image upload logic here
    // This is a placeholder that returns a list of dummy URLs
    return files.map((file) => URL.createObjectURL(file));
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
        className="px-4 py-2 text-white rounded bg-primary"
      >
        Save Entry
      </Button>
    </div>
  );
}
