import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, Eye, Link2, ChevronRight, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/types/database';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ArticleCard from '@/components/ArticleCard';

interface Props {
  params: Promise<{ slug: string }>;
}

// Mock articles for fallback
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'AI', slug: 'ai', description: 'Trí tuệ nhân tạo', created_at: '' },
  { id: '2', name: 'PC', slug: 'pc', description: 'Máy tính cá nhân', created_at: '' },
  { id: '3', name: 'Windows', slug: 'windows', description: 'Hệ điều hành', created_at: '' },
  { id: '4', name: 'Gaming', slug: 'gaming', description: 'Trò chơi điện tử', created_at: '' },
  { id: '5', name: 'Hardware', slug: 'hardware', description: 'Phần cứng', created_at: '' },
  { id: '6', name: 'Hướng dẫn', slug: 'huong-dan', description: 'Thủ thuật', created_at: '' },
  { id: '7', name: 'Review', slug: 'review', description: 'Đánh giá', created_at: '' },
];

const MOCK_ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'NVIDIA GeForce RTX 5090 Rò Rỉ Thông Số Khủng: Sức Mạnh Tột Đỉnh Cho Kỷ Nguyên AI',
    slug: 'nvidia-geforce-rtx-5090-ro-ri-thong-so-khung',
    summary: 'Thế hệ card đồ họa Blackwell tiếp theo của NVIDIA hứa hẹn sẽ mang lại bước nhảy vọt hiệu năng chưa từng có với bộ nhớ GDDR7 và kiến trúc 3nm tiên tiến.',
    content: `
# Thế hệ card đồ họa Blackwell tiếp theo của NVIDIA

Sau nhiều tháng đồn đoán, các thông số kỹ thuật đầu tiên về thế hệ card đồ họa Blackwell hàng đầu của NVIDIA - GeForce RTX 5090 - đã bắt đầu rò rỉ từ các nguồn tin chuỗi cung ứng uy tín. Trọng tâm của đợt nâng cấp này không chỉ nằm ở khả năng chơi game thuần túy mà là khả năng xử lý các mô hình ngôn ngữ lớn và tác vụ trí tuệ nhân tạo cục bộ (Local AI).

## Kiến trúc Blackwell 3nm và Bộ nhớ GDDR7

Theo thông tin rò rỉ, GeForce RTX 5090 sẽ được xây dựng trên tiến trình TSMC 3nm tùy chỉnh cho NVIDIA, giúp tối ưu hóa mật độ bóng bán dẫn và tiết kiệm điện năng đáng kể. 

Điểm nổi bật nhất chính là việc trang bị bộ nhớ thế hệ mới **GDDR7** với dung lượng lên đến **28GB** hoặc thậm chí **32GB**, chạy trên giao diện bus bộ nhớ cực rộng lên tới **448-bit** hoặc **512-bit**. Băng thông bộ nhớ dự kiến sẽ vượt mốc **1.5 TB/s**, giúp giải quyết triệt để hiện tượng "nghẽn cổ chai" băng thông trên các dòng card đồ họa cao cấp hiện nay.

> "RTX 5090 không đơn thuần là một card đồ họa chơi game, đây là một cỗ máy siêu tính toán cá nhân cho kỷ nguyên AI sắp tới." - Báo cáo từ Wccftech nhận định.

### Bảng thông số rò rỉ so sánh với RTX 4090:

| Thông số | GeForce RTX 4090 | GeForce RTX 5090 (Rò rỉ) |
| --- | --- | --- |
| Kiến trúc | Ada Lovelace (TSMC 4N) | Blackwell (TSMC 3nm) |
| Số nhân CUDA | 16,384 | ~21,760 |
| Bộ nhớ | 24GB GDDR6X | 28GB / 32GB GDDR7 |
| Bus bộ nhớ | 384-bit | 448-bit / 512-bit |
| Băng thông | 1,008 GB/s | > 1,500 GB/s |
| Mức tiêu thụ điện | 450W | ~500W |

## Sức mạnh tính toán AI vượt bậc

Với việc bổ sung các nhân Tensor thế hệ thứ 5, RTX 5090 sẽ hỗ trợ tăng tốc phần cứng cho các mô hình AI trực tiếp trên máy tính cá nhân nhanh gấp 2 đến 3 lần thế hệ RTX 4090. Điều này cực kỳ quan trọng đối với các nhà phát triển phần mềm, nhà nghiên cứu AI và những người dùng muốn chạy các mô hình ngôn ngữ lớn (LLM) cục bộ mà không cần phụ thuộc vào dịch vụ đám mây trả phí.

Đối với game thủ, công nghệ **DLSS 4** tích hợp AI thế hệ mới được cho là sẽ có khả năng tái tạo toàn bộ khung hình thông qua mạng nơ-ron sâu, mang lại tốc độ khung hình vượt qua giới hạn của CPU.

*Bài viết sẽ liên tục cập nhật khi có thêm thông tin chính thức.*
    `,
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=60',
    author_name: 'Minh Đức',
    category_id: '5',
    status: 'published',
    is_featured: true,
    views: 12450,
    meta_title: 'NVIDIA RTX 5090 Rò Rỉ Thông Số Khủng | TechNews Portal',
    meta_description: 'RTX 5090 Blackwell rò rỉ thông số với GDDR7 và tiến trình 3nm, mang lại sức mạnh tính toán AI vượt trội.',
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
    content: 'Nội dung chi tiết về GPT-5...',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60',
    author_name: 'Khánh Huyền',
    category_id: '1',
    status: 'published',
    is_featured: true,
    views: 9820,
    meta_title: 'Trải nghiệm GPT-5 Beta mới nhất',
    meta_description: 'Đánh giá thực tế siêu AI GPT-5 của OpenAI.',
    source_name: 'TechCrunch',
    source_url: 'https://techcrunch.com',
    published_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: MOCK_CATEGORIES[0],
  }
];

