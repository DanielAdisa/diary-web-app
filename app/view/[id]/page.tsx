"use client"

import { getEntryById } from '../../../lib/storage';

export default async function ViewEntryPage({
  params,
}: {
  params: { id: string };
}) {
  const entry = await getEntryById(params.id);

  if (!entry) {
    return <div>Entry not found!</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{entry.title}</h1>
      <p className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
      <p className="mt-6">{entry.content}</p>
    </div>
  );
}
