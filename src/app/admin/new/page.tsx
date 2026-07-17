'use client';

import React from 'react';
import ArticleForm from '@/components/ArticleForm';

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-glow-purple">Viết bài mới</h1>
        <p className="text-sm text-slate-400">Tạo một bài viết công nghệ mới và cấu hình thuộc tính xuất bản, tags cùng SEO.</p>
      </div>
      
      <ArticleForm />
    </div>
  );
}
