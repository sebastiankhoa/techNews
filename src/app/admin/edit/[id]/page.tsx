'use client';
export const runtime = 'edge';

import React from 'react';
import { useParams } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';

export default function EditArticlePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-glow-cyan">Chỉnh sửa bài viết</h1>
        <p className="text-sm text-slate-400">Cập nhật thông tin chi tiết, chỉnh sửa nội dung bài viết hoặc đổi trạng thái xuất bản.</p>
      </div>

      {id ? (
        <ArticleForm articleId={id} />
      ) : (
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
          Mã bài viết không hợp lệ hoặc đã bị lỗi khi truyền tải. Vui lòng quay lại bảng quản trị.
        </div>
      )}
    </div>
  );
}
