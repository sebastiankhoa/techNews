'use client';

import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const parseContent = async () => {
      if (!content) {
        setHtml('');
        return;
      }
      
      // Kiểm tra xem nội dung là HTML hay Markdown thuần
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      
      if (isHtml) {
        setHtml(content);
      } else {
        try {
          // Cấu hình renderer của marked để tự động tạo id cho thẻ h2 và h3
          const renderer = new marked.Renderer();
          renderer.heading = function({ text, depth }) {
            const cleanText = text.replace(/<[^>]*>/g, ''); // strip any html tags
            const id = cleanText
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            return `<h${depth} id="${id}">${text}</h${depth}>`;
          };

          const parsed = await marked.parse(content, { renderer });
          setHtml(parsed);
        } catch (err) {
          console.error('Failed to parse markdown:', err);
          setHtml(content);
        }
      }
    };
    parseContent();
  }, [content]);

  return (
    <div 
      className="prose max-w-none break-words text-slate-300 leading-relaxed text-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
