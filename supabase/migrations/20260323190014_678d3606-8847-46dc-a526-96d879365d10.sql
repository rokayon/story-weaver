
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin can read all roles
CREATE POLICY "Admins can read all roles" ON public.user_roles 
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Books table for admin uploads
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  cover_url TEXT,
  pages INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  trending BOOLEAN NOT NULL DEFAULT false,
  content TEXT[] NOT NULL DEFAULT '{}',
  scene_data JSONB[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admins can insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update books" ON public.books FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete books" ON public.books FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User library (saved/purchased books)
CREATE TABLE public.user_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own library" ON public.user_library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own library" ON public.user_library FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own library" ON public.user_library FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove from own library" ON public.user_library FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for book covers
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);

CREATE POLICY "Book covers are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "Admins can upload book covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-covers');
CREATE POLICY "Admins can update book covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'book-covers');
CREATE POLICY "Admins can delete book covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'book-covers');
