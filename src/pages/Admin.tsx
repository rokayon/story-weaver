import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Trash2, Edit, Users, TrendingUp, ArrowLeft, Save, X, Upload, FileText, Shield } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import UserManagement from "@/components/UserManagement";

type Book = Tables<"books">;

const extractTextFromPdf = async (file: File): Promise<string> => {
  // Read PDF as ArrayBuffer and extract text using a basic parser
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  
  // Extract text between stream/endstream markers (basic PDF text extraction)
  const textParts: string[] = [];
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let match;
  while ((match = streamRegex.exec(text)) !== null) {
    const content = match[1];
    // Extract text operators (Tj, TJ, ')
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(content)) !== null) {
      textParts.push(tjMatch[1]);
    }
  }

  // If stream extraction fails, try raw text extraction
  if (textParts.length === 0) {
    const rawText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    // Split into rough pages (by form feeds or large gaps)
    if (rawText.length > 100) {
      return rawText;
    }
  }

  return textParts.join(" ");
};

const splitTextIntoPages = (text: string, wordsPerPage = 150): string[] => {
  const cleanText = text.replace(/\s+/g, " ").trim();
  const words = cleanText.split(" ");
  const pages: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageText = words.slice(i, i + wordsPerPage).join(" ");
    if (pageText.trim().length > 10) {
      pages.push(pageText.trim());
    }
  }

  return pages.length > 0 ? pages : [cleanText];
};

