import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BookSection from "@/components/BookSection";
import GenreBar from "@/components/GenreBar";
import { books, getTrendingBooks, getBooksByGenre } from "@/data/books";

const Index = () => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const trending = getTrendingBooks();
  const displayedBooks = selectedGenre ? getBooksByGenre(selectedGenre) : books;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      
      <GenreBar selected={selectedGenre} onSelect={setSelectedGenre} />

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

      {/* Footer */}
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
