'use client';

import { useState, useEffect } from 'react';
import HeaderAndSidebar from '@/components/HeaderAndSidebar';
import { akasiaApi } from '@/lib/api';

export default function RekonsiliasiKomisiPage() {
  const [settlementData, setSettlementData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSettlement();
  }, []);

  const fetchSettlement = async () => {
    try {
      const res = await akasiaApi.getSettlementSummary('2024-10');
      if (res.success) setSettlementData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPayout = async (settlementId: string) => {
    try {
      const res = await akasiaApi.payoutSettlement(settlementId);
      if (res.success) {
        setPayoutMsg(res.message);
        fetchSettlement();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pencairan');
    }
  };

  const volume = settlementData?.volumeProgress;
  const finance = settlementData?.financialSummary;

  return (
    <HeaderAndSidebar>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Top Header Card */}
        <div className="bg-white p-5 rounded-xl border border-[#d0d9d1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003316] text-[#a5f87a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <span className="font-headline font-bold text-sm text-[#003316] uppercase tracking-wider block">
                Rekonsiliasi Komisi Kontrak Volume &amp; Revenue Sharing
              </span>
              <span className="text-xs text-[#414941]">
                Perjanjian Kerjasama Eksklusif: Akasia Logistik × ID Express (Periode: Oktober 2024)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#dcf5ce] text-[#0b381b] font-bold px-2.5 py-1 rounded-lg font-tabular uppercase">
              STATUS KONTRAK: AKTIF RESMI
            </span>
          </div>
        </div>

        {payoutMsg && (
          <div className="p-3 bg-[#dcf5ce] border border-[#286c00] rounded-xl text-xs text-[#0b381b] font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {payoutMsg}
          </div>
        )}

        {/* Milestone Progress towards Tier 3 */}
        <div className="bg-[#0b381b] text-white p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-[#81bb8c] uppercase font-bold tracking-wider block">
                Pencapaian Volume Pengiriman Gerai
              </span>
              <span className="font-headline font-black text-xl text-[#a5f87a]">
                {volume?.totalParcels || 480} Koli / 500 Koli ({volume?.currentTier || 'Tier 2 Silver - 20%'})
              </span>
            </div>

            <span className="text-xs text-[#dcf5ce] font-tabular font-bold bg-[#114b27] px-3 py-1.5 rounded-lg border border-[#81bb8c]/30">
              Kurang {volume?.parcelsUntilNextTier || 20} Koli lagi menuju Tier 3 (25% + Bonus)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#114b27] h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-[#a5f87a] h-full rounded-full transition-all duration-500"
              style={{ width: `${volume?.progressPercent || 96}%` }}
            ></div>
          </div>
        </div>

        {/* Financial Metrics Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#414941] block">
              Total Omset Gerai (Gross)
            </span>
            <span className="font-headline font-black text-lg text-[#003316] mt-1 block">
              Rp {finance ? finance.grossShippingRevenue.toLocaleString('id-ID') : '11.640.000'}
            </span>
            <span className="text-[10px] text-[#8eaa93] mt-0.5 block">
              Total ongkir seluruh transaksi
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#414941] block">
              Hak Komisi Sub-Agen (20%)
            </span>
            <span className="font-headline font-black text-lg text-[#16a34a] mt-1 block">
              Rp {finance ? finance.subAgentCommissionEarned.toLocaleString('id-ID') : '2.328.000'}
            </span>
            <span className="text-[10px] text-[#286c00] mt-0.5 block font-semibold">
              Bagi hasil bersih milik gerai
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#414941] block">
              Setoran ke ID Express Pusat
            </span>
            <span className="font-headline font-black text-lg text-[#131e17] mt-1 block">
              Rp {finance ? finance.carrierNetRemittance.toLocaleString('id-ID') : '9.312.000'}
            </span>
            <span className="text-[10px] text-[#414941] mt-0.5 block">
              Penyetoran 80% ke ekspedisi
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs">
            <span className="text-[10px] font-bold uppercase text-[#414941] block">
              Saldo Komisi Siap Cair
            </span>
            <span className="font-headline font-black text-lg text-[#e01a22] mt-1 block">
              Rp {finance ? finance.commissionBalanceUnwithdrawn.toLocaleString('id-ID') : '174.600'}
            </span>
            <span className="text-[10px] text-[#414941] mt-0.5 block">
              Belum ditarik kasir
            </span>
          </div>
        </div>

        {/* Volume Contract Tier Reference Table */}
        <div className="bg-white rounded-xl border border-[#d0d9d1] shadow-xs p-5 space-y-3">
          <span className="text-xs font-bold text-[#003316] uppercase tracking-wider block">
            Struktur Kontrak Skala Volume Resmi ID Express:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {(settlementData?.volumeTiersContract || [
              { tier: 'Tier 1 (Bronze)', minVolume: '0 - 200 Koli', rate: '15%', status: 'ACHIEVED' },
              { tier: 'Tier 2 (Silver)', minVolume: '201 - 500 Koli', rate: '20%', status: 'ACTIVE' },
              { tier: 'Tier 3 (Gold Partner)', minVolume: '> 500 Koli', rate: '25% + Bonus Rp 500K', status: 'LOCKED' },
            ]).map((t: any, idx: number) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  t.status === 'ACTIVE'
                    ? 'border-[#003316] bg-[#eaf7ec] ring-2 ring-[#003316]/20'
                    : 'border-[#d0d9d1] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#131e17]">{t.tier}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-tabular uppercase ${
                        t.status === 'ACTIVE'
                          ? 'bg-[#003316] text-[#a5f87a]'
                          : t.status === 'ACHIEVED'
                          ? 'bg-[#d0d9d1] text-[#414941]'
                          : 'bg-[#f4f6f4] text-[#8eaa93]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#414941] block mt-1">{t.minVolume}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-[#d0d9d1] font-headline font-bold text-sm text-[#003316]">
                  Komisi: {t.rate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement Invoices Table */}
        <div className="bg-white rounded-xl border border-[#d0d9d1] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#f4f6f4] flex items-center justify-between">
            <span className="text-xs font-bold text-[#003316] uppercase tracking-wider">
              Rekapitulasi Faktur Tagihan &amp; Pencairan Bagi Hasil
            </span>
            <span className="font-tabular text-[11px] text-[#414941]">ID Express Clearing Node</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tabular">
              <thead className="bg-[#e9efe9] text-[#131e17] font-headline text-[11px] uppercase tracking-wider border-b border-[#d0d9d1]">
                <tr>
                  <th className="py-2.5 px-3">No. Settlement</th>
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3 text-right">Volume Koli</th>
                  <th className="py-2.5 px-3 text-right">Gross Omset</th>
                  <th className="py-2.5 px-3 text-right">Tarif Komisi</th>
                  <th className="py-2.5 px-3 text-right">Komisi Diterima</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9efe9]">
                {(settlementData?.settlementInvoices || [
                  {
                    settlementId: 'STL-202410-001',
                    periodMonth: '2024-10',
                    totalVolumeParcels: 480,
                    totalGrossRevenue: 11640000,
                    tierCommissionPercent: 20,
                    totalCommissionEarned: 2328000,
                    status: 'CALCULATED',
                  },
                ]).map((inv: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#f4f6f4] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#003316]">{inv.settlementId}</td>
                    <td className="py-3 px-3 text-[#131e17]">{inv.periodMonth}</td>
                    <td className="py-3 px-3 text-right font-semibold">{inv.totalVolumeParcels} Koli</td>
                    <td className="py-3 px-3 text-right">Rp {inv.totalGrossRevenue.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#286c00]">{inv.tierCommissionPercent}%</td>
                    <td className="py-3 px-3 text-right font-black text-[#003316]">
                      Rp {inv.totalCommissionEarned.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          inv.status === 'PAID_OUT'
                            ? 'bg-[#dcf5ce] text-[#0b381b]'
                            : 'bg-[#fffbeb] text-[#92400e]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {inv.status === 'CALCULATED' ? (
                        <button
                          type="button"
                          onClick={() => handleClaimPayout(inv.settlementId)}
                          className="bg-[#114b27] hover:bg-[#003316] text-white px-3 py-1 rounded text-[11px] font-bold transition-all shadow-xs"
                        >
                          Cairkan Komisi
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#16a34a] font-bold">✓ Dicairkan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </HeaderAndSidebar>
  );
}
