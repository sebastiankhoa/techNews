'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import YoutubeExtension from '@tiptap/extension-youtube';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus, Undo, Redo,
  Link, Image, Upload, Video, Trash2, FileCode, Check, X, Loader2,
  Maximize2, Minimize2, Eye, Copy, Sparkles, Code2
} from 'lucide-react';

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Format/indent HTML string cleanly for readability in code editor
function formatHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return html || '';
  try {
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    let xml = html.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    xml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w[^>]*[^\/]>$/)) {
        // Opening tag
        const isVoid = /^<(img|br|hr|input|meta|link|col|area|embed|source|track|wbr)/i.test(node);
        if (!isVoid) {
          indent = 1;
        }
      } else {
        indent = 0;
      }

      let padding = '';
      for (let i = 0; i < pad; i++) {
        padding += '  ';
      }

      formatted += padding + node + '\n';
      pad += indent;
    });
    return formatted.trim();
  } catch {
    return html;
  }
}

// Client-side HTML Sanitizer to prevent XSS while preserving safe attributes & structures
function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  if (!html || !html.trim()) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allowedTags = new Set([
    'p', 'br', 'hr', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
    'ul', 'ol', 'li', 'pre', 'code', 'img', 'a', 'iframe', 'span', 'div', 'table', 'thead', 'tbody',
    'tr', 'th', 'td', 'figure', 'figcaption'
  ]);

  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      if (!allowedTags.has(tagName)) {
        const textContent = element.textContent || '';
        return document.createTextNode(textContent);
      }

      const cleanElement = document.createElement(tagName);

      // Copy safe attributes
      if (element.hasAttribute('class')) {
        cleanElement.setAttribute('class', element.getAttribute('class') || '');
      }

      if (element.hasAttribute('style')) {
        const style = element.getAttribute('style') || '';
        if (!/expression|javascript:|url\(/i.test(style)) {
          cleanElement.setAttribute('style', style);
        }
      }

      if (element.hasAttribute('title')) {
        cleanElement.setAttribute('title', element.getAttribute('title') || '');
      }

      if (element.hasAttribute('id')) {
        cleanElement.setAttribute('id', element.getAttribute('id') || '');
      }

      if (tagName === 'a') {
        const href = element.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:'))) {
          cleanElement.setAttribute('href', href);
          if (element.hasAttribute('target')) {
            cleanElement.setAttribute('target', element.getAttribute('target') || '_blank');
          } else {
            cleanElement.setAttribute('target', '_blank');
          }
          cleanElement.setAttribute('rel', 'noopener noreferrer');
        }
      } else if (tagName === 'img') {
        const src = element.getAttribute('src');
        if (src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/') || src.startsWith('data:image/'))) {
          cleanElement.setAttribute('src', src);
        }
        if (element.hasAttribute('alt')) cleanElement.setAttribute('alt', element.getAttribute('alt') || '');
        if (element.hasAttribute('width')) cleanElement.setAttribute('width', element.getAttribute('width') || '');
        if (element.hasAttribute('height')) cleanElement.setAttribute('height', element.getAttribute('height') || '');
      } else if (tagName === 'iframe') {
        const src = element.getAttribute('src') || '';
        if (
          src.startsWith('https://www.youtube.com/') ||
          src.startsWith('https://youtube.com/') ||
          src.startsWith('https://www.youtube-nocookie.com/') ||
          src.startsWith('https://player.vimeo.com/')
        ) {
          cleanElement.setAttribute('src', src);
          cleanElement.setAttribute('frameborder', '0');
          cleanElement.setAttribute('allowfullscreen', 'true');
          cleanElement.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          if (element.hasAttribute('width')) cleanElement.setAttribute('width', element.getAttribute('width') || '100%');
          if (element.hasAttribute('height')) cleanElement.setAttribute('height', element.getAttribute('height') || '360');
        } else {
          return null;
        }
      }

      element.childNodes.forEach(child => {
        const cleanChild = cleanNode(child);
        if (cleanChild) {
          cleanElement.appendChild(cleanChild);
        }
      });

      return cleanElement;
    }

    return null;
  };

  const container = document.createElement('div');
  doc.body.childNodes.forEach(child => {
    const cleanChild = cleanNode(child);
    if (cleanChild) {
      container.appendChild(cleanChild);
    }
  });

  return container.innerHTML;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const toast = useToast();
  const [activeModal, setActiveModal] = useState<'link' | 'image-url' | 'youtube' | 'edit-html' | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  
  // HTML Code View State
  const [isCodeView, setIsCodeView] = useState(false);
  const [codeValue, setCodeValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);
    if (nextState) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('editor-fullscreen-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('editor-fullscreen-active');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        document.body.style.overflow = '';
        document.body.classList.remove('editor-fullscreen-active');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('editor-fullscreen-active');
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-cyan hover:underline cursor-pointer',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-xl mx-auto border border-white/5 my-6 shadow-lg shadow-black/20',
        },
      }),
      YoutubeExtension.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'aspect-video w-full rounded-2xl border border-white/5 my-6 shadow-lg shadow-black/20',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isCodeView) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px]',
      },
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[550px] w-full flex items-center justify-center border border-white/10 rounded-2xl bg-slate-950/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle URL link insertion
  const handleInsertLink = () => {
    if (modalInput) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: modalInput }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    closeModal();
  };

  // Handle outside image URL insertion
  const handleInsertImageUrl = () => {
    if (modalInput) {
      editor.chain().focus().setImage({ src: modalInput }).run();
    }
    closeModal();
  };

  // Handle Youtube URL insertion
  const handleInsertYoutube = () => {
    if (modalInput) {
      editor.chain().focus().setYoutubeVideo({ src: modalInput }).run();
    }
    closeModal();
  };

  // Handle HTML Modal Submission
  const handleApplyModalHtml = () => {
    if (modalInput !== undefined) {
      const sanitized = sanitizeHtml(modalInput);
      editor.commands.setContent(sanitized);
      onChange(sanitized);
      if (isCodeView) {
        setCodeValue(formatHtml(sanitized));
      }
      toast.success('Đã cập nhật mã HTML!');
    }
    closeModal();
  };

  // Toggle Code View Mode
  const toggleCodeView = () => {
    if (isCodeView) {
      // Switching from Code View back to Visual Editor
      const sanitized = sanitizeHtml(codeValue);
      editor.commands.setContent(sanitized);
      onChange(sanitized);
      setIsCodeView(false);
      toast.success('Đã chuyển sang giao diện soạn thảo trực quan');
    } else {
      // Switching from Visual Editor to Code View
      const currentHtml = editor.getHTML();
      setCodeValue(formatHtml(currentHtml));
      setIsCodeView(true);
      toast.info('Đã bật chế độ chỉnh sửa mã HTML');
    }
  };

  // Format Code in Code View
  const handleFormatCode = () => {
    const formatted = formatHtml(codeValue);
    setCodeValue(formatted);
    onChange(formatted);
    toast.success('Đã tự động định dạng mã HTML!');
  };

  // Copy Code to Clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeValue);
      toast.success('Đã sao chép mã HTML vào bộ nhớ tạm!');
    } catch {
      toast.error('Không thể sao chép mã!');
    }
  };

  // Handle Local image upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Vui lòng chỉ chọn tệp hình ảnh!');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${new Date().toISOString().slice(0, 7)}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(`Tải ảnh lên thất bại: ${err.message || err}. Hãy đảm bảo bucket 'article-images' đã được tạo trên Supabase Storage.`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalInput('');
  };

  const triggerModal = (type: 'link' | 'image-url' | 'youtube' | 'edit-html') => {
    if (type === 'link') {
      const prevUrl = editor.getAttributes('link').href || '';
      setModalInput(prevUrl);
    } else if (type === 'edit-html') {
      const currentHtml = isCodeView ? codeValue : editor.getHTML();
      setModalInput(formatHtml(currentHtml));
    } else {
      setModalInput('');
    }
    setActiveModal(type);
  };

  const lineCount = codeValue.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const editorLayout = (
    <div className={isFullscreen ? "fixed inset-0 z-[9999] bg-slate-950 flex flex-col w-screen h-screen" : "w-full border border-white/10 rounded-2xl bg-slate-950/20 overflow-hidden flex flex-col relative"}>
      
      {/* 1. Stickable Editor Toolbar */}
      <div className={`flex flex-wrap items-center gap-1 p-2 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md transition-colors duration-300 ${
        isFullscreen ? 'bg-slate-950/95' : 'bg-slate-950/50'
      }`}>
        
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={isCodeView || !editor.can().undo()}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Hoàn tác (Undo)"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={isCodeView || !editor.can().redo()}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Làm lại (Redo)"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('bold') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Chữ đậm (Bold)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('italic') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Chữ nghiêng (Italic)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('underline') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Gạch chân (Underline)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('heading', { level: 2 }) && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Tiêu đề H2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('heading', { level: 3 }) && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Tiêu đề H3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('bulletList') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Danh sách gạch đầu dòng"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('orderedList') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Danh sách đánh số"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('blockquote') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Trích dẫn (Blockquote)"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('codeBlock') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Khối mã nguồn (Code Block)"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Media Inserts */}
        <button
          type="button"
          onClick={() => triggerModal('link')}
          disabled={isCodeView}
          className={`p-2 rounded-lg transition-all disabled:opacity-30 ${editor.isActive('link') && !isCodeView ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Chèn/Sửa liên kết"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => triggerModal('image-url')}
          disabled={isCodeView}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
          title="Chèn ảnh từ URL ngoài"
        >
          <Image className="h-4 w-4" />
        </button>
        
        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isCodeView || isUploading}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all relative disabled:opacity-30"
          title="Tải ảnh từ máy tính lên"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />

        <button
          type="button"
          onClick={() => triggerModal('youtube')}
          disabled={isCodeView}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
          title="Nhúng video YouTube"
        >
          <Video className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* HTML Edit Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleCodeView}
          className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${
            isCodeView 
              ? 'bg-gradient-to-r from-accent-cyan to-secondary text-slate-950 font-bold shadow-md shadow-accent-cyan/20' 
              : 'text-slate-300 hover:text-white hover:bg-white/10 bg-white/5 border border-white/10'
          }`}
          title={isCodeView ? "Chuyển về giao diện soạn thảo trực quan" : "Chuyển sang chế độ chỉnh sửa mã HTML nguồn"}
        >
          {isCodeView ? <Eye className="h-4 w-4" /> : <FileCode className="h-4 w-4 text-accent-cyan" />}
          <span className="hidden sm:inline">{isCodeView ? 'Xem Trực Quan' : 'Sửa HTML'}</span>
        </button>

        {/* HTML Modal Dialog trigger for quick popup edit */}
        <button
          type="button"
          onClick={() => triggerModal('edit-html')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 text-xs font-medium"
          title="Mở cửa sổ chỉnh sửa / Dán HTML"
        >
          <Code2 className="h-4 w-4" />
          <span className="hidden md:inline">Cửa sổ HTML</span>
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`p-2 rounded-lg transition-all ml-auto ${
            isFullscreen 
              ? 'bg-primary text-white' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setConfirmClearOpen(true)}
          disabled={isCodeView}
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 disabled:opacity-30 transition-all"
          title="Xóa định dạng"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Main Editor Content Container */}
      <div className={isFullscreen ? "flex-1 overflow-y-auto flex flex-col" : "flex-grow min-h-[500px] bg-slate-950/30 p-1 flex flex-col"}>
        
        {isCodeView ? (
          /* HTML Code Editor View */
          <div className="flex-1 flex flex-col bg-slate-950 min-h-[500px]">
            {/* HTML Sub-bar Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
                <span className="text-white font-semibold">Chế độ chỉnh sửa mã nguồn HTML</span>
                <span className="text-slate-500">({lineCount} dòng | {codeValue.length} ký tự)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFormatCode}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 transition-all"
                  title="Tự động canh lề và thụt dòng mã HTML"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
                  <span>Định dạng HTML</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 transition-all"
                  title="Sao chép toàn bộ mã HTML"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Sao chép</span>
                </button>
                <button
                  type="button"
                  onClick={toggleCodeView}
                  className="px-3 py-1 rounded-lg bg-accent-cyan text-slate-950 font-bold flex items-center gap-1 hover:brightness-110 transition-all"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Áp dụng</span>
                </button>
              </div>
            </div>

            {/* Line numbers + Textarea Editor */}
            <div className="flex-1 flex font-mono text-sm relative overflow-hidden min-h-[450px]">
              {/* Line numbers column */}
              <div className="select-none py-4 px-3 text-right bg-slate-900/50 text-slate-600 border-r border-white/5 font-mono text-xs leading-relaxed min-w-[48px] overflow-hidden">
                {lineNumbers.map(n => (
                  <div key={n}>{n}</div>
                ))}
              </div>
              {/* Monospace Code Editor Textarea */}
              <textarea
                value={codeValue}
                onChange={(e) => {
                  setCodeValue(e.target.value);
                  onChange(e.target.value);
                }}
                placeholder="<p>Nhập mã HTML của bạn tại đây...</p>"
                className="flex-1 bg-transparent p-4 text-cyan-200 focus:outline-none font-mono text-sm leading-relaxed resize-none w-full border-none h-full selection:bg-accent-cyan/30"
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          /* Visual Rich Text Editor View */
          <div className={isFullscreen ? "mx-auto w-full max-w-5xl px-8 py-8 flex-1" : "w-full flex-1"}>
            <EditorContent editor={editor} />
          </div>
        )}

      </div>

      {/* 3. Inline Theme Modals for User Input */}
      {activeModal && (
        <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeModal === 'link' && 'Cấu hình Liên kết tĩnh'}
                {activeModal === 'image-url' && 'Chèn ảnh bằng liên kết URL'}
                {activeModal === 'youtube' && 'Nhúng trình phát YouTube'}
                {activeModal === 'edit-html' && (
                  <>
                    <FileCode className="h-4 w-4 text-accent-cyan" />
                    <span>Chỉnh sửa & Dán mã nguồn HTML</span>
                  </>
                )}
              </h4>
              <button 
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-white hover:bg-white/5 p-1 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Fields */}
            {activeModal === 'edit-html' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã nguồn HTML (Có thể xem và sửa trực tiếp)</label>
                  <button
                    type="button"
                    onClick={() => setModalInput(formatHtml(modalInput))}
                    className="text-xs text-accent-cyan hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Định dạng HTML</span>
                  </button>
                </div>
                <textarea
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  rows={12}
                  placeholder="<p>Nhập hoặc sửa mã HTML tại đây...</p>"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/80 text-sm text-cyan-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan font-mono resize-none leading-relaxed"
                  spellCheck={false}
                />
                <span className="text-[10px] text-slate-500 italic mt-1">Hệ thống hỗ trợ đầy đủ các thẻ HTML tiêu chuẩn (`&lt;p&gt;`, `&lt;h2&gt;`, `&lt;img&gt;`, `&lt;iframe&gt;`, `&lt;a&gt;`, `&lt;div&gt;`, `&lt;span&gt;`...). Các thẻ nguy hiểm chứa mã độc hại sẽ tự động được lọc an toàn.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {activeModal === 'link' && 'Đường dẫn liên kết (URL)'}
                  {activeModal === 'image-url' && 'Đường dẫn liên kết hình ảnh (URL)'}
                  {activeModal === 'youtube' && 'Đường dẫn video YouTube (URL)'}
                </label>
                <input
                  type="url"
                  required
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  placeholder={
                    activeModal === 'youtube' 
                      ? 'https://www.youtube.com/watch?v=...' 
                      : 'https://example.com/...'
                  }
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-4 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={
                  activeModal === 'link' ? handleInsertLink :
                  activeModal === 'image-url' ? handleInsertImageUrl :
                  activeModal === 'youtube' ? handleInsertYoutube :
                  handleApplyModalHtml
                }
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-accent-cyan to-secondary rounded-xl hover:shadow-lg hover:shadow-accent-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Xác nhận & Cập nhật</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Confirm Dialog for Clearing Formatting */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="Xóa định dạng"
        message="Bạn có chắc chắn muốn xóa toàn bộ định dạng văn bản hiện tại?"
        confirmText="Xóa định dạng"
        cancelText="Hủy"
        onConfirm={() => {
          editor.chain().focus().clearNodes().unsetAllMarks().run();
          setConfirmClearOpen(false);
          toast.success('Đã xóa toàn bộ định dạng văn bản!');
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />

    </div>
  );

  return editorLayout;
}

