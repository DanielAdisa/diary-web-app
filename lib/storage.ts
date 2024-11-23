import { get, set } from 'idb-keyval';

export type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrls: string[]; // Array of image URLs
};

// Save a new entry
export async function saveEntry(entry: DiaryEntry): Promise<void> {
  const entries: DiaryEntry[] = (await get('diary_entries')) || [];
  entries.push(entry);
  await set('diary_entries', entries);
}

// Retrieve all entries
export async function getAllEntries(): Promise<DiaryEntry[]> {
  return (await get('diary_entries')) || [];
}

// Retrieve a single entry by ID
export async function getEntryById(id: string): Promise<DiaryEntry | undefined> {
  const entries = await getAllEntries();
  return entries.find((entry) => entry.id === id);
}

// Update an existing entry by ID
export async function updateEntry(updatedEntry: DiaryEntry): Promise<void> {
  const entries = await getAllEntries();
  const updatedEntries = entries.map((entry) =>
    entry.id === updatedEntry.id ? updatedEntry : entry
  );
  await set('diary_entries', updatedEntries);
}

// Delete an entry by ID
export async function deleteEntryById(id: string): Promise<void> {
  const entries = await getAllEntries();
  const updatedEntries = entries.filter((entry) => entry.id !== id);
  await set('diary_entries', updatedEntries);
}