// Sinh SEO Metadata động cho trang bài viết
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  let article: Article | null = null;
  try {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();
    article = data;
  } catch (e) {
    article = null;
  }

  // Fallback sang mock data
  if (!article) {
    article = MOCK_ARTICLES.find(a => a.slug === slug) || null;
  }

  if (!article) {
    return {
      title: 'Bài viết không tồn tại',
    };
  }

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.summary || undefined,
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.summary || undefined,
      images: article.image_url ? [article.image_url] : [],
      type: 'article',
      publishedTime: article.published_at || undefined,
      authors: [article.author_name],
    }
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  let article: Article | null = null;
  let relatedArticles: Article[] = [];
  let isUsingMock = false;

  try {
    // 1. Fetch chi tiết bài viết
    const { data: artData, error: artError } = await supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .single();

    if (artError || !artData) throw new Error('Article not found');
    article = artData;

    // Tăng lượt xem bài viết (views + 1) trong chế độ chạy thật
    try {
      await supabase
        .from('articles')
        .update({ views: (artData.views || 0) + 1 })
        .eq('id', artData.id);
    } catch (viewErr) {
      console.warn('Không thể cập nhật số lượt xem bài viết:', viewErr);
    }

    // 2. Fetch bài viết liên quan (cùng chuyên mục, loại bỏ bài viết hiện tại)
    if (artData.category_id) {
      const { data: relData } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .eq('category_id', artData.category_id)
        .eq('status', 'published')
        .neq('id', artData.id)
        .order('published_at', { ascending: false })
        .limit(3);
      
      relatedArticles = relData || [];
    }
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết bài viết, chuyển sang Mock data:', err);
    article = MOCK_ARTICLES.find((a) => a.slug === slug) || null;
    if (article) {
      isUsingMock = true;
      relatedArticles = MOCK_ARTICLES.filter((a) => a.id !== article!.id);
    }
  }

  if (!article) {
    notFound();
  }

  // Format ngày
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
    <article className="article-container py-8 flex flex-col gap-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Link href="/" className="hover:text-accent-cyan transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="h-3 w-3" />
        {article.category && (
          <>
            <Link
              href={`/category/${article.category.slug}`}
              className="hover:text-accent-cyan transition-colors"
            >
              {article.category.name}
            </Link>
            <ChevronRight className="h-3 w-3" />
          </>
        )}
        <span className="text-slate-400 truncate max-w-[200px] md:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* Header Info */}
      <div className="space-y-4">
        {article.category && (
          <Link
            href={`/category/${article.category.slug}`}
            className="inline-block rounded-full bg-slate-900 border border-accent-cyan/20 px-3.5 py-1 text-xs font-semibold text-accent-cyan hover:bg-accent-cyan hover:text-slate-950 transition-all duration-300"
          >
            {article.category.name}
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
          {article.title}
        </h1>
        <p className="text-base md:text-lg text-slate-300 font-medium italic border-l-2 border-primary pl-4 py-1 leading-relaxed">
          {article.summary}
        </p>

        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 border-y border-white/5 py-4 my-6">
          <span className="flex items-center space-x-1.5">
            <User className="h-4 w-4 text-primary" />
            <span>Được viết bởi: <strong>{article.author_name}</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Calendar className="h-4 w-4 text-secondary" />
            <span>Đăng ngày: {formatDate(article.published_at)}</span>
          </span>
          <span className="flex items-center space-x-1.5 md:ml-auto">
            <Eye className="h-4 w-4" />
            <span>{article.views + (isUsingMock ? 0 : 1)} lượt xem</span>
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
        <img src={coverImage} alt={article.title} className="h-full w-full object-cover" />
      </div>

      {/* Article Content */}
      <div className="glass-panel rounded-2xl p-6 md:p-10 shadow-xl border-white/5 bg-slate-900/10">
        <MarkdownRenderer content={article.content} />
      </div>

      {/* Reference Source Card */}
      {(article.source_name || article.source_url) && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/30 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Link2 className="h-4 w-4 text-accent-cyan" />
            <span>Nguồn tham khảo:</span>
            {article.source_url ? (
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:text-accent-cyan transition-colors underline decoration-dashed"
              >
                {article.source_name || 'Liên kết nguồn'}
              </a>
            ) : (
              <span className="font-bold text-white">{article.source_name}</span>
            )}
          </span>
        </div>
      )}

      {/* Related Articles Section */}
      <section className="space-y-6 pt-12 border-t border-white/5">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-accent-cyan" />
          <h2 className="text-xl font-bold tracking-tight text-white">
            Bài viết liên quan
          </h2>
        </div>
        {relatedArticles.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Không có bài viết liên quan nào khác.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((relArt) => (
              <ArticleCard key={relArt.id} article={relArt} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
