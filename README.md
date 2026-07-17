# TechNews - Website Tin Tức Công Nghệ Tối Tân

Website tin tức công nghệ hiện đại, đẹp mắt và tối ưu SEO được xây dựng bằng **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, và **Supabase**.

---

## ⚡ Các Tính Năng Nổi Bật

1. **Giao diện hiện đại & Premium**: Giao diện tối màu Obsidian cực kỳ bắt mắt với hiệu ứng kính mờ (glassmorphism), viền phát sáng, các dải gradient neon (tím/cyan) mang phong cách công nghệ tương lai. Responsive hoàn hảo trên di động, máy tính bảng và máy tính.
2. **Trang chủ đầy đủ phân khu**:
   - **Tin nổi bật (Featured)**: Lưới bất đối xứng làm nổi bật bài viết lớn tiêu điểm và các tin phụ.
   - **Tin mới nhất (Latest)**: Cập nhật liên tục những tin tức mới.
   - **Chuyên mục**: Phân chia rõ ràng (AI, PC, Windows, Gaming, Hardware, Hướng dẫn, Review).
3. **Chi tiết bài viết chuẩn SEO**:
   - URL thân thiện dạng `/article/[slug]`.
   - Sinh động đầy đủ thông tin: Ảnh bìa, Tác giả, Ngày đăng, Chuyên mục, Thẻ (Tags), Nguồn tham khảo.
   - Trình render nội dung bài viết hỗ trợ định dạng **Markdown** chuyên nghiệp.
   - Đề xuất thông minh 3 bài viết liên quan ở cuối trang.
4. **Phân hệ quản trị độc lập tại `/admin`**:
   - Bảng điều khiển quản lý bài viết: Tìm kiếm nhanh, lọc theo chuyên mục và trạng thái.
   - Các hành động nhanh: Chuyển đổi trạng thái nháp/xuất bản nhanh bằng 1 click, Xóa bài viết.
   - Biểu mẫu viết bài mới và sửa đổi bài viết với chức năng tự động sinh slug tiếng Việt không dấu chuẩn SEO.
   - **Live Markdown Preview**: Tab xem trước giao diện bài viết thực tế trước khi xuất bản.
5. **Cơ chế dự phòng dữ liệu thông minh**: Tự động chuyển sang dữ liệu giả lập (Mock Data) chất lượng cao nếu chưa cấu hình biến môi trường kết nối database, giúp chạy thử nghiệm offline ngay lập tức mà không bị crash.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
news_tech/
├── supabase_schema.sql        # File chứa SQL Schema khởi tạo bảng cho Supabase
├── .env.local                 # Biến môi trường cấu hình kết nối Supabase
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout chính (nhúng Header, Footer, Dark mode mặc định)
│   │   ├── page.tsx           # Trang chủ tin tức công nghệ
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Danh sách bài viết theo chuyên mục (AI, PC, v.v.)
│   │   ├── article/
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Trang đọc chi tiết bài viết (SEO Metadata động)
│   │   └── admin/
│   │       ├── layout.tsx     # Layout của khu vực quản trị
│   │       ├── page.tsx       # Bảng danh sách bài viết & bộ lọc quản lý
│   │       ├── new/
│   │       │   └── page.tsx   # Trang tạo bài viết mới
│   │       └── edit/
│   │           └── [id]/
│   │               └── page.tsx # Trang chỉnh sửa bài viết đã có
│   ├── components/
│   │   ├── Header.tsx         # Thanh điều hướng người dùng ngoài responsive
│   │   ├── Footer.tsx         # Chân trang tin tức chứa liên kết SEO nội bộ
│   │   ├── ArticleCard.tsx    # Card hiển thị bài viết thu nhỏ có hover zoom
│   │   ├── AdminSidebar.tsx   # Menu điều hướng dành riêng cho Admin panel
│   │   └── MarkdownRenderer.tsx # Component chuyển đổi Markdown sang HTML đẹp mắt
│   ├── lib/
│   │   └── supabase.ts        # Client kết nối Supabase (chống crash build tĩnh)
│   └── types/
│       └── database.ts        # Định nghĩa các Interface TypeScript (Article, Category, Tag...)
```

---

## 🛠️ Hướng Dẫn Thiết Lập & Khởi Chạy Dự Án

### Bước 1: Khởi tạo Cơ sở dữ liệu Supabase
1. Truy cập vào [Supabase Dashboard](https://supabase.com) và tạo một Project mới.
2. Vào tab **SQL Editor** trong bảng quản lý của dự án Supabase.
3. Mở file [supabase_schema.sql](file:///d:/Antigravity_project/news_tech/supabase_schema.sql) ở thư mục gốc của project này, copy toàn bộ nội dung SQL và paste vào bảng SQL Editor của Supabase.
4. Nhấn **Run** để khởi tạo các bảng: `categories`, `articles`, `tags`, `article_tags` cùng các index hỗ trợ SEO và chuyên mục mặc định.

### Bước 2: Cấu hình biến môi trường
1. Nhân bản hoặc đổi tên file `.env.example` thành `.env.local` tại thư mục gốc:
   ```bash
   cp .env.example .env.local
   ```
2. Điền thông tin kết nối từ Supabase của bạn:
   - `NEXT_PUBLIC_SUPABASE_URL`: Đường dẫn URL của project Supabase (lấy từ *Settings > API*).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Mã Anon public key của project Supabase (lấy từ *Settings > API*).

### Bước 3: Cài đặt và Khởi chạy local
1. Cài đặt các thư viện phụ thuộc (nếu chưa cài đặt):
   ```bash
   npm install
   ```
2. Chạy ứng dụng ở chế độ phát triển (Development mode):
   ```bash
   npm run dev
   ```
3. Mở trình duyệt truy cập:
   - **Frontend công cộng**: [http://localhost:3000](http://localhost:3000)
   - **Trang quản trị (Admin)**: [http://localhost:3000/admin](http://localhost:3000/admin)

### Bước 4: Biên dịch ứng dụng cho Production
1. Kiểm tra linter và biên dịch tối ưu hóa:
   ```bash
   npm run build
   ```
2. Chạy ứng dụng đã biên dịch:
   ```bash
   npm start
   ```

---

## 🚀 Hướng Dẫn Phát Triển Thêm (Mở Rộng Đăng Nhập)

Để mở rộng hệ thống đăng nhập cho Admin Panel sau này:
1. Bạn có thể sử dụng `@supabase/ssr` và Next.js Middleware.
2. Tạo file `src/middleware.ts` kiểm tra trạng thái session đăng nhập của Supabase cho tất cả các request có tiền tố `/admin/*`.
3. Tạo trang đăng nhập tại `/login` và tích hợp các hàm xác thực của Supabase Auth như `supabase.auth.signInWithPassword()`.
