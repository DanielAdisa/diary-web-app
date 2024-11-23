'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // To unwrap the params Promise
import { getEntryById, deleteEntryById, DiaryEntry } from '../../../lib/storage';
import {Button} from '@/components/ui/button';

type ViewEntryPageProps = {
  params: Promise<{ id: string }>; // params is now a Promise
};

export default function ViewEntryPage({ params }: ViewEntryPageProps) {
  // Unwrap the params Promise to get the `id`
  const { id } = use(params);

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
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

  if (!entry) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl font-bold">{entry.title}</h1>
      <p className="mb-4 text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
      <p className="mt-6">{entry.content}</p>
      <div className="flex gap-4">
        <Button
          onClick={handleDelete}
          className="px-4 py-2 text-white bg-red-500 rounded"
        >
          Delete Entry
        </Button>
        <Button
          onClick={() => router.push(`/edit/${entry.id}`)}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          Edit Entry
        </Button>
      </div>
    </div>
  );
}
