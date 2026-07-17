export const runtime = 'edge';

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/types/database';
import ArticleCard from '@/components/ArticleCard';
import { LayoutGrid } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'AI', slug: 'ai', description: 'Tin tức, nghiên cứu và ứng dụng trí tuệ nhân tạo mới nhất thế giới.', created_at: '' },
  { id: '2', name: 'PC', slug: 'pc', description: 'Đánh giá, tin tức thị trường máy tính cá nhân và linh kiện.', created_at: '' },
  { id: '3', name: 'Windows', slug: 'windows', description: 'Thủ thuật, hướng dẫn và cập nhật mới nhất cho hệ điều hành Windows.', created_at: '' },
  { id: '4', name: 'Gaming', slug: 'gaming', description: 'Trải nghiệm game, máy chơi game console và thiết bị ngoại vi gaming.', created_at: '' },
  { id: '5', name: 'Hardware', slug: 'hardware', description: 'Tin tức chuyên sâu về phần cứng máy tính: CPU, GPU, RAM, SSD.', created_at: '' },
  { id: '6', name: 'Hướng dẫn', slug: 'huong-dan', description: 'Hướng dẫn chi tiết sử dụng phần mềm, khắc phục lỗi hệ thống.', created_at: '' },
  { id: '7', name: 'Review', slug: 'review', description: 'Đánh giá sản phẩm công nghệ chi tiết, công tâm và trung thực.', created_at: '' },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'NVIDIA GeForce RTX 5090 Rò Rỉ Thông Số Khủng: Sức Mạnh Tột Đỉnh Cho Kỷ Nguyên AI',
    slug: 'nvidia-geforce-rtx-5090-ro-ri-thong-so-khung',
    summary: 'Thế hệ card đồ họa Blackwell tiếp theo của NVIDIA hứa hẹn sẽ mang lại bước nhảy vọt hiệu năng chưa từng có với bộ nhớ GDDR7 và kiến trúc 3nm tiên tiến.',
    content: 'Nội dung chi tiết...',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=60',
    author_name: 'Minh Đức',
    category_id: '5',
    status: 'published',
    is_featured: true,
    views: 12450,
    meta_title: '',
    meta_description: '',
    source_name: '',
    source_url: '',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[4],
  }
];

// Sinh SEO Metadata động cho trang chuyên mục
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let category: Category | null = null;
  try {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    category = data;
  } catch (e) {
    category = null;
  }

  // Fallback sang mock data
  if (!category) {
    category = MOCK_CATEGORIES.find(c => c.slug === slug) || null;
  }

  if (!category) {
    return {
      title: 'Chuyên mục không tồn tại',
    };
  }

  return {
    title: category.name,
    description: category.description || `Đọc các bài viết công nghệ mới nhất về ${category.name}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category: Category | null = null;
  let articles: Article[] = [];
  let isUsingMock = false;

  try {
    // 1. Lấy thông tin chuyên mục
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (catError || !catData) throw new Error('Category not found');
    category = catData;

    // 2. Lấy danh sách bài viết thuộc chuyên mục
    const { data: artData, error: artError } = await supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('category_id', catData.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (artError) throw artError;
    articles = artData || [];
  } catch (err) {
    console.error('Lỗi khi lấy thông tin chuyên mục, chuyển sang Mock data:', err);
    // Fallback Mock
    category = MOCK_CATEGORIES.find((c) => c.slug === slug) || null;
    if (category) {
      isUsingMock = true;
      // Dùng bài viết mẫu phù hợp với chuyên mục
      articles = MOCK_ARTICLES.map(a => ({
        ...a,
        category: category,
        category_id: category!.id
      }));
    }
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="public-container py-8 flex flex-col gap-8">
      {/* Category Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/20 p-8 md:p-12">
        {/* Background glow decorator */}
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-accent-cyan/10 blur-3xl"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-accent-cyan tracking-wider uppercase">
            <LayoutGrid className="h-4.5 w-4.5" />
            <span>Chuyên mục</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {category.description || 'Tổng hợp các bài viết phân tích, tin tức công nghệ mới nhất cùng chủ đề.'}
          </p>
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
          Danh sách bài viết ({articles.length})
        </h2>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 bg-slate-100/30 dark:bg-slate-900/10">
            Hiện tại chưa có bài viết nào thuộc chuyên mục này. Hãy quay lại sau!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
