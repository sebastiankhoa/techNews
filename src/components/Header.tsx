'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Cpu, Search, Terminal, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/database';

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Search states & refs
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchFormRef = React.useRef<HTMLFormElement>(null);

  // Auto focus input when opened
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
  };

  // Mặc định các category để tránh lỗi kết nối Supabase ban đầu
  const defaultCategories: Partial<Category>[] = [
    { name: 'AI', slug: 'ai' },
    { name: 'PC', slug: 'pc' },
    { name: 'Windows', slug: 'windows' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Hardware', slug: 'hardware' },
    { name: 'Hướng dẫn', slug: 'huong-dan' },
    { name: 'Review', slug: 'review' }
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

  const isActive = (path: string) => pathname === path;
  const isCategoryActive = (slug: string) => pathname === `/category/${slug}`;
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md relative">
      {isSearchOpen && (
        <div className="absolute inset-0 bg-[#090D16] z-50 flex items-center px-4 md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3 animate-in fade-in duration-200" ref={searchFormRef}>
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="flex-1 bg-transparent border-none text-white placeholder-slate-500 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
      <div className="public-container w-full flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-md shadow-primary/20">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-accent-cyan bg-clip-text text-transparent group-hover:to-accent-purple transition-all duration-300">
            Tech<span className="text-accent-cyan">News</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-accent-cyan py-1.5 px-2 rounded-md hover:bg-white/5 ${
              isActive('/') ? 'text-accent-cyan bg-white/5' : 'text-slate-300'
            }`}
          >
            Trang chủ
          </Link>

          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className={`text-sm font-medium transition-colors hover:text-accent-cyan py-1.5 px-2.5 rounded-md hover:bg-white/5 ${
                isCategoryActive(category.slug) ? 'text-accent-cyan bg-white/5' : 'text-slate-300'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {/* Actions (Search & Admin Link) */}
        <div className="hidden md:flex items-center gap-3">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in fade-in duration-200" ref={searchFormRef}>
              <input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="w-48 lg:w-64 pl-3 pr-8 py-2 rounded-lg border border-white/10 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="absolute right-2.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-all cursor-pointer"
              title="Tìm kiếm"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          )}

          {hasAdminAccess && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                isAdmin
                  ? 'bg-primary/20 border-primary/50 text-accent-purple shadow-sm shadow-primary/10'
                  : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Quản trị</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-1">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          
          {hasAdminAccess && (
            <Link
              href="/admin"
              className="p-2 text-slate-400 hover:text-white"
              aria-label="Admin Page"
            >
              <Settings className="h-5 w-5" />
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-white/5 bg-background/95 backdrop-blur-lg px-4 pt-2 pb-4 flex flex-col gap-1.5">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`block rounded-lg px-3 py-2 text-base font-medium hover:bg-white/5 ${
              isActive('/') ? 'text-accent-cyan bg-white/5' : 'text-slate-300'
            }`}
          >
            Trang chủ
          </Link>
          
          <div className="py-1 border-t border-white/5 my-1"></div>
          
          <div className="text-xs font-semibold text-slate-500 uppercase px-3 py-1 tracking-wider">
            Chuyên mục
          </div>
          
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3 py-2 text-base font-medium hover:bg-white/5 ${
                isCategoryActive(category.slug) ? 'text-accent-cyan bg-white/5' : 'text-slate-300'
              }`}
            >
              {category.name}
            </Link>
          ))}

          <div className="py-1 border-t border-white/5 my-1"></div>

          {hasAdminAccess && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium hover:bg-white/5 ${
                isAdmin ? 'text-accent-purple bg-primary/10' : 'text-slate-300'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Quản trị</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
