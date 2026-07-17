import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | TechNews Portal",
    default: "TechNews - Kênh Tin tức Công nghệ Tối tân",
  },
  description: "Cập nhật nhanh nhất tin tức Trí tuệ nhân tạo (AI), PC, Windows, Gaming, Hardware, Hướng dẫn và Đánh giá chi tiết các sản phẩm công nghệ.",
  keywords: ["tin tuc cong nghe", "ai", "linh kien pc", "windows 11", "gaming console", "hardware", "review san pham"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          .public-container {
            width: 100% !important;
            max-width: 1280px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          @media (min-width: 640px) {
            .public-container {
              padding-left: 1.5rem !important;
              padding-right: 1.5rem !important;
            }
          }
          @media (min-width: 1024px) {
            .public-container {
              padding-left: 2rem !important;
              padding-right: 2rem !important;
            }
          }
          .article-container {
            width: 100% !important;
            max-width: 896px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          @media (min-width: 640px) {
            .article-container {
              padding-left: 1.5rem !important;
              padding-right: 1.5rem !important;
            }
          }
          @media (min-width: 1024px) {
            .article-container {
              padding-left: 2rem !important;
              padding-right: 2rem !important;
            }
          }
          .admin-workspace {
            display: flex !important;
            flex-direction: column !important;
            min-height: 100vh !important;
            width: 100% !important;
          }
          @media (min-width: 1024px) {
            .admin-workspace {
              padding-left: 256px !important;
            }
          }
          .admin-container {
            width: 100% !important;
            max-width: 1280px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
        ` }} />
      </head>
      <body className="bg-background text-foreground min-h-screen w-full">
        <ToastProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}

