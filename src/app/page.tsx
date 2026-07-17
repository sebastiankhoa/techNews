export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/types/database';
import ArticleCard from '@/components/ArticleCard';
import { Cpu, Zap, LayoutGrid, Flame, RefreshCw } from 'lucide-react';

// Mock data to display if Supabase is not connected or returns empty
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'AI', slug: 'ai', description: 'Trí tuệ nhân tạo', created_at: '' },
  { id: '2', name: 'PC', slug: 'pc', description: 'Máy tính cá nhân', created_at: '' },
  { id: '3', name: 'Windows', slug: 'windows', description: 'Hệ điều hành Windows', created_at: '' },
  { id: '4', name: 'Gaming', slug: 'gaming', description: 'Trò chơi điện tử', created_at: '' },
  { id: '5', name: 'Hardware', slug: 'hardware', description: 'Phần cứng máy tính', created_at: '' },
  { id: '6', name: 'Hướng dẫn', slug: 'huong-dan', description: 'Thủ thuật & Hướng dẫn', created_at: '' },
  { id: '7', name: 'Review', slug: 'review', description: 'Đánh giá sản phẩm', created_at: '' },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'NVIDIA GeForce RTX 5090 Rò Rỉ Thông Số Khủng: Sức Mạnh Tột Đỉnh Cho Kỷ Nguyên AI',
    slug: 'nvidia-geforce-rtx-5090-ro-ri-thong-so-khung',
    summary: 'Thế hệ card đồ họa Blackwell tiếp theo của NVIDIA hứa hẹn sẽ mang lại bước nhảy vọt hiệu năng chưa từng có với bộ nhớ GDDR7 và kiến trúc 3nm tiên tiến.',
    content: 'Nội dung chi tiết về card đồ họa RTX 5090...',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=60',
    author_name: 'Minh Đức',
    category_id: '5',
    status: 'published',
    is_featured: true,
    views: 12450,
    meta_title: 'NVIDIA RTX 5090 Rò Rỉ Thông Số Khủng',
    meta_description: 'RTX 5090 Blackwell rò rỉ thông số với GDDR7 và tiến trình 3nm.',
    source_name: 'Wccftech',
    source_url: 'https://wccftech.com',
    published_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[4],
  },
  {
    id: 'a2',
    title: 'Trải Nghiệm GPT-5 Beta: Trí Tuệ Nhân Tạo Đạt Ngưỡng Tư Duy Như Con Người?',
    slug: 'trai-nghiem-gpt-5-beta-tri-tue-nhan-tao-dat-nguong-tu-duy',
    summary: 'OpenAI đã âm thầm cấp quyền truy cập phiên bản thử nghiệm siêu AI thế hệ mới cho một số đối tác chiến lược. Những ghi nhận đầu tiên cho thấy khả năng suy luận logic vượt bậc.',
    content: 'Nội dung chi tiết về siêu AI GPT-5...',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60',
    author_name: 'Khánh Huyền',
    category_id: '1',
    status: 'published',
    is_featured: true,
    views: 9820,
    meta_title: 'Đánh giá trải nghiệm GPT-5 Beta mới nhất',
    meta_description: 'Những đánh giá thực tế đầu tiên về siêu AI GPT-5 của OpenAI.',
    source_name: 'TechCrunch',
    source_url: 'https://techcrunch.com',
    published_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[0],
  },
  {
    id: 'a3',
    title: 'Windows 12 Lộ Diện Bản Preview Đầu Tiên: Tập Trung Hoàn Toàn Vào AI Cục Bộ (Local AI)',
    slug: 'windows-12-lo-dien-ban-preview-dau-tien',
    summary: 'Microsoft đang định nghĩa lại hệ điều hành máy tính với Windows 12. Giao diện desktop hoàn toàn mới cùng nhân hệ điều hành tối ưu hóa cho chip NPU thế hệ mới.',
    content: 'Nội dung chi tiết về Windows 12...',
    image_url: 'https://images.unsplash.com/photo-1624647313214-e0c266a4bc20?w=800&auto=format&fit=crop&q=60',
    author_name: 'Hoàng Long',
    category_id: '3',
    status: 'published',
    is_featured: true,
    views: 7540,
    meta_title: 'Windows 12 Lộ Diện Bản Preview Đầu Tiên',
    meta_description: 'Windows 12 tập trung vào các tính năng AI chạy trực tiếp trên thiết bị.',
    source_name: 'Windows Central',
    source_url: 'https://windowscentral.com',
    published_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[2],
  },
  {
    id: 'a4',
    title: 'Đánh Giá Chi Tiết ASUS ROG Ally X: Máy Chơi Game Cầm Tay Tốt Nhất Hiện Tại',
    slug: 'danh-gia-chi-tiet-asus-rog-ally-x',
    summary: 'Không chỉ nâng cấp nhẹ, ASUS mang đến viên pin khủng gấp đôi, dung lượng RAM lớn hơn cùng hệ thống tản nhiệt được thiết kế lại tối ưu cho game thủ.',
    content: 'Nội dung đánh giá ASUS ROG Ally X...',
    image_url: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&auto=format&fit=crop&q=60',
    author_name: 'Quốc Bảo',
    category_id: '7',
    status: 'published',
    is_featured: false,
    views: 5200,
    meta_title: 'Đánh giá chi tiết ASUS ROG Ally X',
    meta_description: 'ASUS ROG Ally X cải tiến pin dung lượng gấp đôi và RAM 24GB.',
    source_name: 'Tech Review',
    source_url: '',
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[6],
  },
  {
    id: 'a5',
    title: 'Top 5 Cách Tối Ưu Hóa Windows 11 Để Chơi Game Mượt Mà Hơn 30% FPS',
    slug: 'top-5-cach-toi-uu-hoa-windows-11-de-choi-game',
    summary: 'Hướng dẫn chi tiết từng bước tắt các dịch vụ chạy ngầm không cần thiết, tối ưu hóa cài đặt đồ họa và tận dụng tính năng Game Mode trên Windows 11.',
    content: 'Nội dung hướng dẫn tối ưu Windows 11...',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
    author_name: 'Nguyễn Huy',
    category_id: '6',
    status: 'published',
    is_featured: false,
    views: 4320,
    meta_title: 'Tối ưu Windows 11 chơi game mượt mà',
    meta_description: 'Hướng dẫn cải thiện FPS chơi game trên Windows 11 cực dễ.',
    source_name: 'Gamer Guide',
    source_url: '',
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[5],
  },
  {
    id: 'a6',
    title: 'PlayStation 5 Pro Chính Thức Mở Bán: Công Nghệ PSSR Có Thực Sự Thần Thánh?',
    slug: 'playstation-5-pro-chinh-thuc-mo-ban-pssr',
    summary: 'Công nghệ nâng cấp hình ảnh bằng học máy (PlayStation Spectral Super Resolution) hứa hẹn mang lại đồ họa 4K sắc nét ở tốc độ khung hình 60fps mượt mà.',
    content: 'Nội dung chi tiết về PS5 Pro...',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=60',
    author_name: 'Minh Quân',
    category_id: '4',
    status: 'published',
    is_featured: false,
    views: 8900,
    meta_title: 'Đánh giá PS5 Pro và công nghệ PSSR',
    meta_description: 'Tìm hiểu sức mạnh của PlayStation 5 Pro và tính năng nâng cấp hình ảnh PSSR.',
    source_name: 'IGN',
    source_url: 'https://ign.com',
    published_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[3],
  }
];

