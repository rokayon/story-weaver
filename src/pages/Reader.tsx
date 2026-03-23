import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBookById } from "@/data/books";
import { ArrowLeft, ChevronLeft, ChevronRight, Sun, Moon, Minus, Plus, BookOpen } from "lucide-react";

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const book = getBookById(id || "");
  const [page, setPage] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(true);
  const [direction, setDirection] = useState(0);

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Book not found.</p>
      </div>
    );
  }

  const totalPages = book.content.length;

  const goNext = () => {
    if (page < totalPages - 1) {
      setDirection(1);
      setPage(page + 1);
    }
  };

  const goPrev = () => {
    if (page > 0) {
      setDirection(-1);
      setPage(page - 1);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const readerBg = darkMode ? "bg-[hsl(240,10%,8%)]" : "bg-[hsl(40,20%,95%)]";
  const readerText = darkMode ? "text-[hsl(40,15%,80%)]" : "text-[hsl(240,10%,15%)]";
  const controlBg = darkMode ? "bg-[hsl(240,8%,12%)]" : "bg-[hsl(40,15%,90%)]";
  const controlText = darkMode ? "text-[hsl(40,15%,70%)]" : "text-[hsl(240,10%,30%)]";

  return (
    <div className={`min-h-screen ${readerBg} flex flex-col transition-colors duration-300`}>
      {/* Top bar */}
      <div className={`flex items-center justify-between border-b px-6 py-3 ${controlBg} border-border/30`}>
        <button
          onClick={() => navigate(`/book/${book.id}`)}
          className={`flex items-center gap-1.5 text-sm font-body ${controlText} hover:opacity-80 transition-opacity`}
        >
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className={`h-4 w-4 ${controlText}`} />
          <span className={`text-sm font-display font-semibold ${controlText}`}>{book.title}</span>
        </div>
        <span className={`text-xs font-body ${controlText}`}>
          {page + 1} / {totalPages}
        </span>
      </div>

      {/* Reader body */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        {/* Prev button */}
        <button
          onClick={goPrev}
          disabled={page === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 ${controlBg} ${controlText} disabled:opacity-20 transition-opacity hover:opacity-80`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="max-w-2xl w-full mx-auto py-16 overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="px-4"
            >
              <p
                className={`font-body leading-relaxed ${readerText} transition-colors duration-300`}
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
              >
                {book.content[page]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          disabled={page === totalPages - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 ${controlBg} ${controlText} disabled:opacity-20 transition-opacity hover:opacity-80`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className={`flex items-center justify-center gap-6 border-t px-6 py-3 ${controlBg} border-border/30`}>
        <button
          onClick={() => setFontSize(Math.max(14, fontSize - 2))}
          className={`rounded-full p-1.5 ${controlText} hover:opacity-80`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className={`text-xs font-body ${controlText}`}>{fontSize}px</span>
        <button
          onClick={() => setFontSize(Math.min(28, fontSize + 2))}
          className={`rounded-full p-1.5 ${controlText} hover:opacity-80`}
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className={`h-4 w-px ${darkMode ? "bg-[hsl(240,6%,20%)]" : "bg-[hsl(40,10%,80%)]"}`} />

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`rounded-full p-1.5 ${controlText} hover:opacity-80`}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Progress bar */}
        <div className={`h-4 w-px ${darkMode ? "bg-[hsl(240,6%,20%)]" : "bg-[hsl(40,10%,80%)]"}`} />
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-24 rounded-full ${darkMode ? "bg-[hsl(240,6%,16%)]" : "bg-[hsl(40,10%,85%)]"}`}>
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((page + 1) / totalPages) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-body ${controlText}`}>
            {Math.round(((page + 1) / totalPages) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Reader;
