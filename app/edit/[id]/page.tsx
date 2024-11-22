'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEntryById, updateEntry, DiaryEntry } from '../../../lib/storage';

type EditEntryPageProps = {
  params: {
    id: string;
  };
};

export default function EditEntryPage({ params }: EditEntryPageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchEntry = async () => {
      const entry = await getEntryById(params.id);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
      } else {
        alert('Entry not found.');
        router.push('/');
      }
    };
    fetchEntry();
  }, [params.id, router]);

  const handleUpdate = async () => {
    if (!title || !content) {
      alert('Please fill out all fields.');
      return;
    }

    const updatedEntry: DiaryEntry = {
      id: params.id,
      title,
      content,
      date: new Date().toISOString(),
    };

    await updateEntry(updatedEntry);
    router.push('/');
  };

  return (
    <div>
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
      <button
        onClick={handleUpdate}
        className="px-4 py-2 text-white rounded bg-primary"
      >
        Update Entry
      </button>
    </div>
  );
}
