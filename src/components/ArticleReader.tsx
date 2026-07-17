'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Eye, Link2, BookOpen, Share2, Bookmark, BookmarkCheck, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { Article } from '@/types/database';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ArticleCard, { estimateReadingTime } from '@/components/ArticleCard';
import { useToast } from '@/components/Toast';

interface Heading {
  text: string;
  id: string;
  level: number;
}

interface ArticleReaderProps {
  article: Article;
  relatedArticles: Article[];
  prevArticle: Article | null;
  nextArticle: Article | null;
}

export default function ArticleReader({ article, relatedArticles, prevArticle, nextArticle }: ArticleReaderProps) {
  const toast = useToast();
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Load headings from content
  useEffect(() => {
    const headingRegex = /^(##|###)\s+(.+)$/gm;
    const matches: Heading[] = [];
    let match;
    const tempContent = article.content || '';
    
    while ((match = headingRegex.exec(tempContent)) !== null) {
      const level = match[1].length; 
      const text = match[2].replace(/[*_`]/g, '').trim(); // clean markdown syntax from heading text
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      matches.push({ text, id, level });
    }
    setHeadings(matches);
  }, [article.content]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Load bookmark state
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(article.id));
  }, [article.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== article.id);
      toast.success('Đã xóa bài viết khỏi danh sách đánh dấu');
    } else {
      newBookmarks = [...bookmarks, article.id];
      toast.success('Đã lưu bài viết vào danh sách đánh dấu');
    }
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary || '',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
    }
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Đang cập nhật';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const coverImage = article.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';

  return (
    <>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-accent-cyan z-[9999] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content Column (Left) */}
        <div className="lg:col-span-3 space-y-8 max-w-[760px] w-full">
          {/* Header Info */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              {article.title}
            </h1>
            
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-400 font-medium italic border-l-2 border-primary pl-4 py-1 leading-relaxed bg-slate-100 dark:bg-slate-950/20 rounded-r-xl pr-4">
              {article.summary}
            </p>

            {/* Metadata section */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-200 dark:border-white/5 py-4 my-6">
              <span className="flex items-center space-x-1.5">
                <User className="h-4 w-4 text-primary" />
                <span>Bởi: <strong className="text-slate-700 dark:text-slate-300">{article.author_name}</strong></span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-secondary" />
                <span>Đăng: {formatDate(article.published_at)}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-accent-cyan" />
                <span>Thời gian đọc: {estimateReadingTime(article.content)}</span>
              </span>
              <span className="flex items-center space-x-1.5 md:ml-auto text-accent-cyan">
                <Eye className="h-4 w-4" />
                <span>{article.views} lượt xem</span>
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-2xl shrink-0">
            <Image 
              src={coverImage} 
              alt={article.title} 
              fill
              priority
              sizes="(max-width: 768px) 100vw, 760px"
              className="object-cover"
            />
          </div>

          {/* Mobile Actions (Visible on small screens) */}
          <div className="flex lg:hidden items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/20">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tương tác</span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleBookmark}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-accent-cyan transition-colors"
              >
                {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-accent-cyan" /> : <Bookmark className="h-4 w-4" />}
                <span>{isBookmarked ? 'Đã lưu' : 'Lưu tin'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-accent-cyan transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>

          {/* Article Markdown Content */}
          <div className="py-2">
            <MarkdownRenderer content={article.content} />
          </div>

          {/* Reference Source Card */}
          {(article.source_name || article.source_url) && (
            <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/20 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-2">
                <Link2 className="h-4 w-4 text-accent-cyan" />
                <span className="font-bold uppercase tracking-wider text-slate-500">Nguồn tham khảo:</span>
                {article.source_url ? (
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 dark:text-white hover:text-accent-cyan transition-colors underline decoration-dashed"
                  >
                    {article.source_name || 'Liên kết nguồn'}
                  </a>
                ) : (
                  <span className="font-bold text-slate-900 dark:text-white">{article.source_name}</span>
                )}
              </span>
            </div>
          )}

          {/* Author info section */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/20 flex gap-4 items-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg shadow-primary/10">
              {article.author_name ? article.author_name[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Biên tập viên: {article.author_name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Chuyên gia phân tích tin tức công nghệ, PC hardware và phần mềm tại TechNews Portal.</p>
            </div>
          </div>

          {/* Prev/Next Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-white/5 pt-6">
            {prevArticle ? (
              <Link 
                href={`/article/${prevArticle.slug}`} 
                className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/10 hover:bg-slate-50 dark:hover:bg-slate-950/20 hover:border-accent-cyan/15 transition-all text-left flex flex-col gap-1 group"
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Bài trước
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors line-clamp-1">
                  {prevArticle.title}
                </span>
              </Link>
            ) : <div className="hidden md:block" />}
            
            {nextArticle ? (
              <Link 
                href={`/article/${nextArticle.slug}`} 
                className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/10 hover:bg-slate-50 dark:hover:bg-slate-950/20 hover:border-accent-cyan/15 transition-all text-right flex flex-col gap-1 group items-end"
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  Bài sau
                  <ArrowRight className="h-3 w-3" />
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors line-clamp-1">
                  {nextArticle.title}
                </span>
              </Link>
            ) : <div className="hidden md:block" />}
          </div>
        </div>

        {/* Sidebar Column (Right - Table of Contents, Share, Bookmarks) */}
        <div className="lg:col-span-1 hidden lg:block sticky top-24 self-start space-y-6">
          {/* Action Panel */}
          <div className="glass-panel bg-slate-100/30 dark:bg-slate-950/20 border-slate-200/50 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-white/5 pb-2">Tương tác</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleBookmark}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-accent-cyan/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition-all cursor-pointer w-full text-left"
              >
                {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-accent-cyan animate-pulse" /> : <Bookmark className="h-4 w-4" />}
                <span>{isBookmarked ? 'Đã lưu đánh dấu' : 'Lưu tin vào bookmark'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-accent-cyan/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-bold transition-all cursor-pointer w-full text-left"
              >
                <Share2 className="h-4 w-4" />
                <span>Chia sẻ liên kết</span>
              </button>
            </div>
          </div>

          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="glass-panel bg-slate-100/30 dark:bg-slate-950/20 border-slate-200/50 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-accent-cyan" />
                Mục lục bài viết
              </h3>
              <nav className="flex flex-col gap-2 max-h-[350px] overflow-y-auto scrollbar-none py-1">
                {headings.map((heading, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToHeading(heading.id)}
                    className={`text-left text-xs font-semibold leading-relaxed transition-all cursor-pointer hover:text-accent-cyan ${
                      heading.level === 3 ? 'pl-4 text-[11px]' : ''
                    } ${
                      activeId === heading.id 
                        ? 'text-accent-cyan border-l-2 border-accent-cyan pl-2 font-bold' 
                        : 'text-slate-500 dark:text-slate-400 border-l border-transparent'
                    }`}
                  >
                    {heading.text}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
