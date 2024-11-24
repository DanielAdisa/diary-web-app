import { get, set } from 'idb-keyval';
import { fileToBase64 } from './utils'; // Import Base64 utility

export type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrls: string[]; // Array of Base64 image strings
};

// Save a new entry with images
export async function saveEntryWithImages(entry: DiaryEntry, files: File[]): Promise<void> {
  const imageUrls = await Promise.all(files.map(fileToBase64)); // Convert files to Base64
  const newEntry: DiaryEntry = { ...entry, imageUrls };

  const entries: DiaryEntry[] = (await get('diary_entries')) || [];
  entries.push(newEntry);
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

// Update an existing entry with images
export async function updateEntryWithImages(updatedEntry: DiaryEntry, files: File[]): Promise<void> {
  const imageUrls = await Promise.all(files.map(fileToBase64)); // Convert files to Base64
  const updatedEntryWithImages: DiaryEntry = { ...updatedEntry, imageUrls };

  const entries = await getAllEntries();
  const updatedEntries = entries.map((entry) =>
    entry.id === updatedEntryWithImages.id ? updatedEntryWithImages : entry
  );
  await set('diary_entries', updatedEntries);
}

// Delete an entry by ID
export async function deleteEntryById(id: string): Promise<void> {
  const entries = await getAllEntries();
  const updatedEntries = entries.filter((entry) => entry.id !== id);
  await set('diary_entries', updatedEntries);
}

export async function saveEntry(entry: DiaryEntry): Promise<void> {
  const entries: DiaryEntry[] = (await get('diary_entries')) || [];
  entries.push(entry);
  await set('diary_entries', entries);
}

export async function updateEntry(updatedEntry: DiaryEntry): Promise<void> {
  const entries = await getAllEntries();
  const updatedEntries = entries.map((entry) =>
    entry.id === updatedEntry.id ? updatedEntry : entry
  );
  await set('diary_entries', updatedEntries);
}

// import { get, set } from 'idb-keyval';

// export type DiaryEntry = {
//   id: string;
//   title: string;
//   content: string;
//   date: string;
//   imageUrls: string[]; // Array of image URLs
// };

// // Save a new entry

// // Retrieve all entries
// export async function getAllEntries(): Promise<DiaryEntry[]> {
//   return (await get('diary_entries')) || [];
// }

// // Retrieve a single entry by ID
// export async function getEntryById(id: string): Promise<DiaryEntry | undefined> {
//   const entries = await getAllEntries();
//   return entries.find((entry) => entry.id === id);
// }

// // Update an existing entry by ID

// // Delete an entry by ID
// export async function deleteEntryById(id: string): Promise<void> {
//   const entries = await getAllEntries();
//   const updatedEntries = entries.filter((entry) => entry.id !== id);
//   await set('diary_entries', updatedEntries);
// }
