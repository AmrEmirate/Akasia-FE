'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useKasirAuth } from '@/context/KasirAuthContext';

export default function HeaderAndSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { agent, activeShift, openShiftModal } = useKasirAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: '1. POS Kasir & Cetak Thermal', path: '/', icon: 'receipt_long' },
    { label: '2. Manifest Batch & Pickup', path: '/manifest-batch', icon: 'local_shipping' },
    { label: '3. Rekonsiliasi Komisi', path: '/rekonsiliasi-komisi', icon: 'payments' },
    { label: '4. Multi-Search & CS Gerai', path: '/multi-search-cs', icon: 'manage_search' },
  ];

  return (
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

            <Link href="/" className="flex items-center gap-2">
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
                  {agent?.branchName || 'Gerai POS Akasia'}
                </span>
                <span className="font-tabular text-[10px] px-1.5 py-0.2 rounded bg-[#e9efe9] text-[#131e17] font-semibold">
                  {agent?.agentId || 'AG-0418'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#286c00] animate-pulse"></span>
                <span className="text-[9px] font-bold text-[#286c00] tracking-tight uppercase">
                  ONLINE: TERMINAL KASIR AKTIF
                </span>
              </div>
            </div>
          </div>

          {/* Center Info: Shift & Drawer */}
          <div className="hidden xl:flex items-center gap-6 bg-[#e9efe9] px-4 py-1.5 rounded-xl border border-[#d0d9d1]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003316] text-[18px]">badge</span>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#414941] uppercase font-bold leading-none">
                  Kasir Bertugas
                </span>
                <span className="text-xs font-bold text-[#131e17]">
                  {activeShift ? `${activeShift.cashierName} (${activeShift.shiftCode})` : 'Belum Ada Shift'}
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

          {/* Right Action Switchers: Shift Button & Proship Link */}
          <div className="flex items-center gap-2 shrink-0">
            {activeShift ? (
              <button
                type="button"
                onClick={openShiftModal}
                className="flex items-center gap-1.5 bg-[#e9efe9] hover:bg-red-50 text-[#131e17] hover:text-[#e01a22] border border-[#d0d9d1] hover:border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                title="Tutup Shift & Rekonsiliasi Kas Laci"
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
                <span>Buka Shift Kasir</span>
              </button>
            )}

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 bg-[#003316] hover:bg-[#114b27] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>[F2] Transaksi Baru</span>
            </Link>

            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 bg-[#0f2d59] hover:bg-[#00183b] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-xs transition-colors"
              title="Buka Platform Proship Digital Shipping"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>Buka Proship Web</span>
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
          <span className="text-[10px] font-bold uppercase text-[#414941] px-2 tracking-wider">
            Navigasi Operasional Kasir
          </span>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#114b27] text-white shadow-xs'
                      : 'text-[#414941] hover:bg-[#e9efe9] hover:text-[#131e17]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Hardware Peripherals Status Modules */}
        <div className="flex flex-col gap-2">
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
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="lg:pl-64 flex-1 pt-16 flex flex-col">
        {children}
      </div>
    </div>
  );
}
