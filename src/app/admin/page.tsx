'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Article, Category } from '@/types/database';
import { 
  Plus, Search, Edit2, Trash2, Eye, 
  CheckCircle, FileText, Loader2, AlertCircle, RefreshCw,
  Upload, Archive
} from 'lucide-react';

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'AI', slug: 'ai', description: 'Trí tuệ nhân tạo', created_at: '' },
  { id: '2', name: 'PC', slug: 'pc', description: 'Máy tính cá nhân', created_at: '' },
  { id: '3', name: 'Windows', slug: 'windows', description: 'Hệ điều hành Windows', created_at: '' },
  { id: '4', name: 'Gaming', slug: 'gaming', description: 'Trò chơi điện tử', created_at: '' },
  { id: '5', name: 'Hardware', slug: 'hardware', description: 'Phần cứng máy tính', created_at: '' },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'NVIDIA GeForce RTX 5090 Rò Rỉ Thông Số Khủng: Sức Mạnh Tột Đỉnh Cho Kỷ Nguyên AI',
    slug: 'nvidia-geforce-rtx-5090-ro-ri-thong-so-khung',
    summary: 'Thế hệ card đồ họa Blackwell tiếp theo của NVIDIA...',
    content: 'Chi tiết...',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=100&auto=format&fit=crop&q=60',
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
  },
  {
    id: 'a2',
    title: 'Trải Nghiệm GPT-5 Beta: Trí Tuệ Nhân Tạo Đạt Ngưỡng Tư Duy Như Con Người?',
    slug: 'trai-nghiem-gpt-5-beta-tri-tue-nhan-tao-dat-nguong-tu-duy',
    summary: 'OpenAI đã âm thầm cấp quyền truy cập phiên bản thử nghiệm...',
    content: 'Chi tiết...',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=100&auto=format&fit=crop&q=60',
    author_name: 'Khánh Huyền',
    category_id: '1',
    status: 'draft',
    is_featured: false,
    views: 340,
    meta_title: '',
    meta_description: '',
    source_name: '',
    source_url: '',
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[0],
  }
];

