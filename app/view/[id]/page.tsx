'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, deleteEntryById, DiaryEntry } from '../../../lib/storage';

type ViewEntryPageProps = {
  params: {
    id: string;
  };
};

export default function ViewEntryPage({ params }: ViewEntryPageProps) {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const router = useRouter();

  // Using React.use() to unwrap params
  useEffect(() => {
    const fetchEntry = async () => {
      const fetchedEntry = await getEntryById(params.id);  // safely access params.id
      if (fetchedEntry) {
        setEntry(fetchedEntry);
      } else {
        alert('Entry not found.');
        router.push('/');
      }
    };
    fetchEntry();
  }, [params, router]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteEntryById(params.id);  // safely access params.id
      router.push('/');
    }
  };

  if (!entry) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">{entry.title}</h1>
      <p className="mb-4 text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
      <p className="mt-6">{entry.content}</p>
      <div className="flex gap-4">
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-white rounded bg-danger"
        >
          Delete Entry
        </button>
        <button
          onClick={() => router.push(`/edit/${entry.id}`)}
          className="px-4 py-2 text-white rounded bg-primary"
        >
          Edit Entry
        </button>
      </div>
    </div>
  );
}
