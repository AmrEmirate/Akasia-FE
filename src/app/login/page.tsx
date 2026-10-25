'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useKasirAuth } from '@/context/KasirAuthContext';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const { login, isAuthenticated, user, loading: authLoading } = useKasirAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect away from login page
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (redirectTarget && redirectTarget !== '/login') {
        router.replace(redirectTarget);
      } else if (user.role === 'AKASIA_PUSAT') {
        router.replace('/rekonsiliasi-komisi');
      } else {
        router.replace('/');
      }
    }
  }, [authLoading, isAuthenticated, user, redirectTarget, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Harap isi username dan password');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await login(username.trim(), password);
    setLoading(false);

    if (res.success) {
      if (redirectTarget && redirectTarget !== '/login') {
        router.push(redirectTarget);
        return;
      }
      const lowerUser = username.trim().toLowerCase();
      if (lowerUser.includes('pusat') || lowerUser.includes('admin')) {
        router.push('/rekonsiliasi-komisi');
      } else {
        router.push('/');
      }
    } else {
      setErrorMsg(res.message || 'Username atau password tidak sesuai');
    }
  };

  const handleQuickDemo = async (quickUsername: string, quickPass: string, targetPath: string) => {
    setUsername(quickUsername);
    setPassword(quickPass);
    setLoading(true);
    setErrorMsg(null);

    const res = await login(quickUsername, quickPass);
    setLoading(false);

    if (res.success) {
      if (redirectTarget && redirectTarget !== '/login') {
        router.push(redirectTarget);
      } else {
        router.push(targetPath);
      }
    } else {
      setErrorMsg(res.message || 'Login demo gagal');
    }
  };

  return (
    <div className="min-h-screen bg-radial from-[#042813] via-[#001f0c] to-[#010e06] text-[#eef6f0] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#286c00]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#e01a22]/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP HEADER BRANDING */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-alkasia.png"
            alt="Logo Akasia"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5 font-headline font-black text-lg tracking-tight uppercase leading-none">
              <span className="text-white">AKASIA</span>
              <span className="text-[#e01a22]">LOGISTIK</span>
            </div>
            <span className="text-[10px] text-[#81bb8c] font-bold tracking-widest uppercase block mt-0.5">
              Dedicated ID Express Partner POS Counter
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#0b381b]/80 border border-[#114b27] px-3 py-1.5 rounded-full text-[11px] font-bold text-[#a5f87a] shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[#a5f87a] animate-pulse"></span>
          <span>Sistem Otorisasi Multi-Tier Aktif</span>
        </div>
      </header>

      {/* MAIN LOGIN CARD */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-[#0b2914]/90 backdrop-blur-xl border border-[#1a552c] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Card Accent Top Line */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-[#286c00] via-[#a5f87a] to-[#e01a22] rounded-t-full"></div>

          <div className="text-center space-y-1.5 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#a5f87a] bg-[#114b27]/80 px-3 py-0.5 rounded-full border border-[#81bb8c]/30">
              Autentikasi Gerai POS &amp; Rekonsiliasi Sentral
            </span>
            <h1 className="font-headline font-black text-2xl text-white tracking-tight">
              Masuk ke Terminal
            </h1>
            <p className="text-xs text-[#a3c9ab]">
              Masuk dengan akun terotorisasi untuk mengakses loket kasir atau rekonsiliasi sentral.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-400">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dcf5ce] mb-1.5">
                Username / Email Akun
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#81bb8c] text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin_pusat atau kasir_kuningan"
                  className="w-full bg-[#051c0d] border border-[#1a552c] focus:border-[#a5f87a] text-white text-sm rounded-xl pl-10 pr-3 py-2.5 outline-none transition-colors placeholder:text-[#527e5c]"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dcf5ce] mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#81bb8c] text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full bg-[#051c0d] border border-[#1a552c] focus:border-[#a5f87a] text-white text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none transition-colors placeholder:text-[#527e5c]"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#81bb8c] hover:text-white"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#114b27] to-[#1c783e] hover:from-[#176233] hover:to-[#22924c] text-white font-headline font-bold text-sm py-3 rounded-xl shadow-lg border border-[#81bb8c]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Mengautentikasi...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>

          {/* QUICK DEMO LOGIN BUTTONS */}
          <div className="mt-6 pt-5 border-t border-[#1a552c]/80 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#81bb8c] block text-center">
              Pintas Cepat Akun Demo Terverifikasi (1-Klik Masuk)
            </span>

            {/* Pusat */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('admin_pusat', 'password123', '/rekonsiliasi-komisi')}
              className="w-full bg-[#1b2a47] hover:bg-[#253961] text-[#93c5fd] hover:text-white border border-[#3b5998]/40 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                <div className="text-left leading-tight">
                  <div className="font-headline font-bold">1. Akasia Sentral Pusat</div>
                  <div className="text-[10px] opacity-80">admin_pusat (Klaim 25% ID Express &amp; Konsolidasi Sentral)</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-tabular px-2 py-0.5 rounded bg-[#0f1d33] text-blue-300 font-bold">
                PUSAT
              </span>
            </button>

            {/* Sub-Agent Kuningan */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('kasir_kuningan', 'password123', '/')}
              className="w-full bg-[#0a381b] hover:bg-[#114e27] text-[#a5f87a] hover:text-white border border-[#286c00]/40 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <div className="text-left leading-tight">
                  <div className="font-headline font-bold">2. Sub-Agent Kuningan (AG-0418)</div>
                  <div className="text-[10px] opacity-80">kasir_kuningan (Loket Kasir &amp; Komisi 20% Gerai)</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-tabular px-2 py-0.5 rounded bg-[#04200f] text-emerald-300 font-bold">
                GERAI
              </span>
            </button>

            {/* Sub-Agent Sudirman */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('kasir_sudirman', 'password123', '/')}
              className="w-full bg-[#0a381b] hover:bg-[#114e27] text-[#a5f87a] hover:text-white border border-[#286c00]/40 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <div className="text-left leading-tight">
                  <div className="font-headline font-bold">3. Sub-Agent Sudirman (AG-0419)</div>
                  <div className="text-[10px] opacity-80">kasir_sudirman (Loket Kasir &amp; Komisi 20% Gerai)</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-tabular px-2 py-0.5 rounded bg-[#04200f] text-emerald-300 font-bold">
                GERAI
              </span>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="mt-4 pt-3 text-center border-t border-[#1a552c]/50">
            <span className="text-[10px] text-[#71987b] leading-tight block">
              🔒 <strong>Privasi Finansial Terjamin:</strong> Data klaim komisi 25% ID Express hanya dapat diakses oleh Akasia Pusat. Sub-agent hanya menerima hak bagi hasil 20%.
            </span>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-2 text-xs text-[#71987b]">
        <span>© 2026 PT Akasia Logistik Indonesia • Dedicated ID Express POS Counter</span>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#81bb8c]">Bantuan Teknis: 0811-9988-7700</span>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white underline text-[11px]"
          >
            Buka Proship Web
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#042813] flex items-center justify-center text-white text-xs">
          Memuat Antarmuka Login...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
