import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, BookOpen } from "lucide-react";
import type { DbBook } from "@/hooks/useBooks";

interface BookCardProps {
  book: DbBook;
  index?: number;
}

const BookCard = ({ book, index = 0 }: BookCardProps) => {
  const coverSrc = book.cover_url || "/placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      className="group"
    >
      <Link to={`/book/${book.id}`} className="block">
        {/* Cover */}
        <div className="relative overflow-hidden rounded-xl shadow-card transition-all duration-500 group-hover:shadow-glow group-hover:-translate-y-2">
          <div className="aspect-[2/3] overflow-hidden bg-muted">
            <img
              src={coverSrc}
              alt={book.title}
              loading="lazy"
              width={640}
              height={960}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Gradient overlay — always visible at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Genre badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-block rounded-full bg-primary/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-body font-semibold text-primary-foreground uppercase tracking-wider">
              {book.genre}
            </span>
          </div>

          {/* Trending / Featured badges */}
          {(book.trending || book.featured) && (
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {book.trending && (
                <span className="inline-block rounded-full bg-accent/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-body font-semibold text-accent-foreground">
                  🔥 Trending
                </span>
              )}
              {book.featured && (
                <span className="inline-block rounded-full bg-secondary/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-body font-semibold text-secondary-foreground">
                  ⭐ Featured
                </span>
              )}
            </div>
          )}

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-xs font-body font-semibold text-white">{book.rating}</span>
              <span className="text-[10px] text-white/60 font-body ml-auto flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {book.pages} pg
              </span>
            </div>
            <p className="text-xs text-white/70 font-body line-clamp-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              {book.description}
            </p>
          </div>
        </div>

        {/* Title & Author below card */}
        <div className="mt-3 px-1">
          <h3 className="font-display text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors duration-300">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
            by {book.author}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
