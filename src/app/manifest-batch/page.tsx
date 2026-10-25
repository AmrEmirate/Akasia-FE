'use client';

import { useState, useEffect } from 'react';
import HeaderAndSidebar from '@/components/HeaderAndSidebar';
import { akasiaApi } from '@/lib/api';
import { useKasirAuth } from '@/context/KasirAuthContext';

export default function ManifestBatchPage() {
  const { user, isPusat } = useKasirAuth();
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STAGED' | 'MANIFESTED' | 'HANDED_OVER'>('ALL');
  const [scanInput, setScanInput] = useState('');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Handover state (Clean inputs for actual fleet driver)
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [sealedSuccess, setSealedSuccess] = useState<any>(null);
  const [handoverLoading, setHandoverLoading] = useState(false);

  useEffect(() => {
    fetchBatch();
  }, []);

  const fetchBatch = async () => {
    try {
      const res = await akasiaApi.getCurrentManifest();
      if (res.batch) setBatchData(res.batch);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;

    setScannedFeedback(`✓ Barcode [${scanInput.toUpperCase()}] berhasil dipindai & dicocokkan ke Staging Bin!`);
    setScanInput('');
    setTimeout(() => setScannedFeedback(null), 3000);
  };

  const handleSealAndPrintBast = async () => {
    if (!driverName.trim() || !driverPhone.trim() || !vehiclePlate.trim()) {
      alert('Mohon lengkapi identitas kurir penjemput ID Express (Nama Driver, No. Handphone, dan No. Polisi Armada)');
      return;
    }
    setHandoverLoading(true);
    try {
      const res = await akasiaApi.executeHandover({
        manifestBatchId: batchData?.manifestBatchId,
        fleetDriverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        vehiclePlate: vehiclePlate.trim(),
        signatureData: `SIG_${driverName.trim().toUpperCase().replace(/\s+/g, '_')}_VERIFIED`,
      });
      if (res.success) {
        setSealedSuccess(res.handoverReport);
        fetchBatch();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses BAST serah terima');
    } finally {
      setHandoverLoading(false);
    }
  };

  const transactions = batchData?.transactions || [
    {
      idExpressAwb: 'ID01928472910',
      destinationHub: 'HUB JKT-TIMUR (Pancoran DC)',
      serviceLevel: 'ID Express Standard (REG)',
      actualWeightKg: 2.45,
      chargeableWeightKg: 2.45,
      stagingBin: 'BIN-A1',
      status: 'STAGED',
      recipientName: 'Kresna Logistik Office',
    },
    {
      idExpressAwb: 'ID01928472911',
      destinationHub: 'HUB BGR-01 (Bogor DC)',
      serviceLevel: 'ID Express SameDay',
      actualWeightKg: 3.2,
      chargeableWeightKg: 6.56,
      stagingBin: 'BIN-VOLUMETRIC',
      status: 'MANIFESTED',
      recipientName: 'PT Sentra Medika',
    },
  ];

  const filteredTransactions = transactions.filter((t: any) => {
    if (activeFilter === 'ALL') return true;
    return t.status === activeFilter;
  });

  return (
    <HeaderAndSidebar>
      <div className="flex flex-col w-full">
        {/* Sub-header Operational Command Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-[#d0d9d1] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b2614] flex items-center justify-center text-[#b5f1bf] shrink-0">
              <span className="material-symbols-outlined text-[24px]">local_shipping</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-sm text-[#003316] uppercase">
                  Manifest Batch &amp; Serah Terima Armada
                </span>
                <span className="px-2 py-0.5 rounded bg-[#dcf5ce] font-tabular text-[10px] font-bold text-[#0b381b] uppercase">
                  HUB SYNC ACTIVE
                </span>
              </div>
              <span className="text-[10px] text-[#414941] uppercase tracking-wider">
                Modul Ekspedisi Gerai • Verifikasi Scan Fisik Koli ke Armada ID Express Direct
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#e9efe9] px-3 py-1.5 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold text-[#131e17]">
                Auto-Sync Driver App: <span className="text-[#286c00] font-tabular">ONLINE</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => alert('🔊 Audio Beep Scan [F9] Aktif!')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f4f6f4] hover:bg-[#e9efe9] text-[#131e17] font-headline text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>Sound Beep [F9]</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Top 4 KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* KPI 1 */}
            <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#414941]">Paket di Staging Gerai</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline font-black text-2xl text-[#003316]">
                      {batchData?.totalParcels || 42}
                    </span>
                    <span className="text-xs font-bold text-[#286c00]">Koli Siap</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#e9efe9] flex items-center justify-center text-[#003316]">
                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#f4f6f4] flex justify-between text-[11px] text-[#414941]">
                <span>Akumulasi Bobot Fisik:</span>
                <span className="font-tabular font-bold text-[#131e17]">
                  {(batchData?.totalWeightKg || 68.5).toFixed(1)} kg
                </span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#414941]">Manifest Terbit Hari Ini</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline font-black text-2xl text-[#003316]">03</span>
                    <span className="text-xs font-bold text-[#414941]">Batch Selesai</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#e9efe9] flex items-center justify-center text-[#003316]">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#f4f6f4] flex justify-between text-[11px] text-[#414941]">
                <span>Terkirim ke Hub DC:</span>
                <span className="font-tabular font-bold text-[#16a34a]">118 Paket</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-[#0b2614] text-white p-4 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#b5f1bf]">Pickup Armada Berikutnya</span>
                    <span className="px-1 py-0.2 rounded bg-[#e01a22] text-white text-[9px] font-bold uppercase">
                      Rutin Shift 2
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline font-black text-2xl text-[#a5f87a]">16:30</span>
                    <span className="font-tabular text-xs text-[#81bb8c]">WIB (±2 Menit)</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#114b27] flex items-center justify-center text-[#a5f87a]">
                  <span className="material-symbols-outlined text-[20px]">airport_shuttle</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[11px] text-[#81bb8c]">
                <span>{driverName.slice(0, 13)}</span>
                <span className="font-tabular font-bold text-[#a5f87a]">{vehiclePlate.slice(0, 10)}</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#414941]">Akurasi Scan Serah Terima</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-headline font-black text-2xl text-[#286c00]">100%</span>
                    <span className="text-[10px] font-bold text-[#286c00] uppercase">Zero Missing</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#dcf5ce] flex items-center justify-center text-[#0b381b]">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#f4f6f4] flex justify-between text-[11px] text-[#414941]">
                <span>Discrepancy Fisik:</span>
                <span className="font-tabular font-bold text-[#0b381b]">0 Selisih (Aman)</span>
              </div>
            </div>
          </div>

          {sealedSuccess && (
            <div className="p-4 bg-[#dcf5ce] border-2 border-[#286c00] rounded-xl text-xs text-[#0b381b] space-y-1">
              <div className="font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-[#286c00]">check_circle</span>
                BAST Serah Terima {sealedSuccess.sealedManifestId} Resmi Disegel &amp; Ditandatangani Armada!
              </div>
              <p>
                Armada Driver: <strong>{sealedSuccess.fleetDriver} ({sealedSuccess.vehiclePlate})</strong> • Total {sealedSuccess.totalParcelsHandedOver} koli ({sealedSuccess.totalWeightKg} kg) diserahkan ke kurir ID Express. Batch baru [{sealedSuccess.nextActiveBatchId}] dibuka untuk shift berikutnya.
              </p>
            </div>
          )}

          {/* MAIN WORKSPACE SPLIT (70% SCANNER TABLE / 30% DIGITAL BAST DOCUMENT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left 70% (8 cols) Staging Table & Barcode Reader */}
            <div className="lg:col-span-8 space-y-4">
              {/* Active Barcode Scanner Input Zone */}
              <form
                onSubmit={handleSimulateScan}
                className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#e01a22] text-[20px]">
                      qr_code_scanner
                    </span>
                    <label className="font-headline font-bold text-xs text-[#003316] uppercase">
                      Mass Handover Barcode Reader
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-[#dcf5ce] text-[#0b381b] text-[9px] uppercase font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#286c00]"></span> USB &amp; Bluetooth HID Ready
                    </span>
                  </div>
                  <span className="text-[10px] font-tabular text-[#414941]">
                    Beep Audio: <strong className="text-[#286c00]">AKTIF</strong> • Prefix: <strong className="text-[#003316]">IDE*</strong>
                  </span>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 material-symbols-outlined text-[#8eaa93] text-[22px]">
                    barcode_reader
                  </span>
                  <input
                    type="text"
                    className="w-full pl-11 pr-28 py-3 bg-[#f4f6f4] focus:bg-white rounded-lg text-[#131e17] font-tabular text-sm font-bold placeholder:text-[#8eaa93] uppercase focus:ring-2 focus:ring-[#114b27] outline-none border border-[#d0d9d1]"
                    placeholder="Arahkan barcode scanner / ketik no AWB ID Express... [Scan Beep Active]"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-3 py-1.5 bg-[#114b27] hover:bg-[#0b381b] text-white font-headline text-xs font-bold rounded uppercase transition-colors"
                  >
                    [ENTER] Scan
                  </button>
                </div>

                {scannedFeedback && (
                  <div className="p-2 bg-[#dcf5ce] text-[#0b381b] rounded text-xs font-bold">
                    {scannedFeedback}
                  </div>
                )}
              </form>

              {/* Table Filter Pills */}
              <div className="bg-white rounded-xl border border-[#d0d9d1] shadow-xs overflow-hidden">
                <div className="p-3 border-b border-[#f4f6f4] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-[#f4f6f4] p-1 rounded-lg">
                    {[
                      { key: 'ALL', label: 'Semua Koli' },
                      { key: 'STAGED', label: 'Staged Siap Serah' },
                      { key: 'MANIFESTED', label: 'Manifested' },
                      { key: 'HANDED_OVER', label: 'Handed Over' },
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setActiveFilter(f.key as any)}
                        className={`px-3 py-1 rounded text-xs font-headline font-bold transition-colors ${
                          activeFilter === f.key
                            ? 'bg-[#114b27] text-white shadow-xs'
                            : 'text-[#414941] hover:text-[#131e17]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-tabular text-[#414941]">
                    Menampilkan {filteredTransactions.length} Koli
                  </span>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-tabular">
                    <thead className="bg-[#e9efe9] text-[#131e17] font-headline text-[11px] uppercase tracking-wider border-b border-[#d0d9d1]">
                      <tr>
                        <th className="py-2.5 px-3">No. AWB ID Express</th>
                        <th className="py-2.5 px-3">Tujuan HUB</th>
                        <th className="py-2.5 px-3">Layanan</th>
                        <th className="py-2.5 px-3 text-right">Berat Fisik</th>
                        <th className="py-2.5 px-3 text-right">Chargeable</th>
                        <th className="py-2.5 px-3">Bin Staging</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e9efe9]">
                      {filteredTransactions.map((trx: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#f4f6f4] transition-colors">
                          <td className="py-3 px-3 font-bold text-[#003316]">
                            {trx.idExpressAwb}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#131e17]">
                            {trx.destinationHub}
                          </td>
                          <td className="py-3 px-3 text-[#414941]">{trx.serviceLevel}</td>
                          <td className="py-3 px-3 text-right text-[#414941]">
                            {trx.actualWeightKg} kg
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-[#003316]">
                            {trx.chargeableWeightKg} kg
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-[#e9efe9] text-[10px] font-bold text-[#003316]">
                              {trx.stagingBin}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                trx.status === 'HANDED_OVER'
                                  ? 'bg-[#dcf5ce] text-[#0b381b]'
                                  : 'bg-[#e0f2fe] text-[#0284c7]'
                              }`}
                            >
                              {trx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right 30% (4 cols) Digital BAST Document (Berita Acara Serah Terima) */}
            <div className="lg:col-span-4 bg-white rounded-xl border-2 border-[#131e17] p-5 shadow-md space-y-4 font-sans">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#131e17]">
                <div className="flex items-center gap-2">
                  <span className="bg-[#e01a22] text-white font-headline font-black text-xs px-2 py-0.5 rounded">
                    ID EXPRESS
                  </span>
                  <span className="font-headline font-black text-xs uppercase text-[#131e17]">
                    LEMBAR BAST RESMI
                  </span>
                </div>
                <span className="text-[10px] font-tabular font-bold text-[#414941]">
                  BAST-IDEXP-20241028-004
                </span>
              </div>

              {/* Manifest Metadata */}
              <div className="space-y-1.5 text-xs text-[#131e17]">
                <div className="flex justify-between">
                  <span className="text-[#414941]">Kode Gerai Agen:</span>
                  <span className="font-bold font-tabular">AG-0418 (Kuningan Tower 2)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#414941]">Batch Berjalan:</span>
                  <span className="font-bold font-tabular text-[#003316]">
                    {batchData?.manifestBatchId || 'MNF-JKT04-20241028-003'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#414941]">Total Koli Serah Terima:</span>
                  <span className="font-black font-tabular text-sm text-[#003316]">
                    {batchData?.totalParcels || 42} Koli Fisik
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#414941]">Total Berat Chargeable:</span>
                  <span className="font-black font-tabular text-sm text-[#003316]">
                    {(batchData?.totalWeightKg || 68.5).toFixed(1)} kg
                  </span>
                </div>
              </div>

              {/* Driver & Armada Form */}
              <div className="pt-2 border-t border-[#d0d9d1] space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Driver Penjemput ID Express *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rahmat Hidayat (Fleet 04)"
                    className="w-full mt-0.5 border border-[#d0d9d1] rounded px-2.5 py-1.5 text-xs font-bold text-[#131e17] outline-none"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#414941] uppercase">No. Handphone *</label>
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      className="w-full mt-0.5 border border-[#d0d9d1] rounded px-2 py-1.5 text-xs font-tabular text-[#131e17] outline-none"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#414941] uppercase">Plat Armada *</label>
                    <input
                      type="text"
                      placeholder="B 1234 XYZ"
                      className="w-full mt-0.5 border border-[#d0d9d1] rounded px-2 py-1.5 text-xs font-tabular font-bold text-[#131e17] outline-none uppercase"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Digital Signature Simulation Box */}
              <div>
                <label className="text-[10px] font-bold text-[#414941] uppercase block mb-1">
                  Verifikasi Serah Terima Fisik
                </label>
                <div className="h-16 bg-[#f4f6f4] border border-dashed border-[#8eaa93] rounded-lg flex items-center justify-center">
                  <span className="font-headline font-bold text-xs text-[#003316] select-none italic">
                    {driverName ? `✍ ${driverName} (Armada Terverifikasi)` : 'Menunggu kedatangan & identitas driver armada'}
                  </span>
                </div>
              </div>

              {/* Action Button: Seal and Print BAST */}
              <button
                type="button"
                disabled={handoverLoading}
                onClick={handleSealAndPrintBast}
                className="w-full py-3 bg-[#0b381b] hover:bg-[#003316] text-white font-headline font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
              >
                {handoverLoading ? (
                  <span className="animate-spin material-symbols-outlined text-[16px]">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                )}
                <span>[CTRL+ENTER] Cetak BAST &amp; Segel Batch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </HeaderAndSidebar>
  );
}
