import { DiaryEntry } from '../lib/storage';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type EntryCardProps = {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
};

export default function EntryCard({ entry, onDelete }: EntryCardProps) {
  // Ensure imageUrls is defined and is an array
  const imageUrls = Array.isArray(entry.imageUrls) ? entry.imageUrls : [];

  return (
    <div className="p-4 bg-white rounded-[20px] shadow-xl overflow-clip ">
      <h2 className="text-xl font-bold">{entry.title}</h2>
      <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
      
      {/* Display multiple images */}
      {imageUrls.length > 0 && (
        <div className="flex gap-2 my-4">
          {imageUrls.map((imageUrl, index) => (
            <Image
              key={index}
              src={imageUrl}
              alt={`Entry Image ${index + 1}`}
              width={100}
              height={100}
              className="object-cover rounded-md"
            />
          ))}
        </div>
      )}
      
      <p className="mt-2 text-gray-600">{entry.content.slice(0, 100)}...</p>

      <div className="flex gap-2 mt-4">
        {/* <Button
          onClick={() => onDelete(entry.id)}
          className="px-4 py-2 text-white bg-red-500 rounded-md"
        >
          Delete
        </Button> */}
      </div>
    </div>
  );
}
