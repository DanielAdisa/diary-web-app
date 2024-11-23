'use client';

import { useState } from 'react';
import { saveEntry } from '../../lib/storage';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';

export default function CreateEntryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

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
      <Button
        onClick={handleSave}
        className="px-4 py-2 text-white rounded bg-primary"
      >
        Save Entry
      </Button>
    </div>
  );
}
