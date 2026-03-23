import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Library } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold text-gradient-gold">Luminara</span>
        </Link>

        <div className="flex items-center gap-6">
          {searchOpen ? (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-9 rounded-md border border-border bg-secondary px-3 text-sm font-body text-foreground outline-none focus:border-primary"
              placeholder="Search books..."
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-muted-foreground transition-colors hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>
          )}
          <Link to="/library" className="flex items-center gap-1.5 text-sm font-body text-muted-foreground transition-colors hover:text-foreground">
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">My Library</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
