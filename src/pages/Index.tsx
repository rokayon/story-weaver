import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BookSection from "@/components/BookSection";
import GenreBar from "@/components/GenreBar";
import { useBooks } from "@/hooks/useBooks";

const Index = () => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const { books, loading, getTrendingBooks, getBooksByGenre, getGenres } = useBooks();

  const trending = getTrendingBooks();
  const displayedBooks = selectedGenre ? getBooksByGenre(selectedGenre) : books;
  const genres = getGenres();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      <GenreBar genres={genres} selected={selectedGenre} onSelect={setSelectedGenre} />

      {!selectedGenre && (
        <BookSection
          title="Trending Now"
          subtitle="The most popular reads this week"
          books={trending}
        />
      )}

      <BookSection
        title={selectedGenre ? selectedGenre : "All Books"}
        subtitle={selectedGenre ? `Browse ${selectedGenre} titles` : "Explore our complete collection"}
        books={displayedBooks}
      />

      {loading && books.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground font-body">Loading books...</p>
        </div>
      )}

      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="container text-center">
          <p className="font-display text-lg text-gradient-gold">Luminara</p>
          <p className="mt-2 text-xs font-body text-muted-foreground">
            Immersive AI-powered reading experiences
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
