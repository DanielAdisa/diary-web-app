'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { getEntryById, updateEntry, DiaryEntry } from '../../../lib/storage';
import Button from '@/components/Button';

// Props type for the dynamic route
type EditEntryPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditEntryPage({ params }: EditEntryPageProps) {
  // Unwrap the params Promise
  const { id } = use(params);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch the diary entry by its ID
    const fetchEntry = async () => {
      try {
        const entry = await getEntryById(id);
        if (entry) {
          setTitle(entry.title);
          setContent(entry.content);
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

  const handleUpdate = async () => {
    if (!title || !content) {
      alert('Please fill out all fields.');
      return;
    }

    const updatedEntry: DiaryEntry = {
      id,
      title,
      content,
      date: new Date().toISOString(),
    };

    try {
      await updateEntry(updatedEntry);
      router.push('/');
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl font-bold">Edit Entry</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <Button
        onClick={handleUpdate}
        className="px-4 py-2 text-white bg-blue-500 rounded"
      >
        Update Entry
      </Button>
    </div>
  );
}
