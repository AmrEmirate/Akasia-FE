'use client';

import { useState, useEffect } from 'react';
import HeaderAndSidebar from '@/components/HeaderAndSidebar';
import { akasiaApi } from '@/lib/api';
import { useKasirAuth } from '@/context/KasirAuthContext';

export default function MultiSearchCsPage() {
  const { user, isPusat } = useKasirAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Complaint Form Modal
  const [complaintModal, setComplaintModal] = useState(false);
  const [reporterName, setReporterName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [issueCategory, setIssueCategory] = useState('GENERAL_INQUIRY');
  const [notes, setNotes] = useState('');
  const [complaintSaved, setComplaintSaved] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await akasiaApi.lookupUniversal(q);
      if (res.success) setResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComplaint = async () => {
    try {
      const res = await akasiaApi.recordComplaint({
        reporterName,
        customerPhone,
        issueCategory,
        notes,
      });
      if (res.success) {
        setComplaintSaved(true);
        setTimeout(() => {
          setComplaintSaved(false);
          setComplaintModal(false);
          handleSearch(searchQuery);
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan catatan keluhan');
    }
  };

  return (
    <HeaderAndSidebar>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Universal Search Bar */}
        <div className="bg-white p-5 rounded-xl border border-[#d0d9d1] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-headline font-bold text-xs uppercase text-[#003316] tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">manage_search</span>
              Universal Multi-Search CS Gerai &amp; Pelacakan ID Express
            </span>
            <span className="text-[10px] font-tabular bg-[#e9efe9] text-[#414941] px-2 py-0.5 rounded font-bold">
              Multi-Entity Lookup
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8eaa93] text-[20px]">
                search
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-[#d0d9d1] rounded-lg text-xs font-tabular font-bold text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                placeholder="Cari Customer ID, No. HP (0812...), Nama, No. Resi ID Express (ID01...), atau Manifest ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch(searchQuery)}
              className="bg-[#114b27] hover:bg-[#003316] text-white px-6 py-2 rounded-lg text-xs font-headline font-bold uppercase tracking-wider transition-all shrink-0"
            >
              Cari Data
            </button>
            <button
              type="button"
              onClick={() => setComplaintModal(true)}
              className="bg-[#e9efe9] hover:bg-[#d0d9d1] text-[#003316] border border-[#8eaa93] px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Catat Komplain Walk-In</span>
            </button>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#414941] font-bold text-[11px]">Contoh Pencarian Cepat:</span>
          {['0812-8877-3321', 'CUS-88219', 'ID01928472910', 'MNF-JKT04', 'Hendra'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setSearchQuery(chip);
                handleSearch(chip);
              }}
              className="bg-white hover:bg-[#eaf7ec] text-[#003316] border border-[#d0d9d1] px-2.5 py-1 rounded text-[11px] font-tabular transition-colors shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {!results && !loading ? (
          <div className="bg-white rounded-xl border border-[#d0d9d1] p-10 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#e9efe9] text-[#003316] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">manage_search</span>
            </div>
            <h4 className="font-headline font-bold text-sm text-[#003316]">
              Pencarian Terpadu Operasional Gerai
            </h4>
            <p className="text-xs text-[#414941] max-w-md mx-auto">
              Ketik nomor AWB ID Express, nomor handphone pengirim/penerima, nama pelanggan, atau nomor batch manifest pada kolom di atas untuk memeriksa status paket secara instan.
            </p>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-xs text-[#414941]">
            <span className="material-symbols-outlined text-[32px] animate-spin text-[#114b27] block mb-2">
              progress_activity
            </span>
            Mencari ke seluruh basis data transaksi, customer, dan manifest batch...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Transactions Found */}
            <div className="bg-white rounded-xl border border-[#d0d9d1] shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#f4f6f4]">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                  Data Transaksi Pengiriman Ditemukan ({results?.transactionsCount || 0})
                </span>
                <span className="text-[10px] text-[#414941] font-tabular">Real-Time DB Sync</span>
              </div>

              <div className="space-y-3">
                {(results?.transactions || []).map((trx: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#f4f6f4] border border-[#d0d9d1] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-black text-sm text-[#003316]">
                          {trx.idExpressAwb}
                        </span>
                        <span className="text-[10px] font-tabular bg-[#e01a22] text-white font-bold px-1.5 py-0.2 rounded">
                          ID EXPRESS DIRECT
                        </span>
                        <span className="text-[10px] font-tabular bg-white border border-[#d0d9d1] px-1.5 py-0.2 rounded text-[#414941]">
                          TRX: {trx.transactionId}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          trx.status === 'HANDED_OVER'
                            ? 'bg-[#dcf5ce] text-[#0b381b]'
                            : 'bg-[#e0f2fe] text-[#0284c7]'
                        }`}
                      >
                        {trx.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-[#414941] uppercase block">
                          Pengirim
                        </span>
                        <span className="font-bold text-[#131e17]">{trx.senderName}</span>
                        <span className="block font-tabular text-[#414941]">{trx.senderPhone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#414941] uppercase block">
                          Penerima &amp; Tujuan
                        </span>
                        <span className="font-bold text-[#131e17]">{trx.recipientName}</span>
                        <span className="block text-[#414941]">{trx.destinationHub}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#414941] uppercase block">
                          Spesifikasi Paket
                        </span>
                        <span className="font-tabular font-bold text-[#003316]">
                          {trx.chargeableWeightKg} kg ({trx.serviceLevel})
                        </span>
                        <span className="block font-tabular text-[#414941]">
                          Total: Rp {trx.totalAmount?.toLocaleString('id-ID')} ({trx.paymentMethod})
                        </span>
                      </div>
                    </div>

                    {/* Complaint History linked to transaction */}
                    {trx.complaintLogs && trx.complaintLogs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#d0d9d1] space-y-1">
                        <span className="text-[10px] font-bold text-[#e01a22] uppercase tracking-wider block">
                          Catatan CS / Keluhan Terkait:
                        </span>
                        {trx.complaintLogs.map((c: any, cIdx: number) => (
                          <div
                            key={cIdx}
                            className="p-2 bg-white rounded border border-[#d0d9d1] text-[11px] text-[#131e17]"
                          >
                            <span className="font-bold text-[#003316]">{c.reporterName} ({c.issueCategory}):</span> {c.notes}
                            {c.resolution && (
                              <div className="text-[10px] text-[#16a34a] font-semibold mt-0.5">
                                Solusi: {c.resolution}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Customers Found */}
            {results?.customers && results.customers.length > 0 && (
              <div className="bg-white rounded-xl border border-[#d0d9d1] shadow-xs p-5 space-y-3">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider block">
                  Data Langganan Gedung (Customer Account):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.customers.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#eaf7ec] border border-[#81bb8c] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#003316]">{c.fullName}</span>
                          <span className="font-tabular text-[10px] bg-white px-1.5 py-0.2 rounded text-[#414941]">
                            {c.customerId}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#414941] block">{c.companyName || 'Walk-in'}</span>
                        <span className="font-tabular text-[11px] text-[#286c00] font-semibold">
                          {c.phone}
                        </span>
                      </div>
                      <span className="font-tabular text-xs font-bold text-[#003316]">
                        {c.transactions?.length || 0} Kiriman
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPLAINT LOGGING MODAL */}
      {complaintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#d0d9d1]">
            <div className="flex items-center justify-between pb-2 border-b border-[#f4f6f4]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#114b27] text-[24px]">
                  support_agent
                </span>
                <span className="font-headline font-bold text-sm uppercase text-[#003316]">
                  Dokumentasi Catatan CS Gerai
                </span>
              </div>
              <button
                type="button"
                onClick={() => setComplaintModal(false)}
                className="text-[#414941] hover:text-[#131e17]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {complaintSaved && (
              <div className="p-2.5 bg-[#dcf5ce] border border-[#286c00] rounded text-xs text-[#0b381b] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Catatan komplain berhasil tersimpan di sistem gerai!
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#414941] uppercase">Nama Pelapor</label>
                <input
                  type="text"
                  className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-3 py-2 text-[#131e17] outline-none"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#414941] uppercase">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-3 py-2 font-tabular text-[#131e17] outline-none"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#414941] uppercase">Kategori Keluhan</label>
                <select
                  className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-3 py-2 text-[#131e17] outline-none bg-white"
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                >
                  <option value="GENERAL_INQUIRY">Informasi Jadwal Armada Pickup</option>
                  <option value="DELAYED">Keterlambatan Paket di Tujuan</option>
                  <option value="DAMAGED">Kerusakan Isi Barang</option>
                  <option value="WRONG_ADDRESS">Perubahan Alamat Pengantaran</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#414941] uppercase">Isi Catatan &amp; Arahan CS</label>
                <textarea
                  rows={3}
                  className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-3 py-2 text-[#131e17] outline-none"
                  placeholder="Tuliskan kronologi dan tanggapan staf gerai..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setComplaintModal(false)}
                className="flex-1 py-2.5 border border-[#d0d9d1] rounded-xl text-xs font-bold text-[#414941] hover:bg-[#f4f6f4]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveComplaint}
                className="flex-1 py-2.5 bg-[#114b27] hover:bg-[#003316] text-white rounded-xl text-xs font-headline font-bold uppercase tracking-wider shadow-md"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </HeaderAndSidebar>
  );
}
