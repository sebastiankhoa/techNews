'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Cpu, Search, Settings, Moon, Sun, Flame, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/database';
import { useToast } from '@/components/Toast';
import { useTheme } from 'next-themes';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  
  // Search states & refs
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);

  // Trending states
  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);

  // Theme states
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Escape key event listener to close search
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Click outside event listener to close search
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (searchFormRef.current && !searchFormRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  // Fetch Categories
  const defaultCategories: Partial<Category>[] = [
    { name: 'AI', slug: 'ai' },
    { name: 'PC', slug: 'pc' },
    { name: 'Windows', slug: 'windows' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Hardware', slug: 'hardware' }
  ];

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(defaultCategories as Category[]);
        }
      } catch (err) {
        console.error('Error fetching categories for header:', err);
        setCategories(defaultCategories as Category[]);
      }
    }
    fetchCategories();
  }, []);

  // Fetch Admin Auth Status
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .single();
        setHasAdminAccess(!!adminUser);
      } else {
        setHasAdminAccess(false);
      }
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        setHasAdminAccess(!!adminUser);
      } else {
        setHasAdminAccess(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Trending Articles (top views)
  useEffect(() => {
    async function fetchTrending() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, slug')
          .eq('status', 'published')
          .order('views', { ascending: false })
          .limit(5);
        if (data) {
          setTrendingArticles(data);
        }
      } catch (err) {
        console.error('Error fetching trending:', err);
      }
    }
    fetchTrending();
  }, []);

  // Trending Ticker Interval
  useEffect(() => {
    if (trendingArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingArticles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trendingArticles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
  };

  const handleThemeToggle = () => {
    const currentTheme = theme === 'system' ? resolvedTheme : theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => pathname === path;
  const isCategoryActive = (slug: string) => pathname === `/category/${slug}`;
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background/80 backdrop-blur-md transition-all">
        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="absolute inset-0 bg-background z-50 flex items-center px-4 md:hidden animate-in fade-in duration-200">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3" ref={searchFormRef}>
              <Search className="h-5 w-5 text-slate-500" />
              <input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        <div className="public-container w-full flex h-16 items-center justify-between">
          {/* Logo (Left) */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-accent-cyan dark:from-white dark:via-slate-200 dark:to-accent-cyan bg-clip-text text-transparent group-hover:to-accent-purple transition-all duration-300">
              Tech<span className="text-accent-cyan">News</span>
            </span>
          </Link>

          {/* Desktop Navigation (Middle) */}
          <nav className="hidden md:flex items-center gap-1.5 max-w-2xl overflow-x-auto scrollbar-none py-1">
            <Link
              href="/"
              className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-accent-cyan px-3 py-2 rounded-lg border ${
                isActive('/') ? 'text-accent-cyan dark:text-cyan-400 bg-slate-100 dark:bg-cyan-500/10 border-slate-200 dark:border-cyan-500/20' : 'text-slate-500 dark:text-slate-400 border-transparent'
              }`}
            >
              Trang chủ
            </Link>

            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-accent-cyan px-3 py-2 rounded-lg whitespace-nowrap border ${
                  isCategoryActive(category.slug) ? 'text-accent-cyan dark:text-cyan-400 bg-slate-100 dark:bg-cyan-500/10 border-slate-200 dark:border-cyan-500/20' : 'text-slate-500 dark:text-slate-400 border-transparent'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Actions & Theme (Right) */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden md:block">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in slide-in-from-right-3 duration-200" ref={searchFormRef}>
                  <input
                    type="text"
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-40 lg:w-56 pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-accent-cyan transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="absolute right-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all cursor-pointer"
                  title="Tìm kiếm"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Theme Toggle Button */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              {mounted ? (
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                  aria-label={(theme === 'system' ? resolvedTheme : theme) === 'dark' ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
                  title={(theme === 'system' ? resolvedTheme : theme) === 'dark' ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
                >
                  {(theme === 'system' ? resolvedTheme : theme) === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <Moon className="h-4 w-4 text-accent-cyan transition-transform duration-300 hover:-rotate-12" />
                  )}
                </button>
              ) : (
                <div className="w-8 h-8" aria-hidden="true" />
              )}
            </div>

            {/* Admin Settings (Authorized only) */}
            {hasAdminAccess && (
              <Link
                href="/admin"
                className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  isAdmin
                    ? 'bg-primary/20 border-primary/50 text-accent-purple shadow-sm shadow-primary/10'
                    : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Quản trị</span>
              </Link>
            )}

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-0.5">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Open Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trending Bar */}
      {trendingArticles.length > 0 && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 py-2">
          <div className="public-container flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 font-extrabold uppercase tracking-widest text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/10 px-2 py-0.5 rounded shrink-0">
              <Flame className="h-3 w-3 animate-pulse" />
              <span>Trending</span>
            </div>
            <div className="flex-1 overflow-hidden relative h-4">
              <div className="flex flex-col absolute w-full transition-all duration-500 ease-in-out" style={{ transform: `translateY(-${currentTrendingIndex * 16}px)` }}>
                {trendingArticles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="text-slate-700 dark:text-slate-300 hover:text-accent-cyan font-medium truncate block h-4 leading-4 transition-colors"
                  >
                    {art.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slider Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative ml-auto max-w-xs w-full bg-background border-l border-slate-200 dark:border-white/5 h-full flex flex-col z-[101] shadow-2xl p-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Danh mục</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-grow py-6 flex flex-col gap-2.5">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all border ${
                  isActive('/') ? 'bg-slate-100 dark:bg-cyan-500/10 text-accent-cyan dark:text-cyan-400 border-slate-200 dark:border-cyan-500/20' : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <span>Trang chủ</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
              
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all border ${
                    isCategoryActive(category.slug) ? 'bg-slate-100 dark:bg-cyan-500/10 text-accent-cyan dark:text-cyan-400 border-slate-200 dark:border-cyan-500/20' : 'text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}

              {hasAdminAccess && (
                <>
                  <div className="py-1 border-t border-slate-200 dark:border-white/5 my-2"></div>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-accent-purple bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Quản trị viên</span>
                  </Link>
                </>
              )}
            </nav>
            
            <div className="text-center pt-4 border-t border-white/5">
              <p className="text-[10px] text-slate-600">TechNews Portal &copy; {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
