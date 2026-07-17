'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FileText, PlusCircle, Globe, LayoutDashboard, 
  Layers, Tag, Cpu, ShieldAlert, ChevronLeft, ChevronRight,
  LogOut, User, ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({ 
  onCloseMobile, 
  isCollapsed = false, 
  onToggle 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Lỗi khi đăng xuất: ' + error.message);
      } else {
        toast.success('Đăng xuất thành công!');
        router.push('/admin/login');
        router.refresh();
      }
    } catch (err: any) {
      toast.error('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLogoutLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  // Kiểm tra trạng thái kích hoạt của menu
  const isLinkActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const menuItems = [
    {
      name: 'Tổng quan',
      href: '/admin',
      icon: LayoutDashboard,
      active: isLinkActive('/admin') && !pathname.includes('/admin/new') && !pathname.includes('/admin/edit')
    },
    {
      name: 'Tạo bài viết mới',
      href: '/admin/new',
      icon: PlusCircle,
      active: isLinkActive('/admin/new')
    },
    {
      name: 'Chuyên mục',
      href: '/admin?tab=categories',
      icon: Layers,
      active: false,
      badge: 'Sắp có'
    },
    {
      name: 'Tags nhãn bài',
      href: '/admin?tab=tags',
      icon: Tag,
      active: false,
      badge: 'Sắp có'
    }
  ];

  return (
    <div className={`flex flex-col h-full bg-slate-950/70 border-r border-white/5 backdrop-blur-xl shrink-0 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Brand Header */}
      <div className={`flex h-16 items-center border-b border-white/5 bg-slate-950/30 transition-all duration-300 ${
        isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-6'
      }`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-md shadow-primary/20">
          <Cpu className="h-5 w-5 animate-pulse" />
        </div>
        {!isCollapsed && (
          <div className="transition-all duration-300">
            <span className="text-sm font-extrabold tracking-tight text-white block">
              Tech<span className="text-accent-cyan">News</span>
            </span>
            <span className="text-[10px] font-semibold text-accent-purple tracking-widest uppercase block -mt-0.5">
              Admin Panel
            </span>
          </div>
        )}
      </div>

      {/* Main menu navigation */}
      <div className={`flex-1 overflow-y-auto py-6 flex flex-col gap-6 transition-all duration-300 ${
        isCollapsed ? 'px-2' : 'px-4'
      }`}>
        {/* Section 1 */}
        <div className="flex flex-col gap-1.5">
          {isCollapsed ? (
            <div className="h-px bg-white/5 my-2 mx-2" />
          ) : (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block transition-all">
              Quản trị nội dung
            </span>
          )}
          
          {menuItems.map((item) => {
            const tooltipText = item.name + (item.badge ? ` (${item.badge})` : '');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center rounded-xl text-sm font-medium transition-all group border relative ${
                  isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'justify-between px-3.5 py-2.5'
                } ${
                  item.active
                    ? 'bg-primary/10 border-primary/20 text-accent-purple shadow-sm'
                    : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                    item.active ? 'text-accent-purple' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  {!isCollapsed && <span className="transition-all">{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="text-[9px] bg-slate-900 border border-white/5 text-slate-500 px-1.5 py-0.5 rounded font-semibold uppercase">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                    {tooltipText}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Section 2 */}
        <div className="flex flex-col gap-1.5 border-t border-white/5 pt-6">
          {isCollapsed ? (
            <div className="h-px bg-white/5 my-2 mx-2" />
          ) : (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block transition-all">
              Hệ thống
            </span>
          )}
          
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white border border-transparent transition-all group relative ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3.5 py-2.5'
            }`}
          >
            <Globe className="h-4 w-4 text-slate-500 group-hover:text-slate-300 group-hover:scale-105 transition-all shrink-0" />
            {!isCollapsed && <span className="transition-all">Xem website ngoài</span>}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                Xem website ngoài
              </div>
            )}
          </Link>
        </div>

        {/* Collapse Button (Desktop Only) */}
        {onToggle && (
          <div className="flex flex-col gap-1.5 border-t border-white/5 pt-6 mt-auto">
            <button
              onClick={onToggle}
              className={`flex items-center rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white border border-transparent transition-all group relative cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3.5 py-2.5'
              }`}
            >
              {isCollapsed ? (
                <>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-all shrink-0" />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                    Mở rộng Menu
                  </div>
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-all shrink-0" />
                  <span className="transition-all">Thu gọn Menu</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className={`p-4 border-t border-white/5 bg-slate-950/20 transition-all duration-300 ${
        isCollapsed ? 'flex flex-col items-center gap-3' : 'flex flex-col gap-3'
      }`}>
        {email ? (
          <div className={`flex ${isCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between gap-2'} w-full`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0">
                <User className="h-3.5 w-3.5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin</span>
                  <span className="text-[11px] text-slate-300 font-medium truncate max-w-[130px]" title={email}>
                    {email}
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`flex items-center justify-center rounded-lg border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-500/20 transition-all shrink-0 cursor-pointer ${
                isCollapsed ? 'h-8 w-8' : 'px-2.5 py-1.5 text-xs font-semibold'
              }`}
              title="Đăng xuất"
            >
              <LogOut className="h-3.5 w-3.5" />
              {!isCollapsed && <span className="ml-1.5">Đăng xuất</span>}
            </button>
          </div>
        ) : (
          isCollapsed ? (
            <div className="relative group/auth flex items-center justify-center h-10 w-10 rounded-xl bg-red-950/10 border border-red-500/10 text-red-400 cursor-help transition-all">
              <ShieldAlert className="h-4 w-4 shrink-0 animate-pulse" />
              <div className="absolute left-full bottom-2 ml-3 px-2.5 py-1.5 bg-slate-900 border border-white/10 text-red-400 text-xs rounded-lg opacity-0 pointer-events-none group-hover/auth:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl z-50">
                Chưa bật xác thực (Auth)
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-950/10 border border-red-500/10 text-[10px] text-red-400 transition-all">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 animate-pulse" />
              <span className="font-medium transition-all">Chưa bật xác thực (Auth)</span>
            </div>
          )
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị TechNews?"
        confirmText="Đăng xuất"
        cancelText="Hủy bỏ"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isLoading={logoutLoading}
      />
    </div>
  );
}
