'use client';

import Link from 'next/link';
import { Button } from './ui/button';

export default function EntryCard({
  entry,
  onDelete,
}: {
  entry: { id: string; title: string; date: string };
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 transition-all border rounded shadow hover:shadow-lg">
      <h2 className="text-xl font-bold">{entry.title}</h2>
      <p className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
      <div className="flex justify-between mt-4">
        <Button>
        <Link
          href={`/view/${entry.id}`}
          className="text-stone-50"
        >
          View
        </Link>
        </Button>
        <Button
          onClick={() => onDelete(entry.id)}
          className=" text-stone-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
