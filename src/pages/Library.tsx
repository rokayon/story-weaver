import { motion } from "framer-motion";
import { Library as LibIcon, BookOpen } from "lucide-react";
import { books } from "@/data/books";
import BookCard from "@/components/BookCard";
import Navbar from "@/components/Navbar";

const LibraryPage = () => {
  // Mock: show all books as "in library"
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <LibIcon className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">My Library</h1>
        </motion.div>

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-body">Your library is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {books.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
