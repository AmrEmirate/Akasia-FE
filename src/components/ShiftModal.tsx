'use client';

import React, { useState } from 'react';
import { useKasirAuth } from '@/context/KasirAuthContext';

export default function ShiftModal() {
  const { isShiftModalOpen, closeShiftModal, activeShift, openShift, closeShift, agent } = useKasirAuth();

  // Open Shift Form State
  const [cashierName, setCashierName] = useState('');
  const [shiftType, setShiftType] = useState('MORNING');
  const [startingCash, setStartingCash] = useState('500000');
  const [pin, setPin] = useState('');

  // Close Shift Form State
  const [actualCash, setActualCash] = useState(
    activeShift?.currentCash ? String(activeShift.currentCash) : '500000'
  );
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isShiftModalOpen) return null;

  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cashierName.trim()) {
      setError('Nama kasir wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await openShift(cashierName.trim(), shiftType, Number(startingCash) || 0);
    } catch (err: any) {
      setError(err.message || 'Gagal membuka shift kasir');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      await closeShift(Number(actualCash) || 0, notes.trim() || undefined);
    } catch (err: any) {
      setError(err.message || 'Gagal menutup shift kasir');
    } finally {
      setLoading(false);
    }
  };

  const sysCash = activeShift?.currentCash || 0;
  const countCash = Number(actualCash) || 0;
  const cashDiff = countCash - sysCash;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d0d9d1] relative overflow-hidden text-[#131e17]">
        {/* Accent glow background */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#114b27]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003316] text-[#a5f87a] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">
                {activeShift ? 'point_of_sale' : 'lock_open'}
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[#003316]">
                {activeShift ? 'Tutup Shift & Rekonsiliasi Kas' : 'Buka Shift Kasir Baru'}
              </h3>
              <p className="text-[11px] text-[#414941]">
                {agent?.branchName || 'Gerai POS ID Express'} • {agent?.agentId || 'AG-0418'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeShiftModal}
            className="p-1.5 rounded-lg text-[#6c756e] hover:text-[#131e17] hover:bg-[#e9efe9] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* OPEN SHIFT FORM */}
        {!activeShift ? (
          <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#003316] uppercase mb-1">
                Pilih / Ketik Nama Kasir Bertugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#d0d9d1] rounded-xl focus:ring-2 focus:ring-[#114b27] outline-none text-[#131e17]"
              />
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-[#414941]">Pilihan Cepat:</span>
                {['Budi S.', 'Siti R.', 'Ahmad K.'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCashierName(name)}
                    className="text-[11px] font-semibold bg-[#e9efe9] hover:bg-[#d0d9d1] px-2 py-0.5 rounded text-[#003316]"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#003316] uppercase mb-1">
                  Waktu Shift
                </label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d0d9d1] rounded-xl focus:ring-2 focus:ring-[#114b27] outline-none bg-white text-[#131e17]"
                >
                  <option value="MORNING">Shift Pagi</option>
                  <option value="EVENING">Shift Sore</option>
                  <option value="FULLDAY">Shift Penuh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#003316] uppercase mb-1">
                  Modal Kas Awal (Rp)
                </label>
                <input
                  type="number"
                  required
                  step="10000"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-[#d0d9d1] rounded-xl focus:ring-2 focus:ring-[#114b27] outline-none text-[#131e17]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#003316] uppercase mb-1">
                PIN Kasir (4 Digit)
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-[#d0d9d1] rounded-xl focus:ring-2 focus:ring-[#114b27] outline-none text-[#131e17]"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={closeShiftModal}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-[#414941] hover:bg-[#e9efe9] transition-colors border border-[#d0d9d1]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#114b27] hover:bg-[#003316] text-white shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Membuka...' : 'Buka Shift Kasir'}
              </button>
            </div>
          </form>
        ) : (
          /* CLOSE SHIFT FORM */
          <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
            <div className="bg-[#e9efe9] p-3 rounded-xl border border-[#d0d9d1] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#414941]">Kode Shift Aktif:</span>
                <span className="font-mono font-bold text-[#003316]">{activeShift.shiftCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#414941]">Kasir Bertugas:</span>
                <span className="font-bold text-[#131e17]">{activeShift.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#414941]">Modal Kas Awal:</span>
                <span className="font-mono font-semibold">
                  Rp {activeShift.startingCash.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#d0d9d1]">
                <span className="font-bold text-[#003316]">Uang Sistem Tercatat:</span>
                <span className="font-mono font-bold text-sm text-[#003316]">
                  Rp {sysCash.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#003316] uppercase mb-1">
                Hitungan Uang Fisik Kas di Laci (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="1000"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-[#d0d9d1] rounded-xl focus:ring-2 focus:ring-[#114b27] outline-none text-[#131e17]"
              />
              <div className="flex items-center justify-between text-xs mt-1 font-mono">
                <span className="text-[#414941]">Selisih Kas Fisik vs Sistem:</span>
                <span
                  className={`font-bold ${
                    cashDiff === 0
                      ? 'text-[#286c00]'
                      : cashDiff > 0
                      ? 'text-[#0284c7]'
                      : 'text-[#e01a22]'
                  }`}
                >
                  {cashDiff === 0
                    ? '✓ PAS (Rp 0)'
                    : `${cashDiff > 0 ? '+ Lebih' : '- Kurang'} Rp ${Math.abs(cashDiff).toLocaleString(
                        'id-ID'
                      )}`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#003316] uppercase mb-1">
                Catatan Penutupan Shift (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Selisih uang koin kembalian 2.000"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#d0d9d1] rounded-xl focus:ring-2 focus:ring-[#114b27] outline-none text-[#131e17]"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={closeShiftModal}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-[#414941] hover:bg-[#e9efe9] transition-colors border border-[#d0d9d1]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#e01a22] hover:bg-[#b01219] text-white shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Menutup...' : 'Tutup Shift Kasir'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
