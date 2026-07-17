-- ==========================================
-- THIẾT LẬP BUCKET STORAGE & POLICY CHO HÌNH ẢNH BÀI VIẾT
-- Chạy đoạn mã này trong SQL Editor của Supabase
-- ==========================================

-- 1. Tạo bucket 'article-images' ở chế độ công khai (public: true)
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Xóa các policy cũ của bucket này nếu tồn tại để tránh xung đột trùng tên
DROP POLICY IF EXISTS "Public Select Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Policy" ON storage.objects;

-- 2. Cho phép mọi người đọc ảnh công khai (Public Read Access)
CREATE POLICY "Public Select Policy" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'article-images');

-- 3. Cho phép tải ảnh lên (Insert Access)
-- CHẾ ĐỘ 1: Cho phép tất cả mọi người tải ảnh lên (Tiện lợi để test nhanh không cần cấu hình đăng nhập phức tạp)
CREATE POLICY "Public Insert Policy" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'article-images');

-- CHẾ ĐỘ 2: Chỉ cho phép người dùng đã đăng nhập tải ảnh lên (Bảo mật cho production)
-- Để chuyển sang chế độ này, xóa policy trên và bỏ comment đoạn SQL bên dưới:
-- CREATE POLICY "Authenticated Insert Policy" 
-- ON storage.objects 
-- FOR INSERT 
-- TO authenticated
-- WITH CHECK (bucket_id = 'article-images');

-- 4. Cho phép cập nhật thông tin hình ảnh
CREATE POLICY "Public Update Policy"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'article-images');

-- 5. Cho phép xóa hình ảnh
CREATE POLICY "Public Delete Policy"
ON storage.objects
FOR DELETE
USING (bucket_id = 'article-images');
