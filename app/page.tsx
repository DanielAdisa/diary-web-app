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
    <div className='overfls'>
      <h1 className="p-4 mb-6 text-3xl font-bold rounded-lg bg-stone-950 text-stone-50">Diary Entries</h1>
      {entries.length === 0 ? (
        <p className="text-gray-600">No entries yet. Start by creating one!</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-1">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/view/${entry.id}`}>
              <EntryCard entry={entry} onDelete={handleDelete} />
            </Link>
          ))}
        </div>
      )}
      <Link href="/create">
        <Button className="block w-full px-4 py-2 mx-auto mt-6 rounded-md text-stone-50 bg-stone-950">
          Create New Entry
        </Button>
      </Link>
    </div>
  );
}
