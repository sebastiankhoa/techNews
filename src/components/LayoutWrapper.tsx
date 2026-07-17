'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Không hiển thị Header và Footer của public ở trang admin
    return <>{children}</>;
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow w-full flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
