'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useKasirAuth } from '@/context/KasirAuthContext';
import AuthGuard from '@/components/AuthGuard';

interface HeaderAndSidebarProps {
  children: React.ReactNode;
  requiredRole?: 'AKASIA_PUSAT' | 'SUB_AGENT';
}

export default function HeaderAndSidebar({ children, requiredRole }: HeaderAndSidebarProps) {
  const pathname = usePathname();
  const { user, agent, activeShift, openShiftModal, logout, isPusat } = useKasirAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-Specific Navigation Items
  const navItems = isPusat
    ? [
        {
          label: '1. Rekonsiliasi Sentral (25% ID Express)',
          path: '/rekonsiliasi-komisi',
          icon: 'payments',
          tag: 'PUSAT',
        },
        {
          label: '2. Monitoring Manifest Seluruh Gerai',
          path: '/manifest-batch',
          icon: 'local_shipping',
          tag: 'AUDIT',
        },
        {
          label: '3. Multi-Search & Audit CS Sentral',
          path: '/multi-search-cs',
          icon: 'manage_search',
          tag: 'CS',
        },
        {
          label: '4. Supervisi POS Kasir Gerai',
          path: '/',
          icon: 'receipt_long',
          tag: 'LOKET',
        },
      ]
    : [
        {
          label: '1. POS Kasir & Cetak Thermal',
          path: '/',
          icon: 'receipt_long',
          tag: 'LOKET',
        },
        {
          label: '2. Manifest Batch & Pickup',
          path: '/manifest-batch',
          icon: 'local_shipping',
          tag: 'BATCH',
        },
        {
          label: '3. Komisi Gerai Saya (20%)',
          path: '/rekonsiliasi-komisi',
          icon: 'payments',
          tag: 'KOMISI',
        },
        {
          label: '4. Multi-Search & CS Gerai',
          path: '/multi-search-cs',
          icon: 'manage_search',
          tag: 'CS',
        },
      ];

  return (
    <AuthGuard requiredRole={requiredRole}>
      <div className="min-h-screen bg-[#f4f6f4] flex flex-col text-[#131e17]">
        {/* FIXED TOP HEADER */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#d0d9d1] shadow-xs">
          <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
            {/* Brand & Sub-Agent Hub */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Hamburger on mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-[#131e17] hover:bg-[#e9efe9]"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>

              <Link href={isPusat ? '/rekonsiliasi-komisi' : '/'} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-alkasia.png"
                  alt="Logo Akasia"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 font-headline font-bold text-sm tracking-tight uppercase leading-none">
                    <span className="text-[#003316]">AKASIA</span>
                    <span className="text-[#e01a22]">LOGISTIK</span>
                  </div>
                  <span className="text-[9px] text-[#414941] font-bold tracking-widest uppercase mt-0.5">
                    ID Express Dedicated Partner POS
                  </span>
                </div>
              </Link>

              <div className="hidden sm:block h-7 w-px bg-[#d0d9d1] mx-1"></div>

              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-xs font-bold text-[#003316] uppercase">
                    {isPusat ? 'Kantor Pusat Akasia Logistik' : user?.branchName || agent?.branchName || 'Gerai Sub-Agent POS'}
                  </span>
                  {isPusat ? (
                    <span className="font-tabular text-[9px] px-2 py-0.5 rounded-full bg-[#1b2a47] text-[#93c5fd] font-bold tracking-wider uppercase">
                      SUPERADMIN PUSAT
                    </span>
                  ) : (
                    <span className="font-tabular text-[10px] px-1.5 py-0.2 rounded bg-[#dcf5ce] text-[#0b381b] font-bold">
                      {user?.agentId || agent?.agentId || 'AG-0418'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#286c00] animate-pulse"></span>
                  <span className="text-[9px] font-bold text-[#286c00] tracking-tight uppercase">
                    TEROTORISASI: {user?.username} ({isPusat ? 'PUSAT 25%' : 'GERAI 20%'})
                  </span>
                </div>
              </div>
            </div>

            {/* Center Info: Role-Tailored (Pusat vs Cashier Shift) */}
            {isPusat ? (
              <div className="hidden xl:flex items-center gap-4 bg-[#1b2a47]/10 px-4 py-1.5 rounded-xl border border-[#3b5998]/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1b2a47] text-[18px]">verified</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#1b2a47] uppercase font-bold leading-none">
                      Mode Supervisi Sentral
                    </span>
                    <span className="text-xs font-bold text-[#0b2914]">
                      Hak Klaim ID Express: 25% Gross Ongkir
                    </span>
                  </div>
                </div>
                <div className="h-6 w-px bg-[#d0d9d1]"></div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1b2a47]">
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  <span>Konsolidasi Multi-Gerai</span>
                </div>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-6 bg-[#e9efe9] px-4 py-1.5 rounded-xl border border-[#d0d9d1]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#003316] text-[18px]">badge</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#414941] uppercase font-bold leading-none">
                      Kasir Bertugas
                    </span>
                    <span className="text-xs font-bold text-[#131e17]">
                      {activeShift ? `${activeShift.cashierName} (${activeShift.shiftCode})` : (user?.fullName || 'Belum Buka Shift')}
                    </span>
                  </div>
                </div>

                <div className="h-6 w-px bg-[#d0d9d1]"></div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#432400] text-[18px]">
                    point_of_sale
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#414941] uppercase font-bold leading-none">
                      Laci Kas Shift
                    </span>
                    <span className="font-tabular text-xs font-bold text-[#0b381b]">
                      Rp {activeShift ? activeShift.currentCash.toLocaleString('id-ID') : '0'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Right Action Switchers: Shift Button, User Profile & Proship Link */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Only show Shift Actions for Sub-Agent Kasir */}
              {!isPusat && (
                <>
                  {activeShift ? (
                    <button
                      type="button"
                      onClick={openShiftModal}
                      className="flex items-center gap-1.5 bg-[#e9efe9] hover:bg-red-50 text-[#131e17] hover:text-[#e01a22] border border-[#d0d9d1] hover:border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      title="Tutup Shift & Rekonsiliasi Kas Laci Fisik"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                      <span>Tutup Shift [{activeShift.shiftCode}]</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openShiftModal}
                      className="flex items-center gap-1.5 bg-[#114b27] hover:bg-[#003316] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors animate-pulse"
                      title="Buka Shift Kasir Baru"
                    >
                      <span className="material-symbols-outlined text-[16px]">key</span>
                      <span>Buka Shift</span>
                    </button>
                  )}

                  <Link
                    href="/"
                    className="hidden sm:flex items-center gap-1.5 bg-[#003316] hover:bg-[#114b27] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_box</span>
                    <span>[F2] Loket</span>
                  </Link>
                </>
              )}

              {/* If Pusat, quick jump to Rekonsiliasi Sentral */}
              {isPusat && (
                <Link
                  href="/rekonsiliasi-komisi"
                  className="hidden sm:flex items-center gap-1.5 bg-[#1b2a47] hover:bg-[#253961] text-[#93c5fd] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  <span>Audit Sentral</span>
                </Link>
              )}

              {/* User Session & Logout Action */}
              <div className="flex items-center gap-1.5 bg-[#f4f6f4] border border-[#d0d9d1] pl-2.5 pr-1 py-1 rounded-lg">
                <div className="flex flex-col text-right leading-none">
                  <span className="text-[11px] font-bold text-[#131e17]">{user?.fullName}</span>
                  <span className="text-[9px] font-semibold text-[#414941]">
                    {isPusat ? 'AKASIA PUSAT (25%)' : 'GERAI MITRA (20%)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-md text-[#414941] hover:text-[#e01a22] hover:bg-red-50 transition-colors"
                  title="Keluar / Logout Akun"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>

              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1 bg-[#0f2d59] hover:bg-[#00183b] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                title="Buka Platform Proship Digital Shipping"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>Proship</span>
              </a>
            </div>
          </div>
        </header>

        {/* FIXED SIDEBAR (DESKTOP) & DRAWER (MOBILE) */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#d0d9d1] z-40 flex flex-col justify-between py-4 px-3 transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-[#414941] px-2 tracking-wider flex items-center justify-between">
              <span>{isPusat ? 'Navigasi Manajemen Pusat' : 'Navigasi Operasional Kasir'}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-tabular uppercase font-bold ${
                isPusat ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {isPusat ? 'PUSAT' : 'GERAI'}
              </span>
            </span>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#114b27] text-white shadow-xs'
                        : 'text-[#414941] hover:bg-[#e9efe9] hover:text-[#131e17]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Contextual Modules based on Role */}
          <div className="flex flex-col gap-2">
            {isPusat ? (
              <>
                {/* Central Contract SLA Module */}
                <div className="p-3 bg-[#1b2a47] text-white rounded-xl border border-[#3b5998] flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#93c5fd] uppercase tracking-wider">
                      ID Express Direct
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#93c5fd] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#93c5fd]"></span>25% KLAIM
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-blue-100 mt-0.5">
                    Kontrak Kerjasama Sentral Aktif
                  </div>
                  <div className="text-[10px] text-blue-300">
                    Bagi Hasil: 20% Gerai | 5% Sentral
                  </div>
                </div>

                {/* Developer System SLA Module */}
                <div className="p-3 bg-[#e9efe9] rounded-xl border border-[#d0d9d1] flex flex-col gap-1 text-xs">
                  <span className="text-[10px] font-bold text-[#414941] uppercase tracking-wider">
                    Sistem Operasi
                  </span>
                  <div className="flex items-center justify-between text-[#131e17] font-semibold text-[11px]">
                    <span>SLA Server API</span>
                    <span className="text-[#286c00] font-bold">99.98%</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Thermal Printer Status */}
                <div className="p-3 bg-[#e9efe9] rounded-xl border border-[#d0d9d1] flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#414941] uppercase tracking-wider">
                      Printer Thermal
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#286c00] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#286c00]"></span>READY
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#131e17] font-tabular text-[11px] font-semibold">
                    <span>Xprinter XP-420B</span>
                    <span>100x150mm</span>
                  </div>
                </div>

                {/* Digital Scale Hardware Module */}
                <div className="p-3 bg-[#0b2614] text-white rounded-xl border border-[#114b27] flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#b5f1bf] uppercase tracking-wider">
                      Timbangan Digital
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#a5f87a] font-bold font-tabular">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a5f87a]"></span>COM3 RS232
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-[11px] text-[#81bb8c]">Bobot Live</span>
                    <span className="font-headline text-2xl font-black text-[#a5f87a] tracking-tight">
                      02.45 kg
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT WRAPPER */}
        <div className="lg:pl-64 flex-1 pt-16 flex flex-col">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
