import { motion } from "framer-motion";
import BookCard from "./BookCard";
import type { DbBook } from "@/hooks/useBooks";

interface BookSectionProps {
  title: string;
  subtitle?: string;
  books: DbBook[];
}

const BookSection = ({ title, subtitle, books }: BookSectionProps) => {
  if (books.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="mt-1 font-body text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <span className="hidden sm:block text-xs font-body text-muted-foreground bg-secondary rounded-full px-3 py-1">
            {books.length} {books.length === 1 ? "book" : "books"}
          </span>
        </motion.div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookSection;
