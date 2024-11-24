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
  const [images, setImages] = useState<File[]>([]); // New image files
  const [existingImages, setExistingImages] = useState<string[]>([]); // Current image URLs
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
      setImages(Array.from(e.target.files)); // Convert FileList to an array
    }
  };

  const handleRemoveImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index)); // Remove image by index
  };

  const handleUpdate = async () => {
    if (!title || !content) {
      alert('Please fill out all fields.');
      return;
    }

    const imageUrls = await uploadImages(images); // Upload new images

    const updatedEntry: DiaryEntry = {
      id,
      title,
      content,
      date: new Date().toISOString(),
      imageUrls: [...existingImages, ...imageUrls], // Combine existing and new images
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
    // Placeholder logic: Convert files to temporary URLs for now
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
        rows={6}
      />
      <label
        htmlFor="image-upload"
        className="block mb-2 text-lg font-medium text-gray-700"
      >
        Upload New Images
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
      {existingImages.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 text-lg font-medium">Existing Images</h2>
          <div className="flex flex-wrap gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative w-24 h-24">
                <img
                  src={imageUrl}
                  alt={`Existing Image ${index + 1}`}
                  className="object-cover w-full h-full rounded"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 p-1 text-sm text-white bg-red-500 rounded-full hover:bg-red-600"
                  title="Remove this image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button
        onClick={handleUpdate}
        className="px-4 py-2 mt-6 text-white rounded bg-primary"
      >
        Update Entry
      </Button>
    </div>
  );
}
