import React from 'react';
import Link from 'next/link';
import { Calendar, User, Eye, ArrowUpRight } from 'lucide-react';
import { Article } from '@/types/database';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // Format published_at date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Đang cập nhật';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const categoryName = article.category?.name || 'Tin tức';
  const categorySlug = article.category?.slug || '';

  // Placeholder cover image if none is provided
  const coverImage = article.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl glass-panel glass-panel-hover h-full">
      {/* Article Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {/* Category Badge */}
        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            className="absolute left-4 top-4 z-10 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan hover:text-slate-950 transition-all duration-300"
          >
            {categoryName}
          </Link>
        )}
        
        {/* Hover overlay glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-1 duration-300"></div>

        <img
          src={coverImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5">
        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mb-3">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{formatDate(article.published_at)}</span>
          </span>
          <span className="flex items-center space-x-1">
            <User className="h-3.5 w-3.5 text-secondary" />
            <span className="truncate max-w-[100px]">{article.author_name}</span>
          </span>
          <span className="flex items-center space-x-1 ml-auto">
            <Eye className="h-3.5 w-3.5" />
            <span>{article.views} lượt xem</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-snug text-white group-hover:text-accent-cyan transition-colors line-clamp-2 mb-2">
          <Link href={`/article/${article.slug}`} className="focus:outline-none flex items-start gap-1">
            <span className="absolute inset-0" aria-hidden="true" />
            <span>{article.title}</span>
          </Link>
        </h3>

        {/* Summary */}
        <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
          {article.summary || 'Không có mô tả tóm tắt nào cho bài viết này.'}
        </p>

        {/* Read More button */}
        <div className="flex items-center text-xs font-semibold text-accent-cyan group-hover:text-accent-purple transition-colors mt-auto">
          <span>Xem chi tiết</span>
          <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </article>
  );
}
