'use client';

import { useEffect, useState } from 'react';
import { getAllEntries, deleteEntryById, DiaryEntry } from '../lib/storage';
import EntryCard from '../components/EntryCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const fetchEntries = async () => {
    const fetchedEntries = await getAllEntries();
    setEntries(fetchedEntries);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteEntryById(id);
    fetchEntries(); // Refresh entries
  };

  return (
    <div className='overflow-hidden'>
      <h1 className="mb-6 text-3xl font-bold">Diary Entries</h1>
      {entries.length === 0 ? (
        <p className="text-gray-600">No entries yet. Start by creating one!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/view/${entry.id}`}>
              <EntryCard entry={entry} onDelete={handleDelete} />
            </Link>
          ))}
        </div>
      )}
      <Link href="/create">
        <Button className="block px-4 py-2 mx-auto mt-6 rounded-md text-stone-50 bg-stone-950">
          Create New Entry
        </Button>
      </Link>
    </div>
  );
}
