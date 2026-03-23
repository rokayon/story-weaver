import { motion } from "framer-motion";
import { genres, getBooksByGenre } from "@/data/books";

interface GenreBarProps {
  selected: string | null;
  onSelect: (genre: string | null) => void;
}

const GenreBar = ({ selected, onSelect }: GenreBarProps) => {
  return (
    <div className="container py-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-body font-medium transition-all ${
            selected === null
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          All
        </button>
        {genres.map((genre) => {
          const count = getBooksByGenre(genre).length;
          if (count === 0) return null;
          return (
            <button
              key={genre}
              onClick={() => onSelect(genre === selected ? null : genre)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-body font-medium transition-all ${
                selected === genre
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GenreBar;