const generateSceneData = (text: string) => {
  const lower = text.toLowerCase();
  const scene: Record<string, string> = {};

  if (lower.includes("rain")) scene.weather = "rain";
  else if (lower.includes("snow")) scene.weather = "snow";
  else if (lower.includes("storm")) scene.weather = "storm";
  else if (lower.includes("sun") || lower.includes("bright")) scene.weather = "sunny";
  else scene.weather = "clear";

  if (lower.includes("night") || lower.includes("moon") || lower.includes("dark") || lower.includes("midnight")) scene.timeOfDay = "night";
  else if (lower.includes("sunset") || lower.includes("dusk") || lower.includes("evening")) scene.timeOfDay = "evening";
  else if (lower.includes("dawn") || lower.includes("sunrise") || lower.includes("morning")) scene.timeOfDay = "morning";
  else scene.timeOfDay = "day";

  if (lower.includes("forest") || lower.includes("tree") || lower.includes("garden")) scene.environment = "forest";
  else if (lower.includes("ocean") || lower.includes("sea") || lower.includes("water") || lower.includes("shore")) scene.environment = "ocean";
  else if (lower.includes("city") || lower.includes("street") || lower.includes("building")) scene.environment = "city";
  else if (lower.includes("mountain") || lower.includes("ridge") || lower.includes("hill")) scene.environment = "mountain";
  else if (lower.includes("castle") || lower.includes("cathedral") || lower.includes("hall") || lower.includes("room")) scene.environment = "interior";
  else scene.environment = "field";

  return scene;
};

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0 });
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"books" | "users">("books");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [contentText, setContentText] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    fetchBooks();
    fetchStats();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (data) setBooks(data);
  };

  const fetchStats = async () => {
    const { count: bookCount } = await supabase.from("books").select("*", { count: "exact", head: true });
    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    setStats({ totalBooks: bookCount || 0, totalUsers: userCount || 0 });
  };

  const resetForm = () => {
    setTitle(""); setAuthor(""); setGenre(""); setDescription("");
    setPages(0); setFeatured(false); setTrending(false);
    setContentText(""); setCoverFile(null); setEditing(null); setShowForm(false);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setTitle(book.title); setAuthor(book.author); setGenre(book.genre);
    setDescription(book.description); setPages(book.pages);
    setFeatured(book.featured); setTrending(book.trending);
    setContentText(book.content.join("\n---\n"));
    setShowForm(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: "Invalid file", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }

    setPdfProcessing(true);
    toast({ title: "Processing PDF...", description: "Extracting text from your PDF file." });

    try {
      const extractedText = await extractTextFromPdf(file);
      if (extractedText.length < 50) {
        toast({
          title: "Limited text extracted",
          description: "The PDF might be scanned/image-based. You can paste the text manually.",
          variant: "destructive"
        });
        setPdfProcessing(false);
        return;
      }

      const pages = splitTextIntoPages(extractedText);
      setContentText(pages.join("\n---\n"));
      setPages(pages.length);

      // Try to extract title from filename
      if (!title) {
        const nameFromFile = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
        setTitle(nameFromFile.charAt(0).toUpperCase() + nameFromFile.slice(1));
      }

      toast({ title: "PDF processed!", description: `Extracted ${pages.length} pages of content.` });
    } catch (err) {
      toast({ title: "Processing failed", description: "Could not extract text from this PDF.", variant: "destructive" });
    } finally {
      setPdfProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contentArray = contentText.split("\n---\n").map(s => s.trim()).filter(Boolean);
    const sceneData = contentArray.map(generateSceneData);

    let coverUrl = editing?.cover_url || null;

    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("book-covers").upload(path, coverFile);
      if (uploadErr) {
        toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
        return;
      }
      const { data: urlData } = supabase.storage.from("book-covers").getPublicUrl(path);
      coverUrl = urlData.publicUrl;
    }

    const bookData = {
      title, author, genre, description, pages, featured, trending,
      content: contentArray,
      scene_data: sceneData,
      cover_url: coverUrl,
      created_by: user?.id,
    };

    if (editing) {
      const { error } = await supabase.from("books").update(bookData).eq("id", editing.id);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Book updated!" });
    } else {
      const { error } = await supabase.from("books").insert(bookData);
      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Book created!" });
    }

    resetForm();
    fetchBooks();
    fetchStats();
  };

  const deleteBook = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Book deleted" });
      fetchBooks();
      fetchStats();
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-gradient-gold">Admin Panel</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
            <button
              onClick={() => setActiveTab("books")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-body font-medium transition-colors ${activeTab === "books" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Books
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-body font-medium transition-colors ${activeTab === "users" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Shield className="h-3.5 w-3.5" /> Users & Roles
            </button>
          </div>
          {activeTab === "books" && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-body font-semibold text-primary-foreground hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Add Book
            </button>
          )}
          {activeTab === "users" && <div />}
        </div>
      </div>

      <div className="container py-8">
        {activeTab === "users" ? (
          <UserManagement />
        ) : (
        <>
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: BookOpen, label: "Total Books", value: stats.totalBooks, color: "text-primary" },
            { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-accent" },
            { icon: TrendingUp, label: "Trending", value: books.filter(b => b.trending).length, color: "text-primary" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{value}</p>
                  <p className="text-xs font-body text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-foreground">{editing ? "Edit Book" : "Add New Book"}</h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>

              {/* PDF Upload Section */}
              <div className="mb-6 rounded-lg border-2 border-dashed border-border bg-secondary/50 p-6 text-center">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={pdfProcessing}
                  className="flex items-center gap-2 mx-auto rounded-lg bg-accent px-4 py-2.5 text-sm font-body font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-50"
                >
                  {pdfProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload PDF Book
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs font-body text-muted-foreground">
                  Upload a PDF to auto-extract text content and generate scene data
                </p>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-body text-muted-foreground">or fill in manually</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Genre" value={genre} onChange={e => setGenre(e.target.value)} required className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                  <input type="number" placeholder="Pages" value={pages || ""} onChange={e => setPages(Number(e.target.value))} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                </div>
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-body text-muted-foreground">Content pages (separate with ---)</label>
                    {contentText && (
                      <span className="flex items-center gap-1 text-xs font-body text-primary">
                        <FileText className="h-3 w-3" />
                        {contentText.split("\n---\n").filter(Boolean).length} pages
                      </span>
                    )}
                  </div>
                  <textarea placeholder="Content pages (separate with ---)" value={contentText} onChange={e => setContentText(e.target.value)} rows={8} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm font-body text-foreground">
                    <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="accent-primary" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm font-body text-foreground">
                    <input type="checkbox" checked={trending} onChange={e => setTrending(e.target.checked)} className="accent-primary" /> Trending
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-body text-muted-foreground mb-1">Cover Image</label>
                  <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="text-sm font-body text-foreground" />
                </div>
                <button type="submit" className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-body font-semibold text-primary-foreground hover:brightness-110 shadow-glow">
                  <Save className="h-4 w-4" /> {editing ? "Update" : "Create"} Book
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Book List */}
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">All Books</h2>
        <div className="space-y-3">
          {books.map(book => (
            <div key={book.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              {book.cover_url && (
                <img src={book.cover_url} alt={book.title} className="h-16 w-12 rounded object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-foreground truncate">{book.title}</p>
                <p className="text-xs font-body text-muted-foreground">{book.author} · {book.genre} · {book.pages} pages</p>
                <div className="flex gap-2 mt-1">
                  {book.featured && <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-body text-primary">Featured</span>}
                  {book.trending && <span className="rounded-full bg-accent/10 border border-accent/30 px-2 py-0.5 text-[10px] font-body text-accent">Trending</span>}
                  {book.scene_data && book.scene_data.length > 0 && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-body text-muted-foreground">{book.scene_data.length} scenes</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(book)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => deleteBook(book.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <p className="py-12 text-center text-muted-foreground font-body">No books yet. Click "Add Book" to get started.</p>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Admin;
