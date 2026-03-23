export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  rating: number;
  coverUrl: string;
  pages: number;
  featured?: boolean;
  trending?: boolean;
  content: string[];
}

export const genres = [
  "Fantasy", "Sci-Fi", "Mystery", "Romance", "Horror", "Adventure", "Literary Fiction", "Thriller"
];

export const books: Book[] = [
  {
    id: "1",
    title: "The Midnight Garden",
    author: "Elena Blackwell",
    genre: "Fantasy",
    description: "In a world where gardens bloom only under moonlight, a young botanist discovers a hidden realm that holds the key to saving her dying city. As she ventures deeper into the enchanted garden, she unravels secrets that blur the line between reality and myth.",
    rating: 4.8,
    coverUrl: "",
    pages: 342,
    featured: true,
    trending: true,
    content: [
      "The gate appeared only when the moon was full. Clara had walked past this stretch of wall a thousand times — crumbling brick covered in ivy, nothing remarkable about it. But tonight, silver light pooled at the base of the wall like spilled mercury, and where there had been solid stone, an iron gate now stood, half-open, breathing mist into the empty street.",
      "She stepped through without thinking, which was unlike her. Clara was the kind of person who checked the weather forecast twice and carried an umbrella even in July. But the garden on the other side of the gate had a pull to it — something deeper than curiosity, closer to hunger.",
      "The path was lined with flowers she had no name for. Their petals were translucent, veined with light like stained glass. They turned to follow her as she passed, not like sunflowers tracking the sun, but like eyes. Watching. Waiting.",
      "At the center of the garden stood a tree unlike anything in her botanical encyclopedias. Its trunk was smooth and pale as bone, its branches heavy with fruit that glowed a soft, pulsing amber. Beneath the tree sat a woman who looked as if she had been carved from moonlight itself.",
      "\"You're late,\" the woman said, and smiled. \"The garden has been waiting for you for a very long time, Clara. We all have.\"",
    ],
  },
  {
    id: "2",
    title: "Echoes of the Void",
    author: "Marcus Chen",
    genre: "Sci-Fi",
    description: "When humanity's first interstellar probe returns carrying an alien signal, linguist Dr. Yara Osei must decode a message that could either unite or destroy civilization. A gripping tale of first contact and the fragility of human understanding.",
    rating: 4.6,
    coverUrl: "",
    pages: 418,
    featured: true,
    content: [
      "The signal arrived on a Tuesday, which Dr. Yara Osei would later find cosmically appropriate. Tuesdays were named for Tiw, the Norse god of single combat — and what was first contact if not humanity's greatest duel with the unknown?",
      "She was eating cold leftover pasta in her office at the SETI Institute when her terminal began to scream. Not the usual blip of cosmic noise or the false positives that came in weekly. This was a sustained, structured burst of data, repeating in perfect intervals.",
      "The probe — Voyager IV, launched seventeen years ago toward Proxima Centauri — had been silent for three years. Everyone assumed it was dead, drifting through the dark like a message in a bottle that would never reach shore. But now it was talking. And it wasn't alone.",
      "The data stream contained patterns Yara recognized from her work in computational linguistics: recursion, nested structures, something that looked almost like grammar. Almost like language.",
    ],
  },
  {
    id: "3",
    title: "The Last Cartographer",
    author: "Sofia Raines",
    genre: "Adventure",
    description: "In a post-collapse world where all digital maps have been erased, one woman's hand-drawn atlas becomes the most valuable artifact on Earth. She must journey across fractured continents to complete her life's work before the old world is forgotten forever.",
    rating: 4.7,
    coverUrl: "",
    pages: 289,
    trending: true,
    content: [
      "They burned the servers first. Not out of malice — that came later — but out of desperation. When the power grid collapsed, the data centers became furnaces, their cooling systems dead, their processors melting in their own heat. Forty years of accumulated human knowledge, digitized and centralized, gone in a week of silence.",
      "Maren watched the last tower fall from the ridge above what used to be Portland. The smoke carried a chemical sweetness that made her eyes water. In her pack, wrapped in oilcloth, lay the only thing that mattered anymore: her atlas. Two hundred and seventeen pages, hand-drawn in India ink and watercolor.",
      "She had started the project as a hobby, back when people still thought the word 'hobby' meant something. Now it was the most complete physical map of the western continent in existence.",
    ],
  },
  {
    id: "4",
    title: "Crimson Cipher",
    author: "James Moriarty",
    genre: "Thriller",
    description: "A retired cryptanalyst is pulled back into the shadows when a series of murders across Europe are linked by an unbreakable code. Each victim carries a piece of a message that, once assembled, reveals a conspiracy reaching the highest levels of power.",
    rating: 4.5,
    coverUrl: "",
    pages: 376,
    trending: true,
    content: [
      "The first body was found in Vienna, arranged like a marionette in the third pew of St. Stephen's Cathedral. The second turned up in Prague, seated at a café table with a cup of cold espresso and a crossword puzzle filled with symbols no language could claim.",
      "By the time the third victim appeared — this time in a locked room in a Bruges hotel — Interpol had stopped pretending these were isolated incidents. They called Arthur Voss.",
      "Voss had been retired for six years. He spent his days tending roses in his Cornwall garden and doing the Times crossword in under four minutes. He had no interest in returning to the world of ciphers and dead drops.",
    ],
  },
  {
    id: "5",
    title: "Whispers in Amber",
    author: "Lila Thornwood",
    genre: "Romance",
    description: "When a restorer discovers love letters hidden inside a 200-year-old amber necklace, she becomes obsessed with finding the descendants of the lovers — and in doing so, finds a love of her own.",
    rating: 4.4,
    coverUrl: "",
    pages: 298,
    content: [
      "The necklace arrived in a velvet box that smelled of cedar and old secrets. Nadia turned it under the workshop lamp, watching the amber catch light like trapped sunlight. It was beautiful — a single large cabochon set in tarnished gold filigree — but that wasn't what made her hands tremble.",
      "Inside the amber, barely visible without magnification, was a tiny scroll of paper. She had seen insects preserved in amber, even small flowers. But never a message.",
    ],
  },
  {
    id: "6",
    title: "The Bone Orchestra",
    author: "Henrik Shade",
    genre: "Horror",
    description: "A music professor inherits a remote estate and discovers an underground concert hall where the instruments play themselves. The music is hauntingly beautiful — but each melody seems to summon something from the dark.",
    rating: 4.3,
    coverUrl: "",
    pages: 312,
    content: [
      "Professor Elias Wren had never believed in ghosts. He believed in Bach, in Debussy, in the mathematical precision of a well-tuned piano. But when the letter arrived from a solicitor in rural Austria informing him that a great-uncle he'd never met had left him an estate called Klangschloss — Sound Castle — his certainty began to crack.",
      "The estate was everything the name promised and nothing the photographs showed. The main house was a baroque ruin softened by decades of ivy. But beneath it, accessible through a door hidden behind a collapsed bookcase, was a concert hall of impossible proportions.",
    ],
  },
];

export const getBookById = (id: string) => books.find(b => b.id === id);
export const getFeaturedBooks = () => books.filter(b => b.featured);
export const getTrendingBooks = () => books.filter(b => b.trending);
export const getBooksByGenre = (genre: string) => books.filter(b => b.genre === genre);
