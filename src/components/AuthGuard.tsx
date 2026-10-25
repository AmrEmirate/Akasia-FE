'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useKasirAuth } from '@/context/KasirAuthContext';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'AKASIA_PUSAT' | 'SUB_AGENT';
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useKasirAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [loading, isAuthenticated, router, pathname]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f4] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-[#d0d9d1] shadow-xl flex flex-col items-center max-w-sm w-full text-center space-y-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#003316] flex items-center justify-center text-[#a5f87a] shadow-md animate-pulse">
              <span className="material-symbols-outlined text-[32px]">lock</span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#16a34a] border-2 border-white flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
            </div>
          </div>
          <div>
            <h3 className="font-headline font-black text-[#003316] text-base uppercase tracking-tight">
              AKASIA LOGISTIK
            </h3>
            <p className="text-xs text-[#414941] mt-1 font-semibold">
              Memverifikasi Otorisasi Sesi &amp; Hak Akses...
            </p>
          </div>
          <div className="w-full bg-[#e9efe9] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#114b27] h-full w-2/3 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Redirecting)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f4f6f4] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-lg text-center max-w-sm w-full space-y-3">
          <span className="material-symbols-outlined text-red-500 text-[36px]">no_accounts</span>
          <h2 className="font-headline font-bold text-sm text-[#131e17]">
            Sesi Diperlukan
          </h2>
          <p className="text-xs text-[#414941]">
            Anda belum login. Mengalihkan Anda ke halaman login terminal...
          </p>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center gap-1.5 bg-[#114b27] hover:bg-[#003316] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Masuk Sekarang</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized Role State (403 Forbidden)
  if (requiredRole && user?.role !== requiredRole) {
    const isPusatReq = requiredRole === 'AKASIA_PUSAT';
    return (
      <div className="min-h-screen bg-[#f4f6f4] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-amber-300 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[36px]">shield_lock</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full">
              403 • Hak Akses Dibatasi
            </span>
            <h1 className="font-headline font-black text-xl text-[#131e17]">
              Akses Fitur Terkunci
            </h1>
            <p className="text-xs text-[#414941] leading-relaxed">
              Halaman ini dikhususkan untuk <strong>{isPusatReq ? 'Manajemen Akasia Pusat' : 'Kasir Sub-Agent'}</strong>.
              Akun Anda saat ini masuk sebagai <strong>{user?.fullName} ({user?.role})</strong>.
            </p>
          </div>

          <div className="p-3 bg-[#f4f6f4] rounded-xl text-left border border-[#d0d9d1] space-y-1 text-xs text-[#414941]">
            <div className="flex items-center justify-between">
              <span className="font-bold">Peran Anda:</span>
              <span className="font-tabular font-bold text-[#003316]">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold">Gerai Terikat:</span>
              <span className="font-tabular text-[#414941]">{user?.branchName || 'Kantor Pusat'}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href={user?.role === 'AKASIA_PUSAT' ? '/rekonsiliasi-komisi' : '/'}
              className="bg-[#114b27] hover:bg-[#003316] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Kembali ke Dashboard Saya</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Access
  return <>{children}</>;
}
