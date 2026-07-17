'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    loading: (message: string) => string;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast['type'], duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (type !== 'loading') {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: useCallback((msg: string, dur?: number) => addToast(msg, 'success', dur), [addToast]),
    error: useCallback((msg: string, dur?: number) => addToast(msg, 'error', dur), [addToast]),
    warning: useCallback((msg: string, dur?: number) => addToast(msg, 'warning', dur), [addToast]),
    info: useCallback((msg: string, dur?: number) => addToast(msg, 'info', dur), [addToast]),
    loading: useCallback((msg: string) => addToast(msg, 'loading'), [addToast]),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Notification Stack (Bottom Right Corner) */}
      <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-3 max-w-md w-[calc(100vw-48px)] sm:w-96 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start justify-between gap-3 p-4 rounded-2xl glass-panel shadow-2xl border-white/10 pointer-events-auto animate-in slide-in-from-bottom-5 slide-in-from-right-5 duration-300 bg-slate-950/90 text-sm`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="mt-0.5 shrink-0">
                {t.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                {t.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-400" />}
                {t.type === 'info' && <Info className="h-5 w-5 text-accent-cyan" />}
                {t.type === 'loading' && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
              </span>
              <p className="font-medium text-slate-200 leading-normal break-words">{t.message}</p>
            </div>
            
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-500 hover:text-white hover:bg-white/5 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
