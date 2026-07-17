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
  Maximize2, Minimize2
} from 'lucide-react';

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Client-side HTML Sanitizer to prevent XSS and only allow safe tags
function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allowedTags = new Set([
    'p', 'br', 'hr', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'blockquote',
    'ul', 'ol', 'li', 'pre', 'code', 'img', 'a', 'iframe', 'span', 'div'
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

      // Copy only safe attributes
      if (tagName === 'a') {
        const href = element.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/'))) {
          cleanElement.setAttribute('href', href);
          cleanElement.setAttribute('target', '_blank');
          cleanElement.setAttribute('rel', 'noopener noreferrer');
        }
      } else if (tagName === 'img') {
        const src = element.getAttribute('src');
        if (src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:image/'))) {
          cleanElement.setAttribute('src', src);
        }
        const alt = element.getAttribute('alt');
        if (alt) cleanElement.setAttribute('alt', alt);
      } else if (tagName === 'iframe') {
        const src = element.getAttribute('src') || '';
        // Strict check to only allow YouTube embed urls
        if (
          src.startsWith('https://www.youtube.com/') ||
          src.startsWith('https://youtube.com/') ||
          src.startsWith('https://www.youtube-nocookie.com/')
        ) {
          cleanElement.setAttribute('src', src);
          cleanElement.setAttribute('frameborder', '0');
          cleanElement.setAttribute('allowfullscreen', 'true');
          cleanElement.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        } else {
          return null; // Drop unsafe iframe
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
  const [activeModal, setActiveModal] = useState<'link' | 'image-url' | 'youtube' | 'paste-html' | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
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
      onChange(editor.getHTML());
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

  // Handle HTML Paste ingestion
  const handlePasteHtml = () => {
    if (modalInput) {
      const sanitized = sanitizeHtml(modalInput);
      editor.commands.setContent(sanitized);
      onChange(sanitized);
    }
    closeModal();
  };

  // Handle Local image upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate if it is an image
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

      // Retrieve public URL from Supabase
      const { data } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      // Insert image inside editor
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

  const triggerModal = (type: 'link' | 'image-url' | 'youtube' | 'paste-html') => {
    if (type === 'link') {
      const prevUrl = editor.getAttributes('link').href || '';
      setModalInput(prevUrl);
    } else {
      setModalInput('');
    }
    setActiveModal(type);
  };

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
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Hoàn tác (Undo)"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
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
          className={`p-2 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Chữ đậm (Bold)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Chữ nghiêng (Italic)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('underline') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Gạch chân (Underline)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Tiêu đề H2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Tiêu đề H3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Danh sách gạch đầu dòng"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('orderedList') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Danh sách đánh số"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('blockquote') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Trích dẫn (Blockquote)"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('codeBlock') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Khối mã nguồn (Code Block)"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Media Inserts */}
        <button
          type="button"
          onClick={() => triggerModal('link')}
          className={`p-2 rounded-lg transition-all ${editor.isActive('link') ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          title="Chèn/Sửa liên kết"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => triggerModal('image-url')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Chèn ảnh từ URL ngoài"
        >
          <Image className="h-4 w-4" />
        </button>
        
        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all relative disabled:opacity-50"
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
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Nhúng video YouTube"
        >
          <Video className="h-4 w-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Custom Actions */}
        <button
          type="button"
          onClick={() => triggerModal('paste-html')}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 text-xs font-semibold"
          title="Dán nội dung HTML có sẵn"
        >
          <FileCode className="h-4 w-4" />
          <span className="hidden sm:inline">Dán HTML</span>
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
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all"
          title="Xóa định dạng"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Main Editor Content Container */}
      <div className={isFullscreen ? "flex-1 overflow-y-auto" : "flex-grow min-h-[500px] bg-slate-950/30 p-1"}>
        <div className={isFullscreen ? "mx-auto w-full max-w-5xl px-8 py-8" : "w-full"}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 3. Inline Theme Modals for User Input */}
      {activeModal && (
        <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeModal === 'link' && 'Cấu hình Liên kết tĩnh'}
                {activeModal === 'image-url' && 'Chèn ảnh bằng liên kết URL'}
                {activeModal === 'youtube' && 'Nhúng trình phát YouTube'}
                {activeModal === 'paste-html' && 'Dán mã nguồn HTML (An toàn)'}
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
            {activeModal === 'paste-html' ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dán HTML code tại đây</label>
                <textarea
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  rows={8}
                  placeholder="<p>Nhập mã HTML vào đây...</p>"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/50 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30 focus:border-accent-cyan font-mono resize-none"
                />
                <span className="text-[10px] text-slate-500 italic mt-1">Các đoạn mã nguy hiểm như &lt;script&gt; và các trình xử lý sự kiện onclick/onerror sẽ tự động bị loại bỏ để chống tấn công XSS.</span>
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
                  handlePasteHtml
                }
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-accent-cyan to-secondary rounded-xl hover:shadow-lg hover:shadow-accent-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Xác nhận</span>
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
