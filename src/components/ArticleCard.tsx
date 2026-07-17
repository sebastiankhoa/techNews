import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Eye, Clock } from 'lucide-react';
import { Article } from '@/types/database';

interface ArticleCardProps {
  article: Article;
}

export const getCategoryAccent = (slug: string) => {
  switch (slug?.toLowerCase()) {
    case 'ai': 
      return {
        badge: 'text-accent-purple border-accent-purple/20 bg-accent-purple/10',
        text: 'text-accent-purple',
        border: 'hover:border-accent-purple/30',
        bg: 'bg-accent-purple'
      };
    case 'pc': 
      return {
        badge: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/10',
        text: 'text-accent-cyan',
        border: 'hover:border-accent-cyan/30',
        bg: 'bg-accent-cyan'
      };
    case 'windows': 
      return {
        badge: 'text-blue-400 border-blue-500/20 bg-blue-950/30',
        text: 'text-blue-400',
        border: 'hover:border-blue-500/30',
        bg: 'bg-blue-500'
      };
    case 'gaming': 
      return {
        badge: 'text-red-400 border-red-500/20 bg-red-950/30',
        text: 'text-red-400',
        border: 'hover:border-red-500/30',
        bg: 'bg-red-500'
      };
    case 'hardware': 
      return {
        badge: 'text-pink-400 border-pink-500/20 bg-pink-950/30',
        text: 'text-pink-400',
        border: 'hover:border-pink-500/30',
        bg: 'bg-pink-500'
      };
    default: 
      return {
        badge: 'text-slate-400 border-slate-500/20 bg-slate-900/30',
        text: 'text-slate-400',
        border: 'hover:border-slate-500/30',
        bg: 'bg-slate-500'
      };
  }
};

export const estimateReadingTime = (content: string) => {
  const words = content ? content.split(/\s+/).length : 0;
  const time = Math.ceil(words / 200); // 200 words per minute
  return `${time || 2} phút đọc`;
};

export default function ArticleCard({ article }: ArticleCardProps) {
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
  const accent = getCategoryAccent(categorySlug);

  // Placeholder cover image if none is provided
  const coverImage = article.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60';

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:translate-y-[-4px] hover:shadow-2xl ${accent.border} flex-1 min-h-[380px]`}>
      
      {/* Article Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
        {/* Category Badge */}
        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            className={`absolute left-4 top-4 z-10 rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${accent.badge} hover:opacity-90`}
          >
            {categoryName}
          </Link>
        )}
        
        {/* Hover overlay glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent dark:from-slate-950/90 dark:via-slate-950/30 z-1"></div>

        <Image
          src={coverImage}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5 z-2">
        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[10px] font-semibold text-slate-500 mb-2.5">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.published_at)}</span>
          </span>
          <span className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{article.author_name}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{estimateReadingTime(article.content)}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold leading-snug text-slate-900 dark:text-white group-hover:text-accent-cyan transition-colors line-clamp-2 mb-2">
          <Link href={`/article/${article.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {article.title}
          </Link>
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-grow">
          {article.summary || 'Không có mô tả tóm tắt nào cho bài viết này.'}
        </p>

        {/* Views Count */}
        <div className="flex items-center text-[10px] text-slate-500 dark:text-slate-500 font-semibold border-t border-slate-200 dark:border-slate-700 pt-3.5 mt-auto">
          <Eye className="h-3 w-3 mr-1" />
          <span>{article.views} lượt xem</span>
        </div>
      </div>
    </article>
  );
}
