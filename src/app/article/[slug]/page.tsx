export const runtime = 'edge';

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/types/database';
import ArticleCard from '@/components/ArticleCard';
import ArticleReader from '@/components/ArticleReader';

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
    content: `
## Sự xuất hiện bất ngờ của GPT-5

OpenAI đã âm thầm cấp quyền truy cập phiên bản thử nghiệm siêu AI thế hệ mới cho một số đối tác chiến lược. Những ghi nhận đầu tiên cho thấy khả năng suy luận logic vượt bậc.

## Khả năng suy luận tư duy đa bước

Hệ thống được cho là có khả năng lập kế hoạch giải quyết các vấn đề phức tạp qua nhiều bước trung gian, tự kiểm tra lỗi và sửa đổi hành vi tương tự như cách con người tư duy.
    `,
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
  let prevArticle: Article | null = null;
  let nextArticle: Article | null = null;
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

      // 3. Fetch bài viết trước và sau
      const { data: prevData } = await supabase
        .from('articles')
        .select('*')
        .eq('category_id', artData.category_id)
        .eq('status', 'published')
        .lt('published_at', artData.published_at)
        .order('published_at', { ascending: false })
        .limit(1);
      
      if (prevData && prevData.length > 0) {
        prevArticle = prevData[0];
      }

      const { data: nextData } = await supabase
        .from('articles')
        .select('*')
        .eq('category_id', artData.category_id)
        .eq('status', 'published')
        .gt('published_at', artData.published_at)
        .order('published_at', { ascending: true })
        .limit(1);

      if (nextData && nextData.length > 0) {
        nextArticle = nextData[0];
      }
    }
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết bài viết, chuyển sang Mock data:', err);
    article = MOCK_ARTICLES.find((a) => a.slug === slug) || null;
    if (article) {
      isUsingMock = true;
      relatedArticles = MOCK_ARTICLES.filter((a) => a.id !== article!.id);
      
      // Fallback lân cận cho mock data
      const idx = MOCK_ARTICLES.findIndex(a => a.id === article!.id);
      prevArticle = idx > 0 ? MOCK_ARTICLES[idx - 1] : null;
      nextArticle = idx < MOCK_ARTICLES.length - 1 ? MOCK_ARTICLES[idx + 1] : null;
    }
  }

  if (!article) {
    notFound();
  }

  return (
    <article className="article-container py-8 flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
        <Link href="/" className="hover:text-accent-cyan transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        {article.category && (
          <>
            <Link
              href={`/category/${article.category.slug}`}
              className="hover:text-accent-cyan transition-colors"
            >
              {article.category.name}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-600" />
          </>
        )}
        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* Main Reader Wrapper */}
      <ArticleReader 
        article={article} 
        relatedArticles={relatedArticles} 
        prevArticle={prevArticle} 
        nextArticle={nextArticle} 
      />

      {/* Related Articles Section */}
      <section className="space-y-6 pt-12 border-t border-slate-200 dark:border-white/5">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-accent-cyan" />
          <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 dark:text-white">
            Bài viết liên quan
          </h2>
        </div>
        {relatedArticles.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Không có bài viết liên quan nào khác.</p>
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
