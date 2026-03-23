import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getFeaturedBooks } from "@/data/books";
import { coverImages } from "@/data/coverImages";
import { Star, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const featured = getFeaturedBooks();
  const hero = featured[0];

  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover" width={1920} height={960} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative pb-20 pt-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-body font-medium text-primary mb-6">
              ✨ Featured Read
            </span>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {hero.title}
            </h1>
            <p className="mt-2 font-body text-lg text-muted-foreground">by {hero.author}</p>
            <p className="mt-6 max-w-lg font-body text-base leading-relaxed text-secondary-foreground/80">
              {hero.description}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(hero.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                />
              ))}
              <span className="ml-1 text-sm font-body text-muted-foreground">{hero.rating}</span>
            </div>
            <div className="mt-8 flex gap-4">
              <Link
                to={`/book/${hero.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-body font-semibold text-primary-foreground transition-all hover:brightness-110 shadow-glow"
              >
                Start Reading <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={`/book/${hero.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-body font-medium text-secondary-foreground transition-colors hover:bg-muted"
              >
                View Details
              </Link>
            </div>
          </motion.div>

          {/* Featured covers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden lg:flex items-end justify-end gap-4"
          >
            {featured.map((book, i) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="group relative overflow-hidden rounded-lg shadow-card transition-all duration-300 hover:shadow-glow hover:-translate-y-2"
                style={{ width: i === 0 ? 180 : 140, marginBottom: i === 0 ? 0 : 20 }}
              >
                <div className="aspect-[2/3]">
                  <img
                    src={coverImages[book.id]}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={640}
                    height={960}
                  />
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
