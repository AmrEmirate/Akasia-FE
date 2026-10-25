'use client';

import { useState, useEffect } from 'react';
import HeaderAndSidebar from '@/components/HeaderAndSidebar';
import { akasiaApi } from '@/lib/api';

export default function RekonsiliasiKomisiPage() {
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const currentPeriodLabel = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Role Switcher: 'sub_agent' vs 'akasia_pusat'
  const [activeRole, setActiveRole] = useState<'sub_agent' | 'akasia_pusat'>('sub_agent');
  const [selectedAgentId, setSelectedAgentId] = useState('AG-0418');
  const [agentsList, setAgentsList] = useState<any[]>([]);

  const [settlementData, setSettlementData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchSettlement();
  }, [activeRole, selectedAgentId]);

  const fetchAgents = async () => {
    try {
      const res = await akasiaApi.getAgentsList();
      if (res.success && res.agents) {
        setAgentsList(res.agents);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar agen:', err);
    }
  };

  const fetchSettlement = async () => {
    setLoading(true);
    try {
      const res = await akasiaApi.getSettlementSummary(currentPeriod, activeRole, selectedAgentId);
      if (res.success) {
        setSettlementData(res);
      }
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
        setTimeout(() => setPayoutMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pencairan');
    }
  };

  const handlePayoutSubAgentFromPusat = async (agentId: string) => {
    try {
      const res = await akasiaApi.payoutSubAgent(agentId);
      if (res.success) {
        setPayoutMsg(res.message);
        fetchSettlement();
        fetchAgents();
        setTimeout(() => setPayoutMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mencairkan komisi sub-agen');
    }
  };

  const volume = settlementData?.volumeProgress;
  const finance = settlementData?.financialSummary;
  const exec = settlementData?.executiveSummary;
  const cutoff = settlementData?.cutoffAndContract;

  return (
    <HeaderAndSidebar>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Top Header & Role Switcher */}
        <div className="bg-white p-5 rounded-xl border border-[#d0d9d1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003316] text-[#a5f87a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <span className="font-headline font-bold text-sm text-[#003316] uppercase tracking-wider block">
                Perhitungan Komisi &amp; Rekonsiliasi Finansial
              </span>
              <span className="text-xs text-[#414941]">
                Sistem Terintegrasi Akasia Logistik × ID Express (Periode: {currentPeriodLabel})
              </span>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div className="flex items-center bg-[#e9efe9] p-1 rounded-xl border border-[#d0d9d1]">
            <button
              type="button"
              onClick={() => setActiveRole('sub_agent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'sub_agent'
                  ? 'bg-[#003316] text-[#a5f87a] shadow-xs'
                  : 'text-[#414941] hover:text-[#131e17]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>Menu Sub-Agent (Gerai)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('akasia_pusat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeRole === 'akasia_pusat'
                  ? 'bg-[#114b27] text-white shadow-xs'
                  : 'text-[#414941] hover:text-[#131e17]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Menu Akasia Pusat</span>
            </button>
          </div>
        </div>

        {payoutMsg && (
          <div className="p-3 bg-[#dcf5ce] border border-[#286c00] rounded-xl text-xs text-[#0b381b] font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {payoutMsg}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: SUB-AGENT PORTAL (PRIVASI: TIDAK MELIHAT 25% KOMISI ID EXPRESS)  */}
        {/* ========================================================================= */}
        {activeRole === 'sub_agent' && (
          <div className="space-y-4">
            {/* Agent Selector Banner */}
            <div className="bg-[#f4f6f4] border border-[#d0d9d1] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003316] text-[20px]">badge</span>
                <span className="text-xs font-bold text-[#003316]">
                  Gerai Aktif: {settlementData?.agent?.branchName || 'Gerai Kuningan Tower 2'} ({settlementData?.agent?.agentId || selectedAgentId})
                </span>
              </div>

              {agentsList.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Pilih Gerai:</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="bg-white border border-[#d0d9d1] rounded-lg px-2 py-1 text-xs font-bold text-[#131e17]"
                  >
                    {agentsList.map((ag) => (
                      <option key={ag.id} value={ag.agentId}>
                        {ag.branchName} ({ag.agentId})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Volume Progress Card */}
            <div className="bg-[#0b381b] text-white p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-[#81bb8c] uppercase font-bold tracking-wider block">
                    Pencapaian Volume Pengiriman Gerai
                  </span>
                  <span className="font-headline font-black text-xl text-[#a5f87a]">
                    {volume?.totalParcels || 0} Koli ({volume?.currentTier || 'Sub-Agent Resmi - 20%'})
                  </span>
                </div>

                <span className="text-xs text-[#dcf5ce] font-tabular font-bold bg-[#114b27] px-3 py-1.5 rounded-lg border border-[#81bb8c]/30">
                  Target Bulanan: 500 Koli ({volume?.progressPercent || 0}% Tercapai)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#114b27] h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-[#a5f87a] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, volume?.progressPercent || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Financial Metrics for Sub-Agent */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#414941] block">
                  Total Omset Gerai (Gross Shipping)
                </span>
                <span className="font-headline font-black text-lg text-[#003316] mt-1 block">
                  Rp {finance ? finance.grossShippingRevenue.toLocaleString('id-ID') : '0'}
                </span>
                <span className="text-[10px] text-[#8eaa93] mt-0.5 block">
                  Total ongkir transaksi gerai Anda
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#414941] block">
                  Hak Komisi Anda (20% dari Akasia Pusat)
                </span>
                <span className="font-headline font-black text-lg text-[#16a34a] mt-1 block">
                  Rp {finance ? finance.subAgentCommissionEarned.toLocaleString('id-ID') : '0'}
                </span>
                <span className="text-[10px] text-[#286c00] mt-0.5 block font-semibold">
                  {finance?.commissionScheme || '20% dari Ongkos Kirim'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#414941] block">
                  Saldo Komisi Siap Cair
                </span>
                <span className="font-headline font-black text-lg text-[#e01a22] mt-1 block">
                  Rp {finance ? finance.commissionBalanceUnwithdrawn.toLocaleString('id-ID') : '0'}
                </span>
                <span className="text-[10px] text-[#414941] mt-0.5 block">
                  Dapat ditarik ke rekening gerai
                </span>
              </div>
            </div>

            {/* Notice Policy Banner */}
            <div className="p-3 bg-[#eaf7ec] border border-[#81bb8c] rounded-xl text-xs text-[#003316] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#286c00]">verified_user</span>
              <span>
                <strong>SOP Komisi Gerai:</strong> Komisi sebesar 20% langsung dibagikan oleh Akasia Logistik Pusat ke sub-agen untuk setiap paket yang diproses di loket kasir atau secara remote.
              </span>
            </div>

            {/* Settlement Invoices Table */}
            <div className="bg-white rounded-xl border border-[#d0d9d1] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#f4f6f4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider">
                  Riwayat Faktur Bagi Hasil Sub-Agent
                </span>
                <span className="font-tabular text-[11px] text-[#414941]">Akasia Sub-Agent Ledger</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-tabular">
                  <thead className="bg-[#e9efe9] text-[#131e17] font-headline text-[11px] uppercase tracking-wider border-b border-[#d0d9d1]">
                    <tr>
                      <th className="py-2.5 px-3">No. Settlement</th>
                      <th className="py-2.5 px-3">Periode</th>
                      <th className="py-2.5 px-3 text-right">Volume Koli</th>
                      <th className="py-2.5 px-3 text-right">Gross Omset</th>
                      <th className="py-2.5 px-3 text-right">Komisi Anda</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e9efe9]">
                    {(settlementData?.settlementInvoices || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-[#414941]">
                          Belum ada rekapitulasi settlement bulanan. Transaksi berjalan otomatis terakumulasi di saldo komisi.
                        </td>
                      </tr>
                    ) : (
                      settlementData.settlementInvoices.map((inv: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#f4f6f4] transition-colors">
                          <td className="py-3 px-3 font-bold text-[#003316]">{inv.settlementId}</td>
                          <td className="py-3 px-3 text-[#131e17]">{inv.periodMonth}</td>
                          <td className="py-3 px-3 text-right font-semibold">{inv.totalVolumeParcels} Koli</td>
                          <td className="py-3 px-3 text-right">Rp {inv.totalGrossRevenue.toLocaleString('id-ID')}</td>
                          <td className="py-3 px-3 text-right font-black text-[#16a34a]">
                            Rp {inv.totalCommissionEarned.toLocaleString('id-ID')} ({inv.tierCommissionPercent}%)
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: AKASIA PUSAT PORTAL (KONSOLIDASI FINANSIAL & ID EXPRESS 25%)      */}
        {/* ========================================================================= */}
        {activeRole === 'akasia_pusat' && (
          <div className="space-y-4">
            {/* Top Alert & Executive Title */}
            <div className="bg-[#003316] text-white p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#81bb8c]/30 pb-3">
                <div>
                  <span className="text-[10px] text-[#81bb8c] uppercase font-bold tracking-wider block">
                    Konsolidasi Rekonsiliasi Finansial Sentral
                  </span>
                  <span className="font-headline font-black text-xl text-[#a5f87a]">
                    ID Express (25%) × Akasia Pusat × Sub-Agent (20%)
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#dcf5ce] block">Jadwal Cut-off Transaksi:</span>
                  <span className="text-xs font-bold text-[#a5f87a]">Setiap Akhir Bulan (28-31)</span>
                </div>
              </div>

              {/* 5-Card Multi-Tier Financial Ledger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                {/* 1. Total Gross Revenue */}
                <div className="bg-[#114b27] p-3.5 rounded-xl border border-[#81bb8c]/30">
                  <span className="text-[10px] font-bold uppercase text-[#81bb8c] block">
                    1. Total Gross Ongkir
                  </span>
                  <span className="font-headline font-black text-base text-white mt-1 block">
                    Rp {exec ? exec.totalGrossShippingRevenue.toLocaleString('id-ID') : '0'}
                  </span>
                  <span className="text-[9px] text-[#dcf5ce] block mt-0.5">
                    {exec?.totalSystemParcels || 0} Koli ({exec?.totalWeightKg || 0} kg)
                  </span>
                </div>

                {/* 2. Tagihan Komisi ke ID Express (25%) */}
                <div className="bg-[#114b27] p-3.5 rounded-xl border border-[#81bb8c]/30">
                  <span className="text-[10px] font-bold uppercase text-[#a5f87a] block">
                    2. Klaim ID Express (25%)
                  </span>
                  <span className="font-headline font-black text-base text-[#a5f87a] mt-1 block">
                    Rp {exec ? exec.totalIdExpressCommissionClaim.toLocaleString('id-ID') : '0'}
                  </span>
                  <span className="text-[9px] text-[#dcf5ce] block mt-0.5">
                    Komisi Akasia dari ID Express
                  </span>
                </div>

                {/* 3. Kewajiban Bayar ke Sub-Agent (20%) */}
                <div className="bg-[#114b27] p-3.5 rounded-xl border border-[#81bb8c]/30">
                  <span className="text-[10px] font-bold uppercase text-[#fcd34d] block">
                    3. Bayar Sub-Agent (20%)
                  </span>
                  <span className="font-headline font-black text-base text-[#fcd34d] mt-1 block">
                    Rp {exec ? exec.totalSubAgentCommissionPayable.toLocaleString('id-ID') : '0'}
                  </span>
                  <span className="text-[9px] text-[#dcf5ce] block mt-0.5">
                    Kewajiban bagi hasil gerai
                  </span>
                </div>

                {/* 4. Komisi Dukungan Sistem Developer (20% dari Komisi Akasia) */}
                <div className="bg-[#114b27] p-3.5 rounded-xl border border-[#81bb8c]/30">
                  <span className="text-[10px] font-bold uppercase text-[#93c5fd] block">
                    4. Dev System (20% dari 25%)
                  </span>
                  <span className="font-headline font-black text-base text-[#93c5fd] mt-1 block">
                    Rp {exec ? exec.developerSupportCommission.toLocaleString('id-ID') : '0'}
                  </span>
                  <span className="text-[9px] text-[#dcf5ce] block mt-0.5">
                    Support IT &amp; Server (5% gross)
                  </span>
                </div>

                {/* 5. Net Margin Akasia Pusat */}
                <div className="bg-[#114b27] p-3.5 rounded-xl border border-[#81bb8c]/30">
                  <span className="text-[10px] font-bold uppercase text-[#4ade80] block">
                    5. Net Akasia Pusat
                  </span>
                  <span className="font-headline font-black text-base text-[#4ade80] mt-1 block">
                    Rp {exec ? exec.akasiaPusatGrossMargin.toLocaleString('id-ID') : '0'}
                  </span>
                  <span className="text-[9px] text-[#dcf5ce] block mt-0.5">
                    Sisa margin operasional (5%)
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Agent Breakdown Table */}
            <div className="bg-white rounded-xl border border-[#d0d9d1] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#f4f6f4] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#003316] uppercase tracking-wider block">
                    Rincian Komisi per Masing-Masing Sub-Agent
                  </span>
                  <span className="text-[11px] text-[#414941]">
                    Rekonsiliasi omzet, klaim 25% ID Express, dan kewajiban bayar komisi 20% ke gerai
                  </span>
                </div>

                <span className="text-[10px] bg-[#dcf5ce] text-[#0b381b] font-bold px-2 py-0.5 rounded font-tabular uppercase">
                  {settlementData?.agentBreakdown?.length || 0} Gerai Terdaftar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-tabular">
                  <thead className="bg-[#e9efe9] text-[#131e17] font-headline text-[11px] uppercase tracking-wider border-b border-[#d0d9d1]">
                    <tr>
                      <th className="py-2.5 px-3">Kode &amp; Nama Gerai</th>
                      <th className="py-2.5 px-3">PIC / Kontak</th>
                      <th className="py-2.5 px-3 text-right">Volume</th>
                      <th className="py-2.5 px-3 text-right">Total Ongkir</th>
                      <th className="py-2.5 px-3 text-right">Klaim ID Exp (25%)</th>
                      <th className="py-2.5 px-3 text-right">Komisi Agen (20%)</th>
                      <th className="py-2.5 px-3 text-right">Margin Pusat (5%)</th>
                      <th className="py-2.5 px-3 text-right">Saldo Belum Cair</th>
                      <th className="py-2.5 px-3 text-center">Aksi Pusat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e9efe9]">
                    {(settlementData?.agentBreakdown || []).map((ag: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#f4f6f4] transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#003316] block">{ag.branchName}</span>
                          <span className="text-[10px] text-[#414941]">{ag.agentId} • {ag.buildingName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold block">{ag.picName}</span>
                          <span className="text-[10px] text-[#414941]">{ag.phone}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#131e17]">{ag.totalParcels} Koli</td>
                        <td className="py-3 px-3 text-right font-semibold">Rp {ag.grossRevenue.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3 text-right font-bold text-[#286c00]">
                          Rp {ag.idExpressCommissionClaim25.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#f59e0b]">
                          Rp {ag.subAgentCommissionPayable20.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#003316]">
                          Rp {ag.akasiaNetShare5.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-[#e01a22]">
                          Rp {ag.commissionBalance.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {ag.commissionBalance > 0 ? (
                            <button
                              type="button"
                              onClick={() => handlePayoutSubAgentFromPusat(ag.agentId)}
                              className="bg-[#114b27] hover:bg-[#003316] text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all shadow-xs"
                            >
                              Bayar Komisi
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#16a34a] font-bold">✓ Lunas</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SOP Rekening Sentral & Dukungan Kontrak 5 Tahun */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider block">
                  Rekening Penampungan Konsumen (Akasia Pusat)
                </span>
                <span className="text-[11px] text-[#414941] block">
                  Seluruh pembayaran non-tunai dari konsumen wajib disetor ke rekening resmi Akasia Logistik:
                </span>
                <div className="space-y-1.5 pt-1 text-xs font-tabular">
                  {(cutoff?.centralAccounts || [
                    { bank: 'BCA Akasia Pusat', accountNo: '8830-192-881', holder: 'PT Akasia Logistik Indonesia' },
                    { bank: 'Mandiri Akasia Pusat', accountNo: '137-00-9928172-1', holder: 'PT Akasia Logistik Indonesia' },
                  ]).map((acc: any, i: number) => (
                    <div key={i} className="p-2 bg-[#f4f6f4] rounded-lg flex items-center justify-between">
                      <span className="font-bold text-[#003316]">{acc.bank}</span>
                      <span className="font-bold text-[#131e17]">{acc.accountNo} ({acc.holder})</span>
                    </div>
                  ))}
                  <div className="p-2 bg-[#eaf7ec] rounded-lg text-[11px] text-[#003316] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                    <span>Merchant QRIS: NMID ID1020088192837 (Akasia Sentral QRIS)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider block">
                  Ketentuan Kontrak &amp; Dukungan Sistem
                </span>
                <div className="space-y-1.5 text-xs text-[#414941]">
                  <p>
                    <strong>1. Skema Dukungan Sistem:</strong> Sebesar 20% dari komisi yang diterima Akasia dari ID Express (5.0% dari gross ongkos kirim) dialokasikan untuk biaya pemeliharaan server, AC, listrik, dan pengembangan sistem.
                  </p>
                  <p>
                    <strong>2. Jangka Waktu Kontrak:</strong> Disepakati selama 5 tahun masa aktif, setelahnya dapat diperpanjang atau dievaluasi kembali.
                  </p>
                  <p>
                    <strong>3. Cut-off Transaksi:</strong> Rekonsiliasi transaksi ID Express dan Akasia dipotong setiap akhir bulan (28-31) untuk penerbitan invoice resmi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HeaderAndSidebar>
  );
}
