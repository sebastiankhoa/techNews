-- ==========================================================
-- TECHNEWS SUPABASE AUTH & ROW LEVEL SECURITY (RLS) MIGRATION
-- Chạy đoạn mã này trong SQL Editor của Supabase Dashboard.
-- ==========================================================

-- 1. TẠO BẢNG PHÂN QUYỀN ADMIN (public.admin_users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bật RLS cho admin_users để đảm bảo chỉ admin hoặc bản thân user mới xem được quyền của mình
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read own admin role" ON public.admin_users;
CREATE POLICY "Allow users to read own admin role"
ON public.admin_users
FOR SELECT
USING (auth.uid() = user_id);

-- 2. TẠO HÀM KIỂM TRA QUYỀN ADMIN (public.is_admin())
-- Sử dụng SECURITY DEFINER để hàm chạy với quyền của chủ sở hữu database (postgres),
-- giúp bỏ qua kiểm tra RLS lặp lại trên bảng admin_users, ngăn chặn lỗi đệ quy (infinite recursion).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

-- 3. CẤU HÌNH ROW LEVEL SECURITY CHO CÁC BẢNG DỮ LIỆU
-- Bật RLS cho các bảng articles, categories, tags, article_tags
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- Xóa toàn bộ policies cũ nếu tồn tại để tránh lỗi trùng lặp
DROP POLICY IF EXISTS "Allow public read for published articles" ON public.articles;
DROP POLICY IF EXISTS "Allow admin select for articles" ON public.articles;
DROP POLICY IF EXISTS "Allow admin insert for articles" ON public.articles;
DROP POLICY IF EXISTS "Allow admin update for articles" ON public.articles;
DROP POLICY IF EXISTS "Allow admin delete for articles" ON public.articles;

DROP POLICY IF EXISTS "Allow public read for categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin write for categories" ON public.categories;

DROP POLICY IF EXISTS "Allow public read for tags" ON public.tags;
DROP POLICY IF EXISTS "Allow admin write for tags" ON public.tags;

DROP POLICY IF EXISTS "Allow public read for article_tags" ON public.article_tags;
DROP POLICY IF EXISTS "Allow admin write for article_tags" ON public.article_tags;

-- A. Policies cho bảng 'articles' (Bài viết)
-- Khách chỉ được đọc bài viết đã xuất bản (status = 'published')
CREATE POLICY "Allow public read for published articles"
ON public.articles
FOR SELECT
USING (status = 'published');

-- Admin được đọc toàn bộ bài viết (bao gồm cả draft)
CREATE POLICY "Allow admin select for articles"
ON public.articles
FOR SELECT
USING (public.is_admin());

-- Admin được thêm bài viết mới
CREATE POLICY "Allow admin insert for articles"
ON public.articles
FOR INSERT
WITH CHECK (public.is_admin());

-- Admin được sửa bài viết
CREATE POLICY "Allow admin update for articles"
ON public.articles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin được xóa bài viết
CREATE POLICY "Allow admin delete for articles"
ON public.articles
FOR DELETE
USING (public.is_admin());


-- B. Policies cho bảng 'categories' (Chuyên mục)
-- Khách được đọc mọi chuyên mục phục vụ website công khai
CREATE POLICY "Allow public read for categories"
ON public.categories
FOR SELECT
USING (true);

-- Admin được quản lý toàn bộ chuyên mục
CREATE POLICY "Allow admin write for categories"
ON public.categories
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- C. Policies cho bảng 'tags' (Thẻ nhãn bài viết)
-- Khách được đọc mọi tag nhãn phục vụ website công khai
CREATE POLICY "Allow public read for tags"
ON public.tags
FOR SELECT
USING (true);

-- Admin được quản lý toàn bộ tag nhãn
CREATE POLICY "Allow admin write for tags"
ON public.tags
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- D. Policies cho bảng 'article_tags' (Mối quan hệ Bài viết - Nhãn)
-- Khách được đọc mối liên kết
CREATE POLICY "Allow public read for article_tags"
ON public.article_tags
FOR SELECT
USING (true);

-- Admin được quản lý mối liên kết
CREATE POLICY "Allow admin write for article_tags"
ON public.article_tags
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 4. CẤU HÌNH STORAGE POLICIES CHO BUCKET 'article-images'
-- Xóa toàn bộ các storage policies cũ trên bucket article-images
DROP POLICY IF EXISTS "Public Select Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Policy" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read for article images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin insert for article images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update for article images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete for article images" ON storage.objects;

-- A. Khách được phép xem/đọc ảnh công khai
CREATE POLICY "Allow public read for article images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'article-images');

-- B. Chỉ Admin đã đăng nhập được upload ảnh lên
CREATE POLICY "Allow admin insert for article images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images' AND public.is_admin());

-- C. Chỉ Admin đã đăng nhập được cập nhật thông tin ảnh
CREATE POLICY "Allow admin update for article images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images' AND public.is_admin())
WITH CHECK (bucket_id = 'article-images' AND public.is_admin());

-- D. Chỉ Admin đã đăng nhập được xóa ảnh
CREATE POLICY "Allow admin delete for article images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'article-images' AND public.is_admin());
