'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Article, Category, Tag } from '@/types/database';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import TiptapEditor from '@/components/TiptapEditor';
import { useToast } from '@/components/Toast';
import { 
  Save, Eye, Edit3, ArrowLeft, Loader2, 
  HelpCircle, Globe, Settings, Image as ImageIcon 
} from 'lucide-react';

interface ArticleFormProps {
  articleId?: string; // If provided, we are in EDIT mode
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '') // Loại bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-'); // Tránh lặp lại dấu gạch ngang
}

export default function ArticleForm({ articleId }: ArticleFormProps) {
  const router = useRouter();
  const isEditMode = !!articleId;
  const toast = useToast();

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('Ban Biên Tập');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // UI/Control states
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Load categories and article details (if edit mode)
  useEffect(() => {
    async function loadFormSetup() {
      try {
        // Load categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (catData && catData.length > 0) {
          setCategories(catData);
        } else {
          // Fallback categories mock
          setCategories([
            { id: '1', name: 'AI', slug: 'ai', description: '', created_at: '' },
            { id: '2', name: 'PC', slug: 'pc', description: '', created_at: '' },
            { id: '3', name: 'Windows', slug: 'windows', description: '', created_at: '' },
            { id: '4', name: 'Gaming', slug: 'gaming', description: '', created_at: '' },
            { id: '5', name: 'Hardware', slug: 'hardware', description: '', created_at: '' },
            { id: '6', name: 'Hướng dẫn', slug: 'huong-dan', description: '', created_at: '' },
            { id: '7', name: 'Review', slug: 'review', description: '', created_at: '' },
          ]);
          setIsUsingMock(true);
        }

        if (isEditMode && articleId) {
          // Lấy dữ liệu bài viết
          const { data: artData, error: artError } = await supabase
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .single();

          if (artError) throw artError;

          if (artData) {
            setTitle(artData.title);
            setSlug(artData.slug);
            setSummary(artData.summary || '');
            setContent(artData.content);
            setImageUrl(artData.image_url || '');
            setAuthorName(artData.author_name);
            setCategoryId(artData.category_id || '');
            setStatus(artData.status);
            setIsFeatured(artData.is_featured);
            setSourceName(artData.source_name || '');
            setSourceUrl(artData.source_url || '');
            setMetaTitle(artData.meta_title || '');
            setMetaDescription(artData.meta_description || '');

            // Load tags
            const { data: tagRelations } = await supabase
              .from('article_tags')
              .select('tag:tags(*)')
              .eq('article_id', articleId);
            
            if (tagRelations) {
              const tagNames = tagRelations.map((tr: any) => tr.tag?.name).filter(Boolean);
              setTagsInput(tagNames.join(', '));
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu form:', err);
        if (isEditMode) {
          toast.error('Không thể tải bài viết từ cơ sở dữ liệu. Có thể do kết nối Supabase chưa được cấu hình.');
          router.push('/admin');
        }
      } finally {
        setFetching(false);
      }
    }

    loadFormSetup();
  }, [articleId, isEditMode]);

  // Tự động tạo slug khi thay đổi title (chỉ tự động tạo nếu người dùng chưa sửa thủ công nhiều)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(generateSlug(val));
    // Auto fill meta title
    setMetaTitle(val);
  };

  const handleSlugBlur = () => {
    setSlug(generateSlug(slug));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Tiêu đề không được để trống.');
      return;
    }
    if (!slug.trim()) {
      toast.warning('Slug không được để trống.');
      return;
    }
    if (!content.trim()) {
      toast.warning('Nội dung bài viết không được để trống.');
      return;
    }

    setLoading(true);

    const articleData = {
      title,
      slug,
      summary: summary || null,
      content,
      image_url: imageUrl || null,
      author_name: authorName,
      category_id: categoryId || null,
      status,
      is_featured: isFeatured,
      source_name: sourceName || null,
      source_url: sourceUrl || null,
      meta_title: metaTitle || title,
      meta_description: metaDescription || summary || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    if (isUsingMock) {
      toast.info('Đang chạy ở chế độ Demo (không kết nối Supabase). Bài viết đã được giả lập lưu thành công!');
      setLoading(false);
      router.push('/admin');
      return;
    }

    try {
      let savedArticleId = articleId;

      if (isEditMode) {
        // Update bài viết
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);
        
        if (error) throw error;
      } else {
        // Insert bài viết mới
        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select('id')
          .single();
        
        if (error) throw error;
        savedArticleId = data.id;
      }

      // Xử lý TAGS (nếu có id bài viết thành công)
      if (savedArticleId) {
        const tagList = tagsInput
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0);

        // 1. Xóa liên kết cũ của bài viết này trong bảng article_tags
        await supabase
          .from('article_tags')
          .delete()
          .eq('article_id', savedArticleId);

        // 2. Chèn tags và liên kết mới
        for (const tagName of tagList) {
          const tagSlug = generateSlug(tagName);
          
          // Thử lấy tag hiện có hoặc chèn tag mới
          let { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', tagSlug)
            .maybeSingle();

          let tagId = existingTag?.id;

          if (!tagId) {
            const { data: newTag, error: tagInsertErr } = await supabase
              .from('tags')
              .insert({ name: tagName, slug: tagSlug })
              .select('id')
              .single();
            
            if (!tagInsertErr && newTag) {
              tagId = newTag.id;
            }
          }

          // Tạo liên kết article_tags
          if (tagId) {
            await supabase
              .from('article_tags')
              .insert({ article_id: savedArticleId, tag_id: tagId });
          }
        }
      }

      toast.success(isEditMode ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết thành công!');
      router.push('/admin');
    } catch (err: any) {
      toast.error('Lỗi khi lưu bài viết: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Đang tải dữ liệu bài viết...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Tab buttons */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'edit' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Soạn thảo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'preview' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="admin-container flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
            
            {/* Left side form fields (2 columns on desktop) */}
            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 bg-slate-950/20 border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Nội dung chính</h3>
                
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Nhập tiêu đề tin tức công nghệ mới..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Slug đường dẫn tĩnh <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    onBlur={handleSlugBlur}
                    placeholder="tieu-de-tin-tuc-tu-dong"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                  />
                </div>

                {/* Summary */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tóm tắt ngắn (Hiển thị ngoài trang chủ)</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn nội dung bài viết trong 1-2 câu..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all resize-none min-h-[90px]"
                  />
                </div>

                {/* Content Editor */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nội dung chi tiết (Rich Text Editor) <span className="text-red-500">*</span></label>
                    <span className="text-[10px] text-slate-500 font-medium">Mẹo: Sử dụng Toolbar để định dạng nhanh hoặc dán HTML</span>
                  </div>
                  <TiptapEditor value={content} onChange={setContent} />
                </div>
              </div>

              {/* References & Links */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 bg-slate-950/20 border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Nguồn tham khảo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tên nguồn (Ví dụ: TechCrunch)</label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="TechCrunch, The Verge..."
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Đường dẫn nguồn (URL)</label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://example.com/source-link"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side options / SEO settings (1 column on desktop) */}
            <div className="flex flex-col gap-6">
              {/* Publication options */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 bg-slate-950/20 border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Xuất bản</h3>
                
                {/* Category select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chuyên mục bài viết</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all cursor-pointer"
                  >
                    <option value="">Chọn chuyên mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tác giả</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                  />
                </div>

                {/* Status select */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Trạng thái xuất bản</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all cursor-pointer"
                  >
                    <option value="draft">Bản nháp (Draft)</option>
                    <option value="published">Công khai (Published)</option>
                  </select>
                </div>

                {/* Featured Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 border border-white/5 transition-all">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-primary border-white/10 bg-slate-900 h-5 w-5 focus:ring-accent-cyan"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">Tin nổi bật</span>
                    <span className="text-[10px] text-slate-500 block">Hiển thị ở khu vực tiêu điểm trang chủ</span>
                  </div>
                </label>
              </div>

              {/* Images & Tags */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 bg-slate-950/20 border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Đại diện & Thẻ</h3>
                
                {/* Cover Image URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-accent-cyan" />
                    <span>URL Ảnh đại diện (Cover Image)</span>
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                  />
                  {imageUrl && (
                    <div className="mt-2 aspect-video w-full rounded-lg overflow-hidden border border-white/5 bg-slate-900 shadow-md">
                      <img src={imageUrl} alt="Cover Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Tags input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Các thẻ bài viết (Tags - Cách nhau bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="AI, Nvidia, Windows 12..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                  />
                </div>
              </div>

              {/* SEO Configurations */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 bg-slate-950/20 border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-accent-purple" />
                  <span>Cấu hình SEO</span>
                </h3>
                
                {/* Meta title */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Meta Title (Tiêu đề SEO)</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Để trống sẽ mặc định lấy tiêu đề bài viết"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                  />
                </div>

                {/* Meta description */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Meta Description (Mô tả SEO)</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="Viết mô tả ngắn để hiển thị trên công cụ tìm kiếm Google..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/30 hover:bg-slate-950/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all resize-none min-h-[80px]"
                  />
                </div>
              </div>

              {/* Save actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-violet-600 to-secondary hover:from-primary hover:to-secondary py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Save className="h-4.5 w-4.5" />
                  )}
                  <span>Lưu bài viết</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Preview tab details */
        <div className="glass-panel p-6 md:p-10 rounded-3xl flex flex-col gap-6 bg-slate-950/20 border-white/10 max-w-4xl mx-auto">
          <div className="flex flex-col gap-4">
            {categoryId && (
              <span className="self-start inline-block rounded-full bg-slate-900 border border-accent-cyan/20 px-3.5 py-1 text-xs font-semibold text-accent-cyan">
                {categories.find(c => c.id === categoryId)?.name || 'Chuyên mục chưa chọn'}
              </span>
            )}
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
              {title || 'Chưa nhập tiêu đề bài viết'}
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-medium italic border-l-2 border-primary pl-4 py-1 leading-relaxed">
              {summary || 'Mô tả tóm tắt sẽ xuất hiện tại đây.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-y border-white/5 py-4 my-2">
              <span>Tác giả: <strong>{authorName}</strong></span>
              <span>•</span>
              <span>Trạng thái: <strong>{status === 'published' ? 'Đã công khai (Publish)' : 'Bản nháp (Draft)'}</strong></span>
              {isFeatured && (
                <>
                  <span>•</span>
                  <span className="text-accent-purple font-semibold">Tin nổi bật</span>
                </>
              )}
            </div>
          </div>

          {imageUrl && (
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900">
              <img src={imageUrl} alt="Cover Preview" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-slate-500 italic text-center py-10 bg-slate-900/10 rounded-xl border border-dashed border-white/5">Chưa nhập nội dung bài viết. Hãy quay lại Tab Soạn thảo và viết bài viết bằng Markdown!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
