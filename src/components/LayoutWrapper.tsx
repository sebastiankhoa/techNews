'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { ArrowUp } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.scrollY > 400) {
        setShowScroll(true);
      } else if (showScroll && window.scrollY <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdmin) {
    // Không hiển thị Header và Footer của public ở trang admin
    return <>{children}</>;
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-background relative">
      <Header />
      <main className="flex-grow w-full flex flex-col">{children}</main>
      <Footer />

      {/* Floating Back to Top Button */}
      {showScroll && (
        <button
          onClick={scrollTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-xl border border-white/10 bg-slate-950/80 text-accent-cyan hover:text-white shadow-2xl hover:border-accent-cyan/20 active:scale-[0.98] transition-all cursor-pointer animate-in fade-in duration-300"
          title="Cuộn lên đầu trang"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
