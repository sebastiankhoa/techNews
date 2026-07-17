'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Cpu, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for error parameters from middleware
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      toast.error('Tài khoản của bạn không có quyền quản trị hoặc chưa được phân quyền!');
    }
  }, [searchParams, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Vui lòng điền đầy đủ email và mật khẩu!');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        toast.error(error.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin!');
        setLoading(false);
        return;
      }

      // Check if user exists in admin_users
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (adminError || !adminUser) {
        // Log out immediately if not admin
        await supabase.auth.signOut();
        toast.error('Đăng nhập thất bại: Tài khoản này không được cấp quyền quản trị!');
        setLoading(false);
        return;
      }

      toast.success('Đăng nhập thành công! Đang chuyển hướng...');
      
      // Redirect to next path or /admin
      const nextPath = searchParams.get('next') || '/admin';
      router.push(nextPath);
      router.refresh();
    } catch (err: any) {
      toast.error('Có lỗi xảy ra: ' + (err.message || 'Lỗi hệ thống'));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 border border-white/10 shadow-2xl flex flex-col gap-6 bg-slate-950/80">
      
      {/* Glow Effects */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />

      {/* Header / Brand */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20">
          <Cpu className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tech<span className="text-accent-cyan">News</span> Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Đăng nhập hệ thống quản trị nội dung TechNews Portal
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@technews.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all disabled:opacity-50"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-white/10 bg-slate-900/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all disabled:opacity-50"
              required
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-primary/10 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <span>Đăng nhập</span>
          )}
        </button>

      </form>

      {/* Footer Info */}
      <div className="text-center">
        <p className="text-[10px] text-slate-600">
          Chỉ dành cho Quản trị viên của TechNews Portal.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16] relative overflow-hidden">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <Suspense fallback={
        <div className="w-full max-w-md p-8 rounded-2xl glass-panel border border-white/10 bg-slate-950/80 flex flex-col items-center justify-center gap-4 min-h-[350px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-slate-400">Đang tải trang đăng nhập...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