export const revalidate = 60; // Revalidate page every 60 seconds

export default async function Home() {
  let articles: Article[] = [];
  let categories: Category[] = [];
  let isUsingMock = false;

  try {
    // 1. Fetch Categories
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (catError) throw catError;
    categories = catData || [];

    // 2. Fetch Articles with Categories
    const { data: artData, error: artError } = await supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (artError) throw artError;
    articles = artData || [];

    // Nếu không có dữ liệu, dùng mock data để hiển thị đẹp mắt
    if (articles.length === 0) {
      articles = MOCK_ARTICLES;
      categories = MOCK_CATEGORIES;
      isUsingMock = true;
    }
  } catch (err) {
    console.error('Không thể kết nối Supabase, đang hiển thị Mock Data:', err);
    articles = MOCK_ARTICLES;
    categories = MOCK_CATEGORIES;
    isUsingMock = true;
  }

  // Phân loại bài viết
  const featuredArticles = articles.filter(a => a.is_featured).slice(0, 3);
  const latestArticles = articles.slice(0, 6);

  // Chọn bài viết lớn tiêu điểm (hero)
  const heroArticle = featuredArticles[0] || articles[0];
  const secondaryFeatured = featuredArticles.slice(1, 3);

  return (
    <div className="public-container py-8 flex flex-col gap-12 sm:gap-16">
      {/* Cảnh báo cấu hình database */}
      {isUsingMock && (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" />
            <span>
              <strong>Chế độ Xem trước:</strong> Hiện tại website đang sử dụng dữ liệu mẫu (Mock Data). Vui lòng cấu hình Supabase trong file <code>.env.local</code> và chạy <code>supabase_schema.sql</code> để đồng bộ dữ liệu thật.
            </span>
          </div>
        </div>
      )}

      {/* 1. Hero Section - Tin Nổi Bật (Featured) */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Flame className="h-6 w-6 text-accent-purple" />
          <h2 className="text-2xl font-bold tracking-tight text-white text-glow-purple">
            Tin nổi bật
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Article (1 Large Card) */}
          {heroArticle && (
            <div className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 h-[450px] flex flex-col justify-end p-6 md:p-8">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={heroArticle.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'}
                  alt={heroArticle.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10"></div>
              </div>

              <div className="relative z-10 space-y-4 max-w-3xl">
                {heroArticle.category && (
                  <Link
                    href={`/category/${heroArticle.category.slug}`}
                    className="inline-block rounded-full bg-primary/20 px-3.5 py-1 text-xs font-semibold text-accent-purple border border-primary/30 hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    {heroArticle.category.name}
                  </Link>
                )}
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight group-hover:text-accent-cyan transition-colors">
                  <Link href={`/article/${heroArticle.slug}`}>
                    {heroArticle.title}
                  </Link>
                </h3>
                <p className="text-sm md:text-base text-slate-300 line-clamp-2">
                  {heroArticle.summary}
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span>Tác giả: <strong>{heroArticle.author_name}</strong></span>
                  <span>•</span>
                  <span>{new Date(heroArticle.published_at || '').toLocaleDateString('vi-VN')}</span>
                  <span>•</span>
                  <span>{heroArticle.views} lượt xem</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub Featured (2 Small Cards Stacked) */}
          <div className="grid grid-cols-1 gap-6">
            {secondaryFeatured.map((article) => (
              <div
                key={article.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 h-[213px] flex flex-col justify-end p-5"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={article.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>
                </div>

                <div className="relative z-10 space-y-2">
                  {article.category && (
                    <Link
                      href={`/category/${article.category.slug}`}
                      className="inline-block rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-semibold text-accent-cyan border border-accent-cyan/20"
                    >
                      {article.category.name}
                    </Link>
                  )}
                  <h4 className="text-base font-bold text-white leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2">
                    <Link href={`/article/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>{new Date(article.published_at || '').toLocaleDateString('vi-VN')}</span>
                    <span>•</span>
                    <span>{article.views} views</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Nếu chỉ có 1 bài nổi bật, hiển thị bài mới nhất thay thế */}
            {secondaryFeatured.length === 0 && articles.slice(1, 3).map((article) => (
              <div
                key={article.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 h-[213px] flex flex-col justify-end p-5"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={article.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>
                </div>

                <div className="relative z-10 space-y-2">
                  {article.category && (
                    <Link
                      href={`/category/${article.category.slug}`}
                      className="inline-block rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-semibold text-accent-cyan border border-accent-cyan/20"
                    >
                      {article.category.name}
                    </Link>
                  )}
                  <h4 className="text-base font-bold text-white leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2">
                    <Link href={`/article/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>{new Date(article.published_at || '').toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Categories Horizontal Bar */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <LayoutGrid className="h-6 w-6 text-accent-cyan" />
          <h2 className="text-xl font-bold tracking-tight text-white">
            Khám phá theo chuyên mục
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-4 py-2 rounded-xl glass-panel border-white/5 hover:border-accent-cyan/30 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all font-medium text-sm"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Latest News Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-amber-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Bài viết mới nhất
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* 4. Grouped Articles By Category */}
      <section className="space-y-12 border-t border-white/5 pt-12">
        <div className="flex items-center space-x-2">
          <Cpu className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Góc chuyên sâu
          </h2>
        </div>

        {/* Lọc hiển thị 3 chuyên mục lớn có bài viết */}
        {categories.slice(0, 3).map((category) => {
          const categoryArticles = articles
            .filter((a) => a.category_id === category.id || (isUsingMock && a.category?.slug === category.slug))
            .slice(0, 3);

          if (categoryArticles.length === 0) return null;

          return (
            <div key={category.id} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-lg font-bold text-accent-cyan flex items-center space-x-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></span>
                  <span>{category.name}</span>
                </h3>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-xs font-semibold text-slate-400 hover:text-accent-cyan transition-colors"
                >
                  Xem thêm tất cả &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categoryArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
