export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  image_url: string | null;
  author_name: string;
  category_id: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  source_name: string | null;
  source_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: Category | null;
  tags?: Tag[];
}

export interface ArticleInput {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  image_url?: string;
  author_name: string;
  category_id?: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  source_name?: string;
  source_url?: string;
}
