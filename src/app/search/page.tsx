'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types/database';
import ArticleCard from '@/components/ArticleCard';
import { Search, Loader2, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  
  const [searchInput, setSearchInput] = useState(q);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync input value if URL query parameter changes
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Execute database search query via Supabase
  useEffect(() => {
    async function performSearch() {
      if (!q.trim()) {
        setArticles([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('articles')
          .select('*, category:categories(*)')
          .eq('status', 'published')
          .or(`title.ilike.%${q}%,summary.ilike.%${q}%,content.ilike.%${q}%`)
          .order('published_at', { ascending: false })
          .limit(20);

        if (err) throw err;
        setArticles(data || []);
      } catch (e: any) {
        console.error('Search failed:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  return (
    <div className="public-container py-8 flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Back button and title */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent-cyan transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại trang chủ</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {q ? `Kết quả tìm kiếm cho: "${q}"` : 'Tìm kiếm bài viết'}
        </h1>
      </div>

      {/* Re-search Form input */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl w-full">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/5 bg-slate-900/40 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan transition-all"
        />
      </form>

      {/* Results Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-slate-400 text-sm">Đang tìm kiếm bài viết phù hợp...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/5 p-8 text-center text-red-400">
          Có lỗi xảy ra: {error}. Vui lòng thử lại.
        </div>
      ) : articles.length === 0 ? (
        q ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-slate-500 space-y-2 bg-slate-900/10">
            <FileText className="h-10 w-10 mx-auto text-slate-600 animate-bounce" />
            <p className="font-semibold text-slate-300">Không tìm thấy bài viết phù hợp</p>
            <p className="text-sm">Hãy thử nhập từ khóa khác hoặc tìm chuyên mục khác.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-slate-500 space-y-2 bg-slate-900/10">
            <Search className="h-10 w-10 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300">Nhập từ khóa để bắt đầu tìm kiếm</p>
          </div>
        )
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">
            Tìm thấy {articles.length} kết quả phù hợp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="public-container py-8 flex items-center justify-center p-20">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
