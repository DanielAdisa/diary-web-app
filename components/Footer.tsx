export default function Footer() {
    return (
      <footer className="py-4 mt-6 text-white bg-gray-800">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} My Diary. All rights reserved.</p>
        </div>
      </footer>
    );
  }
  