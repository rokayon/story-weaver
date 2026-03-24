import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbBook = Tables<"books">;

export const useBooks = () => {
  const [books, setBooks] = useState<DbBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setBooks(data);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const getTrendingBooks = () => books.filter((b) => b.trending);
  const getFeaturedBooks = () => books.filter((b) => b.featured);
  const getBooksByGenre = (genre: string) => books.filter((b) => b.genre === genre);
  const getGenres = () => [...new Set(books.map((b) => b.genre))];

  return { books, loading, getTrendingBooks, getFeaturedBooks, getBooksByGenre, getGenres };
};

export const useBook = (id: string) => {
  const [book, setBook] = useState<DbBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetchBook = async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setBook(data);
      setLoading(false);
    };
    fetchBook();
  }, [id]);

  return { book, loading };
};
