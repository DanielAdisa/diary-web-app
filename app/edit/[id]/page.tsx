'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, updateEntry, DiaryEntry } from '../../../lib/storage';
import { Button } from '@/components/ui/button';

type EditEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = use(params);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]); // Store selected files
  const [existingImages, setExistingImages] = useState<string[]>([]); // Store existing images
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const entry = await getEntryById(id);
        if (entry) {
          setTitle(entry.title);
          setContent(entry.content);
          setExistingImages(entry.imageUrls); // Load existing image URLs
        } else {
          alert('Entry not found.');
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch entry:', error);
        router.push('/');
      }
    };

    fetchEntry();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleUpdate = async () => {
    if (!title || !content) {
      alert('Please fill out all fields.');
      return;
    }

    const imageUrls = await uploadImages(images);

    const updatedEntry: DiaryEntry = {
      id,
      title,
      content,
      date: new Date().toISOString(),
      imageUrls: [...existingImages, ...imageUrls], // Append new images to existing ones
    };

    try {
      await updateEntry(updatedEntry);
      router.push('/');
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    // Placeholder image upload logic
    return files.map((file) => URL.createObjectURL(file));
  };

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Edit Entry</h1>
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
      {existingImages.length > 0 && (
        <div className="mb-4">
          {existingImages.map((imageUrl, index) => (
            <img key={index} src={imageUrl} alt={`Entry Image ${index + 1}`} className="object-cover w-20 h-20 mr-2" />
          ))}
        </div>
      )}
      <Button
        onClick={handleUpdate}
        className="px-4 py-2 text-white rounded bg-primary"
      >
        Update Entry
      </Button>
    </div>
  );
}
