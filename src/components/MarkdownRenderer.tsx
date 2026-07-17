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
      // Nếu chứa các tag HTML cơ bản như <p>, <h2>, <ul>, <iframe>, <strong>, <div>...
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      
      if (isHtml) {
        setHtml(content);
      } else {
        try {
          const parsed = await marked.parse(content);
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
      className="prose max-w-none break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
