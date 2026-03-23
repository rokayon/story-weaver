import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Book } from "@/data/books";
import { coverImages } from "@/data/coverImages";
import { Star } from "lucide-react";

interface BookCardProps {
  book: Book;
  index?: number;
}

const BookCard = ({ book, index = 0 }: BookCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/book/${book.id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg shadow-card transition-all duration-300 group-hover:shadow-glow group-hover:-translate-y-1">
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={coverImages[book.id]}
              alt={book.title}
              loading="lazy"
              width={640}
              height={960}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <span className="text-xs font-body text-primary">{book.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground font-body line-clamp-2">{book.description}</p>
          </div>
        </div>
        <div className="mt-3 px-1">
          <h3 className="font-display text-sm font-semibold text-foreground truncate">{book.title}</h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">{book.author}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;
