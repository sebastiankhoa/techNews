'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu, X, Globe, User, Database } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin-sidebar-collapsed', String(nextState));
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div 
      className="min-h-screen bg-background text-foreground w-full relative"
      style={{ '--sidebar-width': isCollapsed ? '64px' : '256px' } as React.CSSProperties}
    >
      
      {/* 1. Desktop Fixed Sidebar */}
      <div className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <AdminSidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* 2. Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={toggleMobileSidebar}
          />
          {/* Drawer content container */}
          <div className="relative flex-1 max-w-xs w-full bg-slate-950 flex flex-col z-50">
            <div className="absolute top-2 right-2">
              <button
                onClick={toggleMobileSidebar}
                className="flex items-center justify-center h-10 w-10 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <AdminSidebar onCloseMobile={toggleMobileSidebar} isCollapsed={false} />
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container with left padding for fixed sidebar */}
      <div className="admin-workspace">
        
        {/* Sticky Admin Header / Topbar */}
        <header className="sticky top-0 z-40 w-full h-16 border-b border-white/5 bg-background/80 backdrop-blur-md">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left: Mobile hamburger menu toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Toggle Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <h2 className="text-sm font-bold text-white tracking-wide hidden sm:block">
                Hệ Thống Quản Trị TechNews
              </h2>
            </div>

            {/* Right: Quick actions and status info */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 border border-white/5 px-3 py-1.5 rounded-lg">
                <Database className="h-3.5 w-3.5 text-accent-cyan" />
                <span>DB: Connected</span>
              </div>
              
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Xem website</span>
              </Link>
              
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white border border-white/10">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Căn giữa nội dung chính và cấu hình max-width chuẩn của Admin */}
        <main className="admin-container flex-grow py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
