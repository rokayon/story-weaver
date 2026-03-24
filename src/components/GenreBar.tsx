import { motion } from "framer-motion";

interface GenreBarProps {
  genres: string[];
  selected: string | null;
  onSelect: (genre: string | null) => void;
}

const GenreBar = ({ genres, selected, onSelect }: GenreBarProps) => {
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
        {genres.map((genre) => (
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
        ))}
      </div>
    </div>
  );
};

export default GenreBar;
