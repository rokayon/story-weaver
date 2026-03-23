import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getBookById } from "@/data/books";
import { coverImages } from "@/data/coverImages";
import { Star, ArrowLeft, BookOpen, Clock, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const book = getBookById(id || "");

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Book not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero backdrop */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={coverImages[book.id]}
          alt=""
          className="h-full w-full object-cover blur-2xl scale-110 opacity-30"
          width={640}
          height={960}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      </div>

      <div className="container relative -mt-64 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-hidden rounded-xl shadow-card shadow-glow">
              <img
                src={coverImages[book.id]}
                alt={book.title}
                width={640}
                height={960}
                className="w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-body text-primary">
              {book.genre}
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">
              {book.title}
            </h1>
            <p className="mt-2 font-body text-lg text-muted-foreground">by {book.author}</p>

            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(book.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
                <span className="ml-1 text-sm font-body text-muted-foreground">{book.rating}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                <FileText className="h-4 w-4" /> {book.pages} pages
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                <Clock className="h-4 w-4" /> ~{Math.ceil(book.pages / 30)}h read
              </div>
            </div>

            <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-secondary-foreground/80">
              {book.description}
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                to={`/read/${book.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-body font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow"
              >
                <BookOpen className="h-4 w-4" /> Read Now
              </Link>
            </div>

            {/* Preview */}
            <div className="mt-12">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">Preview</h3>
              <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
                <p className="font-body text-sm leading-relaxed text-card-foreground/80 italic">
                  "{book.content[0]}"
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
