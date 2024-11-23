import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="p-4 text-white bg-primary">
      <div className="container flex items-center justify-between mx-auto">
        <Link href="/" className="text-xl font-bold">
          My Diary
        </Link>
        <nav className="space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/create" className="hover:underline">
            Create Entry
          </Link>
        </nav>
      </div>
    </header>
  );
}