export default function AdminDashboard() {
  const toast = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [mockArticles, setMockArticles] = useState<Article[]>(MOCK_ARTICLES);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Confirm delete states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search term after 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Load categories initially
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (catError) throw catError;
        setCategories(catData || []);
        setIsUsingMock(false);
      } catch (err: any) {
        console.warn('Lỗi kết nối chuyên mục Supabase, chuyển sang Mock data:', err.message);
        setCategories(MOCK_CATEGORIES);
        setIsUsingMock(true);
      }
    }
    loadCategories();
  }, []);

  // Fetch articles based on pagination & filters
  const fetchArticles = async (page: number, size: number, search: string, category: string, status: string) => {
    setLoading(true);
    setError(null);
    
    if (isUsingMock) {
      // Filter mock articles
      const filtered = mockArticles.filter(art => {
        const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) ||
                              art.author_name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === '' || art.category_id === category || art.category?.id === category;
        const matchesStatus = status === '' || art.status === status;
        return matchesSearch && matchesCategory && matchesStatus;
      });

      const count = filtered.length;
      const from = (page - 1) * size;
      const to = from + size;
      const paged = filtered.slice(from, to);

      setArticles(paged);
      setTotalCount(count);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('articles')
        .select('*, category:categories(*)', { count: 'exact' });

      if (search) {
        query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%`);
      }

      if (category) {
        query = query.eq('category_id', category);
      }

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('created_at', { ascending: false });

      const from = (page - 1) * size;
      const to = from + size - 1;
      query = query.range(from, to);

      const { data, count, error: fetchErr } = await query;

      if (fetchErr) {
        if (fetchErr.message.includes('Fetch') || fetchErr.message.includes('connection')) {
          setIsUsingMock(true);
          return;
        }
        throw fetchErr;
      }

      setArticles(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Fetch articles failed:', err);
      setError(err.message);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage, pageSize, debouncedSearchTerm, selectedCategory, selectedStatus);
  }, [currentPage, pageSize, debouncedSearchTerm, selectedCategory, selectedStatus, isUsingMock, mockArticles]);

  // Thử kết nối lại Supabase
  const handleReconnect = async () => {
    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (catError) throw catError;
      setCategories(catData || []);
      
      setIsUsingMock(false);
      setCurrentPage(1);
      toast.success('Kết nối Supabase thành công!');
    } catch (err: any) {
      console.warn('Kết nối lại Supabase thất bại:', err.message);
      toast.error('Không thể kết nối lại Supabase: ' + err.message);
      setIsUsingMock(true);
      setLoading(false);
    }
  };

  // Đổi trạng thái nháp/xuất bản nhanh
  const toggleStatus = async (id: string, currentStatus: 'draft' | 'published') => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    const art = articles.find(a => a.id === id);
    let publishedAt = art?.published_at || null;
    
    if (newStatus === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString();
    } else if (newStatus === 'draft') {
      publishedAt = null;
    }

    if (isUsingMock) {
      setMockArticles(prev => prev.map(art => 
        art.id === id ? { ...art, status: newStatus, published_at: publishedAt } : art
      ));
      toast.success(`Đã chuyển trạng thái thành công sang ${newStatus === 'published' ? 'Đã đăng' : 'Bản nháp'} (Demo Mode)!`);
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: newStatus, published_at: publishedAt })
        .eq('id', id);

      if (error) throw error;
      
      setArticles(prev => prev.map(art => 
        art.id === id ? { ...art, status: newStatus, published_at: publishedAt } : art
      ));
      toast.success(`Đã chuyển trạng thái thành công sang ${newStatus === 'published' ? 'Đã đăng' : 'Bản nháp'}!`);
    } catch (err: any) {
      toast.error('Không thể cập nhật trạng thái: ' + err.message);
    }
  };

  // Kích hoạt dialog xóa bài viết
  const handleDeleteClick = (id: string) => {
    setArticleToDelete(id);
    setConfirmOpen(true);
  };

  // Xác nhận xóa bài viết thực tế
  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);

    if (isUsingMock) {
      setMockArticles(prev => {
        const nextMock = prev.filter(art => art.id !== articleToDelete);
        const filtered = nextMock.filter(art => {
          const matchesSearch = art.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                                art.author_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
          const matchesCategory = selectedCategory === '' || art.category_id === selectedCategory || art.category?.id === selectedCategory;
          const matchesStatus = selectedStatus === '' || art.status === selectedStatus;
          return matchesSearch && matchesCategory && matchesStatus;
        });
        const newTotalCount = filtered.length;
        const totalPages = Math.ceil(newTotalCount / pageSize);
        if (currentPage > 1 && currentPage > totalPages) {
          setCurrentPage(totalPages);
        }
        return nextMock;
      });
      toast.success('Đã xóa bài viết thành công (Demo Mode)!');
      setIsDeleting(false);
      setConfirmOpen(false);
      setArticleToDelete(null);
      return;
    }

    try {
      // Delete tags relations first to be safe (cascade-safe)
      await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleToDelete);

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleToDelete);

      if (error) throw error;

      toast.success('Xóa bài viết thành công!');
      setConfirmOpen(false);

      if (articles.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchArticles(currentPage, pageSize, debouncedSearchTerm, selectedCategory, selectedStatus);
      }
    } catch (err: any) {
      toast.error('Lỗi khi xóa bài viết: ' + err.message);
    } finally {
      setIsDeleting(false);
      setArticleToDelete(null);
    }
  };

  // Lọc bài viết (Đã được thực hiện ở server-side / mock data range slice, gán trực tiếp để tránh lọc kép)
  const filteredArticles = articles;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý bài viết</h1>
          <p className="text-sm text-slate-400">Xem, chỉnh sửa, thay đổi trạng thái hoặc xóa bài viết công nghệ.</p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-primary/30 hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Viết bài mới</span>
        </Link>
      </div>

      {isUsingMock && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <span>Đang hoạt động trên <strong>Dữ liệu giả lập</strong>. Mọi thay đổi (thêm, sửa, xóa, chuyển đổi trạng thái) sẽ chỉ lưu tạm trên giao diện hiện tại.</span>
          </div>
          <button 
            onClick={handleReconnect}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-white px-2 py-1 rounded border border-amber-500/20 hover:bg-amber-500/15 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Kết nối lại</span>
          </button>
        </div>
      )}

      {/* Filters Area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl glass-panel">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/5 bg-slate-900/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan transition-all"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900/50 text-sm text-slate-300 focus:outline-none focus:border-accent-cyan transition-all"
        >
          <option value="">Tất cả chuyên mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900/50 text-sm text-slate-300 focus:outline-none focus:border-accent-cyan transition-all"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản (Published)</option>
          <option value="draft">Bản nháp (Draft)</option>
        </select>
      </div>

      {/* Articles Table Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-slate-400 text-sm">Đang đồng bộ dữ liệu bài viết...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-slate-500 space-y-2 bg-slate-900/10">
          <FileText className="h-10 w-10 mx-auto text-slate-600" />
          <p className="font-semibold text-slate-300">Không tìm thấy bài viết nào</p>
          <p className="text-sm">Hãy thử thay đổi bộ lọc tìm kiếm hoặc tạo một bài viết mới.</p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {/* A. MOBILE CARD LAYOUT (hidden on desktop/tablet) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredArticles.map((art) => (
              <div key={art.id} className="glass-panel p-4 rounded-2xl flex flex-col gap-3.5 border-white/5 relative bg-[#0d1527]/80">
                {/* Thumbnail & Title/Slug */}
                <div className="flex gap-3">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-slate-900">
                    <img
                      src={art.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=60'}
                      alt={art.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white block text-sm hover:text-accent-cyan transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-1">
                      Slug: {art.slug}
                    </span>
                  </div>
                </div>

                {/* Metadata & Status */}
                <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 text-xs">
                  {/* Category */}
                  {art.category ? (
                    <span className="inline-flex rounded-full bg-slate-900 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {art.category.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Chưa phân loại</span>
                  )}

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    art.status === 'published'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-white/10 text-slate-400'
                  }`}>
                    <CheckCircle className="h-2.5 w-2.5" />
                    <span>{art.status === 'published' ? 'Đã đăng' : 'Bản nháp'}</span>
                  </span>

                  {/* Views */}
                  <span className="text-[10px] text-slate-400 ml-auto">
                    Lượt xem: <strong className="text-white">{art.views}</strong>
                  </span>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                  {/* View live article */}
                  <Link
                    href={`/article/${art.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-white/5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                    title="Xem bài viết"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="xs:inline hidden">Xem</span>
                  </Link>

                  {/* Quick toggle status */}
                  <button
                    onClick={() => toggleStatus(art.id, art.status)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-white/5 bg-slate-900 text-xs font-semibold transition-all cursor-pointer ${
                      art.status === 'published'
                        ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/20'
                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15'
                    }`}
                    title={art.status === 'published' ? 'Chuyển về nháp' : 'Đăng bài'}
                  >
                    {art.status === 'published' ? (
                      <>
                        <Archive className="h-3.5 w-3.5" />
                        <span className="xs:inline hidden">Nháp</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span className="xs:inline hidden">Đăng</span>
                      </>
                    )}
                  </button>

                  {/* Edit button */}
                  <Link
                    href={`/admin/edit/${art.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-white/5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-accent-cyan text-xs font-semibold transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span className="xs:inline hidden">Sửa</span>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteClick(art.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-red-500/20 bg-slate-950 hover:bg-red-950/30 text-red-400 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="xs:inline hidden">Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* B. DESKTOP/TABLET TABLE LAYOUT (hidden on mobile) */}
          <div className="hidden md:block glass-panel rounded-2xl overflow-hidden shadow-xl border-white/5 bg-[#0d1527]/50">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-auto min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Bài viết</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Chuyên mục</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Tác giả</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center hidden lg:table-cell">Lượt xem</th>
                    <th className="px-6 py-4 text-right sticky right-0 bg-[#0d1527] z-10">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                  {filteredArticles.map((art) => (
                    <tr key={art.id} className="group hover:bg-white/5 transition-all">
                      {/* Cover & Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-[280px] lg:max-w-[400px]">
                          <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-slate-900">
                            <img
                              src={art.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=60'}
                              alt={art.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-white block hover:text-accent-cyan transition-colors truncate" title={art.title}>
                              {art.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5 truncate" title={art.slug}>
                              Slug: {art.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {art.category ? (
                          <span className="inline-flex rounded-full bg-slate-900 border border-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                            {art.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Chưa phân loại</span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 font-medium text-slate-200 hidden lg:table-cell">
                        {art.author_name}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          art.status === 'published'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border-white/10 text-slate-400'
                        }`}>
                          <CheckCircle className="h-3 w-3" />
                          <span>{art.status === 'published' ? 'Đã đăng' : 'Bản nháp'}</span>
                        </span>
                      </td>

                      {/* Views */}
                      <td className="px-6 py-4 text-center font-semibold text-white hidden lg:table-cell">
                        {art.views}
                      </td>

                      {/* Action buttons (Sticky right-0) */}
                      <td className="px-6 py-4 text-right sticky right-0 bg-[#0d1527] group-hover:bg-[#161e30] transition-colors z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-end gap-2">
                          {/* View live article */}
                          <Link
                            href={`/article/${art.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-white/5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                            title="Xem bài viết"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* Status Toggle Quick Action */}
                          <button
                            onClick={() => toggleStatus(art.id, art.status)}
                            className={`p-1.5 rounded-lg border border-white/5 bg-slate-900 transition-all cursor-pointer ${
                              art.status === 'published'
                                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/20'
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20'
                            }`}
                            title={art.status === 'published' ? 'Chuyển về nháp' : 'Đăng bài'}
                          >
                            {art.status === 'published' ? (
                              <Archive className="h-4 w-4" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </button>

                          {/* Edit button */}
                          <Link
                            href={`/admin/edit/${art.id}`}
                            className="p-1.5 rounded-lg border border-white/5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-accent-cyan transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteClick(art.id)}
                            className="p-1.5 rounded-lg border border-red-500/20 bg-slate-900 hover:bg-red-950/30 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
            {/* Page Size Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-white/5 bg-slate-950 text-xs text-slate-300 focus:outline-none focus:border-accent-cyan transition-all"
              >
                <option value={10}>10 bài / trang</option>
                <option value={20}>20 bài / trang</option>
                <option value={50}>50 bài / trang</option>
              </select>
              <span className="text-xs text-slate-500">
                (Tổng {totalCount} bài viết)
              </span>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-white/5 rounded-xl disabled:opacity-30 disabled:hover:text-slate-300 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Trước
              </button>
              
              <span className="text-xs font-semibold text-slate-300">
                Trang {currentPage} / {Math.max(1, Math.ceil(totalCount / pageSize))}
              </span>

              <button
                type="button"
                disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / pageSize)))}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 border border-white/5 rounded-xl disabled:opacity-30 disabled:hover:text-slate-300 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog for deleting articles */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Xóa bài viết"
        message="Bạn có chắc muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        confirmText="Xóa bài viết"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setArticleToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}
