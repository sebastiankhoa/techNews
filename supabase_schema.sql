-- 1. Bảng Chuyên mục (categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bảng Bài viết (articles)
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL, -- Nội dung lưu dạng Markdown
    image_url TEXT, -- Đường dẫn hình ảnh đại diện
    author_name VARCHAR(100) NOT NULL DEFAULT 'Ban Biên Tập',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    views INT NOT NULL DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    source_name VARCHAR(150),
    source_url TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng Nhãn/Thẻ (tags)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Bảng liên kết Bài viết - Nhãn (article_tags)
CREATE TABLE IF NOT EXISTS article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Hỗ trợ tự động cập nhật updated_at cho articles
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_articles_modtime ON articles;
CREATE TRIGGER update_articles_modtime
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Thêm chỉ mục (Indexes) để tối ưu tìm kiếm và SEO
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Seed data: Thêm các chuyên mục mặc định theo yêu cầu
INSERT INTO categories (name, slug, description) VALUES
('AI', 'ai', 'Tin tức, nghiên cứu và ứng dụng trí tuệ nhân tạo mới nhất'),
('PC', 'pc', 'Thị trường máy tính cá nhân, linh kiện và thiết bị ngoại vi'),
('Windows', 'windows', 'Hệ điều hành Windows, các bản cập nhật, thủ thuật và ứng dụng'),
('Gaming', 'gaming', 'Thế giới game, phần cứng chơi game và văn hóa game thủ'),
('Hardware', 'hardware', 'Tin tức về CPU, GPU, RAM, ổ cứng và các công nghệ bán dẫn'),
('Hướng dẫn', 'huong-dan', 'Các bài viết hướng dẫn sử dụng phần mềm, cài đặt hệ thống và mẹo công nghệ'),
('Review', 'review', 'Đánh giá chi tiết, khách quan các sản phẩm công nghệ mới nhất')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;
