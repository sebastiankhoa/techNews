'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .single();
        setHasAdminAccess(!!adminUser);
      } else {
        setHasAdminAccess(false);
      }
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        setHasAdminAccess(!!adminUser);
      } else {
        setHasAdminAccess(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo / Brand Info */}
          <div className="space-y-4 xl:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Tech<span className="text-accent-cyan">News</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              Cập nhật những tin tức công nghệ mới nhất về Trí tuệ nhân tạo (AI), Linh kiện PC, Windows, Phần cứng, Gaming, Hướng dẫn và Đánh giá chi tiết.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Chuyên mục chính
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/category/ai" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Trí tuệ nhân tạo (AI)
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/pc" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Linh kiện PC
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/windows" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Hệ điều hành Windows
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/gaming" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Gaming & Giải trí
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Khác
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/category/hardware" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Hardware
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/huong-dan" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Hướng dẫn công nghệ
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/review" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Review & Đánh giá
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Về chúng tôi
              </h3>
              <ul className="mt-4 space-y-2">
                {hasAdminAccess && (
                  <li>
                    <Link href="/admin" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Hệ thống Quản trị viên
                    </Link>
                  </li>
                )}
                <li>
                  <span className="text-sm text-slate-400">
                    Email: contact@technews.local
                  </span>
                </li>
                <li>
                  <span className="text-sm text-slate-400">
                    Hotline: 1900-TECH-NEWS
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TechNews Portal. Bảo lưu mọi quyền.
          </p>
          <p className="mt-4 text-xs text-slate-600 md:mt-0">
            Thiết kế giao diện tối tân bởi Antigravity.
          </p>
        </div>
      </div>
    </footer>
  );
}
