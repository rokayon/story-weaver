import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBookById } from "@/data/books";
import { supabase } from "@/integrations/supabase/client";
import SceneCanvas from "@/components/SceneCanvas";
import type { SceneData } from "@/components/SceneCanvas";
import { ArrowLeft, ChevronLeft, ChevronRight, Sun, Moon, Minus, Plus, BookOpen, Columns2, Maximize2 } from "lucide-react";

const defaultScene: SceneData = { weather: "clear", timeOfDay: "day", environment: "field" };

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(true);
  const [direction, setDirection] = useState(0);
  const [splitView, setSplitView] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const touchStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Try local data first, then DB
  const localBook = getBookById(id || "");
  const [dbBook, setDbBook] = useState<any>(null);

  useEffect(() => {
    if (!localBook && id) {
      supabase.from("books").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setDbBook(data);
      });
    }
  }, [id, localBook]);

  const book = localBook || dbBook;

  // Scene data
  const getScene = useCallback((): SceneData => {
    if (dbBook?.scene_data?.[page]) return dbBook.scene_data[page] as SceneData;
    // Auto-generate from local book content
    if (book?.content?.[page]) {
      const text = book.content[page].toLowerCase();
      const scene: SceneData = {};
      if (text.includes("rain")) scene.weather = "rain";
      else if (text.includes("snow")) scene.weather = "snow";
      else if (text.includes("storm")) scene.weather = "storm";
      else scene.weather = "clear";

      if (text.includes("night") || text.includes("moon") || text.includes("midnight") || text.includes("dark")) scene.timeOfDay = "night";
      else if (text.includes("sunset") || text.includes("evening") || text.includes("dusk")) scene.timeOfDay = "evening";
      else if (text.includes("dawn") || text.includes("morning") || text.includes("sunrise")) scene.timeOfDay = "morning";
      else scene.timeOfDay = "day";

      if (text.includes("forest") || text.includes("tree") || text.includes("garden") || text.includes("ivy")) scene.environment = "forest";
      else if (text.includes("ocean") || text.includes("sea") || text.includes("water") || text.includes("shore")) scene.environment = "ocean";
      else if (text.includes("city") || text.includes("street") || text.includes("building") || text.includes("portland")) scene.environment = "city";
      else if (text.includes("mountain") || text.includes("ridge") || text.includes("hill")) scene.environment = "mountain";
      else if (text.includes("castle") || text.includes("cathedral") || text.includes("hall") || text.includes("room") || text.includes("office") || text.includes("house")) scene.environment = "interior";
      else scene.environment = "field";

      return scene;
    }
    return defaultScene;
  }, [book, page, dbBook]);

  // Text highlighting animation
  useEffect(() => {
    if (!book?.content?.[page]) return;
    setHighlightIndex(-1);
    const words = book.content[page].split(" ");
    const totalDuration = 8000; // 8 seconds per page
    const interval = totalDuration / words.length;
    let i = 0;
    const timer = setInterval(() => {
      setHighlightIndex(i);
      i++;
      if (i >= words.length) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [page, book]);

  const totalPages = book?.content?.length || 0;

  const goNext = () => {
    if (page < totalPages - 1) { setDirection(1); setPage(page + 1); }
  };
  const goPrev = () => {
    if (page > 0) { setDirection(-1); setPage(page - 1); }
  };

  // Swipe handling
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStart.current = null;
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Book not found.</p>
      </div>
    );
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const readerBg = darkMode ? "bg-[hsl(240,10%,8%)]" : "bg-[hsl(40,20%,95%)]";
  const readerText = darkMode ? "text-[hsl(40,15%,80%)]" : "text-[hsl(240,10%,15%)]";
  const controlBg = darkMode ? "bg-[hsl(240,8%,12%)]" : "bg-[hsl(40,15%,90%)]";
  const controlText = darkMode ? "text-[hsl(40,15%,70%)]" : "text-[hsl(240,10%,30%)]";
  const highlightColor = darkMode ? "hsl(38,90%,55%)" : "hsl(38,90%,45%)";

  const renderHighlightedText = () => {
    if (!book.content[page]) return null;
    const words = book.content[page].split(" ");
    return (
      <p className={`font-body leading-relaxed transition-colors duration-300`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
        {words.map((word: string, i: number) => (
          <span
            key={i}
            style={{
              color: i <= highlightIndex ? highlightColor : undefined,
              transition: "color 0.15s ease",
            }}
            className={i > highlightIndex ? readerText : ""}
          >
            {word}{" "}
          </span>
        ))}
      </p>
    );
  };

  const currentScene = getScene();

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${readerBg} flex flex-col transition-colors duration-300`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className={`flex items-center justify-between border-b px-4 sm:px-6 py-3 ${controlBg} border-border/30`}>
        <button
          onClick={() => navigate(localBook ? `/book/${book.id}` : `/book/${book.id}`)}
          className={`flex items-center gap-1.5 text-sm font-body ${controlText} hover:opacity-80 transition-opacity`}
        >
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className={`h-4 w-4 ${controlText}`} />
          <span className={`text-sm font-display font-semibold ${controlText} hidden sm:inline`}>{book.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSplitView(!splitView)} className={`rounded-full p-1.5 ${controlText} hover:opacity-80`}>
            {splitView ? <Maximize2 className="h-4 w-4" /> : <Columns2 className="h-4 w-4" />}
          </button>
          <span className={`text-xs font-body ${controlText}`}>
            {page + 1} / {totalPages}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Scene canvas panel */}
        {splitView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-48 lg:h-auto lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border/20 relative overflow-hidden"
          >
            <SceneCanvas scene={currentScene} />
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {currentScene.environment && (
                <span className="rounded-full bg-background/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-body text-foreground/70">
                  {currentScene.environment}
                </span>
              )}
              {currentScene.weather && currentScene.weather !== "clear" && (
                <span className="rounded-full bg-background/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-body text-foreground/70">
                  {currentScene.weather}
                </span>
              )}
              {currentScene.timeOfDay && (
                <span className="rounded-full bg-background/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-body text-foreground/70">
                  {currentScene.timeOfDay}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Text panel */}
        <div className={`flex-1 flex items-center justify-center relative px-4 ${splitView ? "lg:w-1/2" : ""}`}>
          <button
            onClick={goPrev}
            disabled={page === 0}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 ${controlBg} ${controlText} disabled:opacity-20 transition-opacity hover:opacity-80`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="max-w-2xl w-full mx-auto py-8 sm:py-16 overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="px-4 sm:px-8"
              >
                {renderHighlightedText()}
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={goNext}
            disabled={page === totalPages - 1}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 ${controlBg} ${controlText} disabled:opacity-20 transition-opacity hover:opacity-80`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`flex items-center justify-center gap-4 sm:gap-6 border-t px-4 sm:px-6 py-3 ${controlBg} border-border/30 flex-wrap`}>
        <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className={`rounded-full p-1.5 ${controlText} hover:opacity-80`}>
          <Minus className="h-4 w-4" />
        </button>
        <span className={`text-xs font-body ${controlText}`}>{fontSize}px</span>
        <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className={`rounded-full p-1.5 ${controlText} hover:opacity-80`}>
          <Plus className="h-4 w-4" />
        </button>

        <div className={`h-4 w-px ${darkMode ? "bg-[hsl(240,6%,20%)]" : "bg-[hsl(40,10%,80%)]"}`} />

        <button onClick={() => setDarkMode(!darkMode)} className={`rounded-full p-1.5 ${controlText} hover:opacity-80`}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className={`h-4 w-px ${darkMode ? "bg-[hsl(240,6%,20%)]" : "bg-[hsl(40,10%,80%)]"}`} />

        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-20 sm:w-24 rounded-full ${darkMode ? "bg-[hsl(240,6%,16%)]" : "bg-[hsl(40,10%,85%)]"}`}>
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
