import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Library as LibIcon, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BookCard from "@/components/BookCard";
import Navbar from "@/components/Navbar";
import type { DbBook } from "@/hooks/useBooks";

const LibraryPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<DbBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) { setLoading(false); return; }
      const { data: libraryItems } = await supabase
        .from("user_library")
        .select("book_id")
        .eq("user_id", user.id);

      if (libraryItems && libraryItems.length > 0) {
        const bookIds = libraryItems.map((item) => item.book_id);
        const { data: booksData } = await supabase
          .from("books")
          .select("*")
          .in("id", bookIds);
        if (booksData) setBooks(booksData);
      }
      setLoading(false);
    };
    fetchLibrary();
  }, [user]);

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

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground font-body">Loading...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-body">Your library is empty.</p>
            <p className="text-sm text-muted-foreground/60 font-body mt-1">Browse books and add them to your library.</p>
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
