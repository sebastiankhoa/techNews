export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/types/database';
import ArticleCard, { getCategoryAccent, estimateReadingTime } from '@/components/ArticleCard';
import { Cpu, Zap, LayoutGrid, Flame, RefreshCw, BarChart2 } from 'lucide-react';

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
    is_featured: true,
    views: 5200,
    meta_title: 'Đánh giá chi tiết ASUS ROG Ally X',
    meta_description: 'ASUS ROG Ally X cải tiến pin dung lượng gấp đôi và RAM 24GB.',
    source_name: 'Tech Review',
    source_url: 'https://techreview.com',
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[6],
  },
  {
    id: 'a5',
    title: 'Intel Core Ultra 9 285K benchmark điểm số đơn nhân vượt trội hơn thế hệ trước',
    slug: 'intel-core-ultra-9-285k-benchmark-don-nhan-vuot-troi',
    summary: 'Điểm số đơn nhân rò rỉ của bộ vi xử lý máy tính để bàn Arrow Lake hàng đầu của Intel cho thấy một bước tiến lớn so với Core i9-14900K.',
    content: 'Chi tiết điểm số benchmark...',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=60',
    author_name: 'Minh Đức',
    category_id: '5',
    status: 'published',
    is_featured: false,
    views: 3120,
    meta_title: '',
    meta_description: '',
    source_name: '',
    source_url: '',
    published_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[4],
  },
  {
    id: 'a6',
    title: 'Cách thiết lập tự động hóa sao lưu Windows 11 bằng OneDrive và NAS cục bộ',
    slug: 'thiet-lap-sao-luu-windows-11-onedrive-nas',
    summary: 'Bài hướng dẫn từng bước giúp bảo vệ tuyệt đối dữ liệu của bạn bằng chiến lược sao lưu 3-2-1 tự động trên hệ điều hành Windows 11.',
    content: 'Chi tiết bài hướng dẫn backup...',
    image_url: 'https://images.unsplash.com/photo-1624647313214-e0c266a4bc20?w=800&auto=format&fit=crop&q=60',
    author_name: 'Hoàng Long',
    category_id: '6',
    status: 'published',
    is_featured: false,
    views: 2450,
    meta_title: '',
    meta_description: '',
    source_name: '',
    source_url: '',
    published_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[5],
  }
];

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

  // Phân loại & sắp xếp bài viết tránh trùng lặp
  // A. Tin nổi bật Bento Grid (cần đúng 4 bài viết)
  const initialFeatured = articles.filter(a => a.is_featured).slice(0, 4);
  let bentoArticles = [...initialFeatured];
  
  if (bentoArticles.length < 4) {
    const remaining = articles.filter(a => !bentoArticles.some(b => b.id === a.id));
    bentoArticles = [...bentoArticles, ...remaining.slice(0, 4 - bentoArticles.length)];
  }

  const heroArticle = bentoArticles[0];
  const sideArticles = bentoArticles.slice(1, 4);
  const bentoIds = new Set(bentoArticles.map(b => b.id));

  // B. Tin mới nhất (loại bỏ bài đã ở Bento Hero)
  const latestArticles = articles.filter(a => !bentoIds.has(a.id)).slice(0, 6);
  const latestIds = new Set(latestArticles.map(l => l.id));

  // C. Đọc nhiều nhất (từ toàn bộ bài viết)
  const mostReadArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Tập hợp các ID bài viết đã hiển thị phía trên để tránh lặp ở các góc chuyên mục
  const topDisplayedIds = new Set([...bentoIds, ...latestIds]);

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

      {/* 1. Hero Section - Tin Nổi Bật (Bento Grid) */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Flame className="h-6 w-6 text-accent-cyan" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Tin nổi bật
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Bento Card (Left) */}
          {heroArticle && (
            <div className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-950/20 h-[450px] flex flex-col justify-end p-6 md:p-8 hover:border-accent-cyan/20 transition-all duration-300">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                  src={heroArticle.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'}
                  alt={heroArticle.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover transition-transform duration-750 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
              </div>

              <div className="relative z-10 space-y-4 max-w-3xl">
                {heroArticle.category && (
                  <Link
                    href={`/category/${heroArticle.category.slug}`}
                    className={`inline-block rounded-full border px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${getCategoryAccent(heroArticle.category.slug).badge}`}
                  >
                    {heroArticle.category.name}
                  </Link>
                )}
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight group-hover:text-accent-cyan transition-colors">
                  <Link href={`/article/${heroArticle.slug}`}>
                    {heroArticle.title}
                  </Link>
                </h3>
                <p className="text-xs md:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {heroArticle.summary}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-500">
                  <span>Tác giả: <strong className="text-slate-400">{heroArticle.author_name}</strong></span>
                  <span>•</span>
                  <span>{new Date(heroArticle.published_at || '').toLocaleDateString('vi-VN')}</span>
                  <span>•</span>
                  <span>{estimateReadingTime(heroArticle.content)}</span>
                  <span>•</span>
                  <span className="text-accent-cyan">{heroArticle.views} lượt xem</span>
                </div>
              </div>
            </div>
          )}

          {/* Bento Column Stack (Right - 3 cards) */}
          <div className="flex flex-col gap-4 h-[450px]">
            {sideArticles.map((article) => {
              const accent = getCategoryAccent(article.category?.slug || '');
              return (
                <div
                  key={article.id}
                  className="flex flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 relative group h-[140px] items-center"
                >
                  <div className="relative h-20 w-28 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={article.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'}
                      alt={article.title}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {article.category && (
                      <Link
                        href={`/category/${article.category.slug}`}
                        className={`inline-block border self-start px-2 py-0.2 rounded-full text-[8px] font-extrabold uppercase tracking-widest mb-1.5 ${accent.badge}`}
                      >
                        {article.category.name}
                      </Link>
                    )}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-accent-cyan transition-colors leading-snug line-clamp-2">
                      <Link href={`/article/${article.slug}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {article.title}
                      </Link>
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold mt-1">
                      {new Date(article.published_at || '').toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Categories Horizontal Bar */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <LayoutGrid className="h-5 w-5 text-accent-cyan" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Khám phá chuyên mục
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => {
            const accent = getCategoryAccent(category.slug);
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-4 py-2 rounded-xl glass-panel border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 transition-all font-semibold text-xs uppercase tracking-wider border"
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Latest News & Most Read Sidebar Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Bài viết mới nhất
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Latest Articles List (Grid) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Right: Most Read Sidebar */}
          <div className="glass-panel bg-white dark:bg-slate-900 rounded-2xl p-6 border-slate-200 dark:border-slate-800 flex flex-col gap-6 sticky top-24">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <BarChart2 className="h-5 w-5 text-accent-cyan" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Đọc nhiều nhất</h3>
            </div>

            <div className="flex flex-col gap-5">
              {mostReadArticles.map((article, index) => {
                const accent = getCategoryAccent(article.category?.slug || '');
                return (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="flex items-start gap-4 group/item py-0.5"
                  >
                    <span className="text-3xl font-black text-slate-400 dark:text-slate-700/80 group-hover/item:text-accent-cyan transition-colors shrink-0 w-8 text-center leading-none">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest ${accent.text}`}>
                        {article.category?.name || 'Tin tức'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:text-accent-cyan transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-500 font-semibold">{article.views} lượt xem</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Grouped Articles By Category */}
      <section className="space-y-12 border-t border-slate-200 dark:border-slate-800 pt-12">
        <div className="flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Góc chuyên sâu
          </h2>
        </div>

        {/* Lọc hiển thị các chuyên mục lớn có bài viết */}
        {categories
          .filter((category) => {
            const categoryArticlesCount = articles.filter(
              (a) => a.category_id === category.id || (isUsingMock && a.category?.slug === category.slug)
            ).length;
            return categoryArticlesCount > 0;
          })
          .slice(0, 4) // Hiển thị tối đa 4 chuyên mục có bài viết
          .map((category) => {
            let categoryArticles = articles
              .filter((a) => a.category_id === category.id || (isUsingMock && a.category?.slug === category.slug))
              .filter((a) => !topDisplayedIds.has(a.id))
              .slice(0, 3);

            // Nếu lọc hết thì fallback lấy từ danh sách gốc để đảm bảo không bị trống
            if (categoryArticles.length === 0) {
              categoryArticles = articles
                .filter((a) => a.category_id === category.id || (isUsingMock && a.category?.slug === category.slug))
                .slice(0, 3);
            }

            if (categoryArticles.length === 0) return null;

            const accent = getCategoryAccent(category.slug);

          return (
            <div key={category.id} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <span className={`w-1 h-5 ${accent.bg} rounded-full`}></span>
                  <span>{category.name}</span>
                </h3>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-accent-cyan transition-colors"
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
