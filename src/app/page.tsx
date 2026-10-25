'use client';

import { useState, useEffect } from 'react';
import HeaderAndSidebar from '@/components/HeaderAndSidebar';
import { akasiaApi } from '@/lib/api';
import { useKasirAuth } from '@/context/KasirAuthContext';

export default function PosKasirPage() {
  const { activeShift, openShiftModal, refreshSession, agent } = useKasirAuth();
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form State (Clean production inputs)
  const [senderPhone, setSenderPhone] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderAddress, setSenderAddress] = useState('');

  // Auto-lookup dropdown suggestions
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [destinationHub, setDestinationHub] = useState('HUB JKT-SELATAN');
  const [destinationZone, setDestinationZone] = useState<'Jabodetabek' | 'Pulau Jawa' | 'Luar Pulau Jawa' | 'Pedalaman / Remote'>('Jabodetabek');

  // Scale & Dimensions
  const [actualWeight, setActualWeight] = useState<number>(0.4);
  const [lengthCm, setLengthCm] = useState<number>(20);
  const [widthCm, setWidthCm] = useState<number>(15);
  const [heightCm, setHeightCm] = useState<number>(10);
  const [stagingBin, setStagingBin] = useState('BIN-A1');

  // Operational Settings (Remote Booking & Commission Type & Payment)
  const [isRemoteBooking, setIsRemoteBooking] = useState(false);
  const [commissionType, setCommissionType] = useState<'PERCENTAGE' | 'FLAT_AMOUNT'>('PERCENTAGE');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'BANK_TRANSFER'>('CASH');

  // Computed & API rate response
  const [rateData, setRateData] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [lastPrintedTrx, setLastPrintedTrx] = useState<any>(null);

  // Customer repeat auto-lookup
  const handleSenderPhoneChange = async (val: string) => {
    setSenderPhone(val);
    if (val.trim().length >= 3) {
      try {
        const res = await akasiaApi.searchCustomers(val.trim());
        if (res.success && res.customers && res.customers.length > 0) {
          setCustomerSuggestions(res.customers);
          setShowCustomerDropdown(true);
        } else {
          setShowCustomerDropdown(false);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = (cus: any) => {
    setSenderName(cus.fullName || '');
    setSenderPhone(cus.phone || '');
    setSenderAddress(cus.address || '');
    setShowCustomerDropdown(false);
  };

  // Live Physical Scale COM3 reader with Web Serial API and API fallback
  const handleReadScale = async () => {
    if (typeof window !== 'undefined' && 'serial' in navigator) {
      try {
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 9600 });
        const reader = port.readable.getReader();
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);
        const weightMatch = text.match(/(\d+\.?\d*)/);
        if (weightMatch) {
          const parsed = parseFloat(weightMatch[1]);
          if (parsed > 0) setActualWeight(parsed);
        }
        reader.releaseLock();
        await port.close();
        return;
      } catch (e) {
        console.log('Web Serial direct port skipped/cancelled, fallback to bridge:', e);
      }
    }

    try {
      const res = await akasiaApi.readScale();
      if (res.success && res.weightKg) {
        setActualWeight(res.weightKg);
      }
    } catch (err) {
      console.error('Gagal baca scale COM3:', err);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [actualWeight, lengthCm, widthCm, heightCm, destinationZone, destinationHub]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F8') {
        e.preventDefault();
        handleReadScale();
      } else if (e.key === 'F12') {
        e.preventDefault();
        handleBookingSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setRecipientName('');
        setRecipientPhone('');
        setRecipientAddress('');
        setShowCustomerDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actualWeight, lengthCm, widthCm, heightCm, selectedService, senderName, senderPhone, senderAddress, recipientName, recipientPhone, recipientAddress, destinationHub, destinationZone, stagingBin, paymentMethod, activeShift, isRemoteBooking, commissionType]);

  const fetchRates = async () => {
    try {
      const res = await akasiaApi.calculateRate({
        actualWeightKg: actualWeight,
        lengthCm,
        widthCm,
        heightCm,
        destinationCity: destinationHub,
        destinationZone,
      });
      if (res.success) {
        setRateData(res);
        // Automatically select the recommended service for the weight category
        const rec = res.services.find((s: any) => s.isRecommended) || res.services[0];
        setSelectedService(rec);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSubmit = async () => {
    if (!activeShift) {
      alert('Shift kasir belum dibuka! Silakan klik "Buka Shift Kasir" di bagian atas sebelum memproses transaksi.');
      openShiftModal();
      return;
    }

    if (!senderPhone.trim() || !senderName.trim() || !senderAddress.trim()) {
      alert('Mohon lengkapi data pengirim (Nama, No. Telepon, dan Alamat)');
      return;
    }

    if (!recipientPhone.trim() || !recipientName.trim() || !recipientAddress.trim()) {
      alert('Mohon lengkapi data penerima (Nama, No. Telepon, dan Alamat Tujuan)');
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        agentId: agent?.agentId || 'AG-0418',
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderAddress: senderAddress.trim(),
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientAddress: recipientAddress.trim(),
        destinationHub,
        serviceLevel: selectedService?.name || 'ID Express iD Standard',
        actualWeightKg: actualWeight,
        lengthCm,
        widthCm,
        heightCm,
        shippingFee: selectedService?.shippingFee || 9000,
        insuranceFee: selectedService?.insuranceFee || 1000,
        paymentMethod,
        stagingBin,
        isRemoteBooking,
        commissionType,
      };

      const res = await akasiaApi.createBooking(bookingPayload);
      if (res.success) {
        setLastPrintedTrx(res.transaction);
        setBookingSuccess(true);
        refreshSession();
        // Clear recipient inputs for next customer in line
        setRecipientName('');
        setRecipientPhone('');
        setRecipientAddress('');
        setTimeout(() => setBookingSuccess(false), 6000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi kasir');
    } finally {
      setLoading(false);
    }
  };

  const chargeableWeight = rateData?.scaleReadout?.chargeableWeightKg || actualWeight;
  const hasSideOver40 = rateData?.scaleReadout?.hasSideOver40 || false;
  const isVolumetricHigher = rateData?.scaleReadout?.isVolumetricHigher || false;
  const volumetricWeight = rateData?.scaleReadout?.volumetricWeightKg || 0.5;
  const totalAmount = (selectedService?.shippingFee || 9000) + (selectedService?.insuranceFee || 1000);

  // Komisi Sub Agent dari Akasia Pusat (20% atau flat Rp 1.100)
  const earnedCommission =
    commissionType === 'FLAT_AMOUNT'
      ? 1100
      : Math.round((selectedService?.shippingFee || 9000) * 0.2);

  return (
    <HeaderAndSidebar>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Top Operational Banner */}
        <div className="bg-white p-4 rounded-xl border border-[#d0d9d1] shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b2614] text-[#a5f87a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-xs uppercase text-[#0b381b]">
                  Counter POS Akasia Logistik
                </span>
                <span className="bg-[#dcf5ce] text-[#0b381b] text-[9px] font-bold px-1.5 py-0.5 rounded font-tabular uppercase">
                  DIRECT API ID EXPRESS
                </span>
              </div>
              <span className="text-[11px] text-[#414941]">
                Sesi Kasir: KS-0914 | Manifest Batch Berjalan: <strong className="text-[#131e17]">MNF-JKT04-20241028-003</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] text-[#414941] uppercase font-bold block">
                Total Paket Shift
              </span>
              <span className="font-tabular font-bold text-sm text-[#003316]">
                47 Koli / 68.2 kg
              </span>
            </div>
            <div className="h-7 w-px bg-[#d0d9d1]"></div>
            <div className="text-right">
              <span className="text-[10px] text-[#414941] uppercase font-bold block">
                Hak Komisi Sub-Agent (20%)
              </span>
              <span className="font-tabular font-bold text-sm text-[#16a34a]">
                Rp 174.600
              </span>
            </div>
          </div>
        </div>

        {bookingSuccess && (
          <div className="p-3 bg-[#dcf5ce] border border-[#286c00] rounded-xl text-xs text-[#0b381b] font-bold flex flex-wrap items-center justify-between gap-2 animate-bounce">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#286c00]">print</span>
              {isRemoteBooking
                ? `Transaksi Remote Booking Sukses! Resi: ${lastPrintedTrx?.idExpressAwb} (Waybill dicetak di Hub Pusat)`
                : `Stiker Thermal ID Express berhasil dicetak! Resi: ${lastPrintedTrx?.idExpressAwb}`}
            </span>
            <span className="font-tabular bg-white px-2 py-0.5 rounded text-[10px]">
              Tersimpan di {stagingBin}
            </span>
          </div>
        )}

        {/* MAIN POS SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: 7 Cols Entry Module */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Customer Sender Auto-Lookup */}
            <div className="bg-white rounded-xl border border-[#d0d9d1] p-4 shadow-xs space-y-3 relative">
              <div className="flex items-center justify-between pb-1 border-b border-[#f4f6f4]">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">person_search</span>
                  1. Identitas Pengirim (Data Pelanggan Tersimpan Otomatis)
                </span>
                <span className="text-[10px] bg-[#e9efe9] text-[#003316] font-bold px-2 py-0.5 rounded">
                  Repeat Customer Lookup
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">
                    No. Telepon / HP (Ketik untuk Cari Data)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-8877-3321"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs font-tabular font-bold text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={senderPhone}
                    onChange={(e) => handleSenderPhoneChange(e.target.value)}
                  />

                  {/* Auto-Lookup Dropdown */}
                  {showCustomerDropdown && customerSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-30 mt-1 bg-white border border-[#d0d9d1] rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-[#f4f6f4]">
                      {customerSuggestions.map((cus) => (
                        <div
                          key={cus.id}
                          onClick={() => handleSelectCustomer(cus)}
                          className="p-2 hover:bg-[#eaf7ec] cursor-pointer text-xs transition-colors"
                        >
                          <div className="font-bold text-[#003316] flex items-center justify-between">
                            <span>{cus.fullName}</span>
                            <span className="font-tabular text-[10px] text-[#286c00] font-semibold">{cus.phone}</span>
                          </div>
                          <span className="text-[10px] text-[#414941] block truncate">{cus.address}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Nama Pengirim / PT</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hendra (PT Mega Pratama)"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#414941] uppercase">Alamat Gedung / Kantor Gerai Pengirim</label>
                <input
                  type="text"
                  placeholder="Contoh: Kuningan Tower 2 Lt. 14, Jakarta Selatan"
                  className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Recipient Identity & Destination HUB */}
            <div className="bg-white rounded-xl border border-[#d0d9d1] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#f4f6f4]">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  2. Tujuan &amp; Penerima (Recipient)
                </span>
                <span className="text-[10px] font-tabular bg-[#dcf5ce] text-[#0b381b] font-bold px-2 py-0.5 rounded">
                  Routing ID Express
                </span>
              </div>

              {/* Destination Zone Picker */}
              <div className="p-2.5 bg-[#f4f6f4] rounded-lg border border-[#d0d9d1]/60">
                <label className="text-[10px] font-bold text-[#003316] uppercase block mb-1">
                  Wilayah / Jangkauan Pengiriman:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'Jabodetabek', label: 'Jabodetabek' },
                    { id: 'Pulau Jawa', label: 'Pulau Jawa' },
                    { id: 'Luar Pulau Jawa', label: 'Luar Jawa' },
                    { id: 'Pedalaman / Remote', label: 'Pedalaman (Khusus)' },
                  ].map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setDestinationZone(z.id as any)}
                      className={`px-2 py-1.5 rounded-lg font-bold text-[11px] transition-all border ${
                        destinationZone === z.id
                          ? 'bg-[#003316] text-[#a5f87a] border-[#003316]'
                          : 'bg-white text-[#414941] border-[#d0d9d1] hover:bg-[#e9efe9]'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>

                {destinationZone === 'Pedalaman / Remote' && (
                  <div className="mt-2 p-2 bg-[#fffbeb] border border-[#f59e0b] rounded text-[11px] text-[#92400e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Wilayah pedalaman/remote area memerlukan konfirmasi jangkauan ID Express sebelum pengiriman.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Nama Penerima</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kresna Logistik Office"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">No. Handphone Penerima</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0817-2233-8899"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs font-tabular text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Alamat Lengkap Tujuan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Pemuda No. 102, Rawamangun, Jaktim"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Destination HUB</label>
                  <select
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2 py-1.5 text-xs text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none bg-white font-tabular"
                    value={destinationHub}
                    onChange={(e) => setDestinationHub(e.target.value)}
                  >
                    <option value="HUB JKT-SELATAN">HUB JKT-SELATAN</option>
                    <option value="HUB JKT-TIMUR">HUB JKT-TIMUR</option>
                    <option value="HUB BGR-01">HUB BGR-01 (Bogor)</option>
                    <option value="HUB BDO-01">HUB BDO-01 (Bandung)</option>
                    <option value="HUB SUB-01">HUB SUB-01 (Surabaya)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Physical Scale & Dimensi > 40 cm Audit */}
            <div className="bg-white rounded-xl border border-[#d0d9d1] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#f4f6f4]">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">scale</span>
                  3. Pengukuran Bobot &amp; Audit Kubikasi (&gt; 40 cm Rule)
                </span>
                <button
                  type="button"
                  onClick={handleReadScale}
                  className="text-[10px] font-tabular bg-[#0b2614] hover:bg-[#114b27] text-[#a5f87a] font-bold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                  title="Klik atau tekan F8 untuk membaca sensor timbangan fisik COM3"
                >
                  <span className="material-symbols-outlined text-[13px]">sync</span>
                  <span>[F8] Baca Scale COM3</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Timbangan Fisik (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-sm font-headline font-bold text-[#003316] bg-[#eaf7ec] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0.1)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Panjang (P) cm</label>
                  <input
                    type="number"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs font-tabular text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Lebar (L) cm</label>
                  <input
                    type="number"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs font-tabular text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={widthCm}
                    onChange={(e) => setWidthCm(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#414941] uppercase">Tinggi (T) cm</label>
                  <input
                    type="number"
                    className="w-full mt-1 border border-[#d0d9d1] rounded-lg px-2.5 py-1.5 text-xs font-tabular text-[#131e17] focus:ring-2 focus:ring-[#114b27] outline-none"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Volumetric Audit Bar (> 40 cm rule) */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  hasSideOver40
                    ? isVolumetricHigher
                      ? 'bg-[#fef5e7] border-[#e58a13] text-[#c05621]'
                      : 'bg-[#eaf7ec] border-[#81bb8c] text-[#003316]'
                    : 'bg-[#f4f6f4] border-[#d0d9d1] text-[#131e17]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    {hasSideOver40 ? (isVolumetricHigher ? 'warning' : 'verified') : 'check_circle'}
                  </span>
                  <div>
                    <span className="font-bold block">
                      {!hasSideOver40
                        ? 'Bebas Penalti Kubikasi (Semua Sisi <= 40 cm)'
                        : isVolumetricHigher
                        ? 'Audit Kubikasi Aktif (Sisi > 40 cm & Bobot Dimensi Lebih Besar)'
                        : 'Audit Dimensi Normal (Fisik Lebih Besar Dari Kubikasi)'}
                    </span>
                    <span className="text-[10px]">
                      Dimensi: {lengthCm}×{widthCm}×{heightCm} cm | Kubikasi ({lengthCm}×{widthCm}×{heightCm}/6000) = {volumetricWeight} kg | Fisik: {actualWeight} kg
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold block">Chargeable Weight:</span>
                  <span className="font-headline font-bold text-base">{chargeableWeight} kg</span>
                </div>
              </div>

              {/* ID Express 3 Dedicated Service Levels */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#414941] uppercase">
                    Pilih Layanan ID Express (Otomatis Dikelompokkan)
                  </label>
                  <span className="text-[9px] text-[#286c00] font-bold">
                    ✓ Terhubung Live Sistem ID Express
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(rateData?.services || []).map((srv: any, idx: number) => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedService(srv)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-[#003316] bg-[#eaf7ec] ring-2 ring-[#003316]/20'
                            : 'border-[#d0d9d1] bg-white hover:border-[#8eaa93]'
                        }`}
                      >
                        {srv.isRecommended && (
                          <span className="absolute -top-2 right-2 bg-[#286c00] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                            Rekomendasi Berat
                          </span>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#131e17]">{srv.code}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px] text-[#286c00]">
                              check_circle
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-[#414941] block mt-0.5">{srv.estimatedDays}</span>
                        <span className="text-[9px] text-[#8eaa93] block line-clamp-1 mt-0.5">{srv.applicabilityNote}</span>

                        <div className="mt-2 pt-1 border-t border-[#d0d9d1]/50 flex items-baseline justify-between">
                          <span className="font-tabular font-bold text-xs text-[#003316]">
                            Rp {srv.shippingFee.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[9px] font-tabular text-[#286c00] font-semibold">
                            +20% Komisi
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remote Booking & Staging Bin */}
              <div className="pt-2 border-t border-[#f4f6f4] flex flex-wrap items-center justify-between gap-3">
                {/* Remote Booking Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer bg-[#e9efe9] px-3 py-1.5 rounded-lg border border-[#d0d9d1]">
                  <input
                    type="checkbox"
                    checked={isRemoteBooking}
                    onChange={(e) => setIsRemoteBooking(e.target.checked)}
                    className="h-4 w-4 text-[#114b27] rounded focus:ring-[#114b27]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#003316] block leading-none">
                      Remote Booking (Barang Di Luar Wilayah)
                    </span>
                    <span className="text-[9px] text-[#414941]">
                      Waybill fisik akan dicetak di Hub / Kantor Pusat
                    </span>
                  </div>
                </label>

                {/* Staging Bin */}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-[#414941] uppercase shrink-0">
                    Bin Staging:
                  </label>
                  <div className="flex gap-1">
                    {['BIN-A1', 'BIN-B2', 'BIN-VOLUMETRIC', 'BIN-FRAGILE'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setStagingBin(b)}
                        className={`px-2 py-0.5 rounded text-[10px] font-tabular font-bold border transition-colors ${
                          stagingBin === b
                            ? 'bg-[#003316] text-white border-[#003316]'
                            : 'bg-white text-[#414941] border-[#d0d9d1] hover:bg-[#e9efe9]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 5 Cols Thermal Preview & Execution Ledger */}
          <div className="lg:col-span-5 space-y-4">
            {/* Transaction Ledger & Payment Card */}
            <div className="bg-white rounded-xl border border-[#d0d9d1] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#f4f6f4]">
                <span className="text-xs font-bold text-[#003316] uppercase tracking-wider">
                  Ringkasan Transaksi POS
                </span>
                <span className="text-[10px] font-tabular bg-[#dcf5ce] text-[#0b381b] font-bold px-1.5 py-0.5 rounded">
                  Komisi Anda +Rp {earnedCommission.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Commission Scheme Switcher for Sub-Agent */}
              <div className="flex items-center justify-between bg-[#f4f6f4] p-1.5 rounded-lg text-xs">
                <span className="text-[10px] font-bold text-[#414941] uppercase">Skema Komisi Gerai:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCommissionType('PERCENTAGE')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      commissionType === 'PERCENTAGE'
                        ? 'bg-[#003316] text-[#a5f87a]'
                        : 'bg-white text-[#414941] border border-[#d0d9d1]'
                    }`}
                  >
                    20% Ongkir
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommissionType('FLAT_AMOUNT')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      commissionType === 'FLAT_AMOUNT'
                        ? 'bg-[#003316] text-[#a5f87a]'
                        : 'bg-white text-[#414941] border border-[#d0d9d1]'
                    }`}
                  >
                    Flat Rp 1.100
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#414941]">
                  <span>Ongkos Kirim ({chargeableWeight} kg):</span>
                  <span className="font-tabular font-semibold text-[#131e17]">
                    Rp {(selectedService?.shippingFee || 9000).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-[#414941]">
                  <span>Biaya Asuransi Paket:</span>
                  <span className="font-tabular font-semibold text-[#131e17]">
                    Rp {(selectedService?.insuranceFee || 1000).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#d0d9d1] flex justify-between items-baseline">
                  <span className="font-bold text-[#131e17]">Total Tagihan Konsumen:</span>
                  <span className="font-headline font-black text-xl text-[#003316]">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div className="pt-1 space-y-1.5">
                <label className="text-[10px] font-bold text-[#414941] uppercase block">
                  Metode Pembayaran (Diterima ke Akasia Logistik)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-2 px-1 rounded-lg text-[11px] font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-[#114b27] text-white border-[#114b27]'
                        : 'bg-white text-[#131e17] border-[#d0d9d1] hover:bg-[#e9efe9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    <span>CASH</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`py-2 px-1 rounded-lg text-[11px] font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'QRIS'
                        ? 'bg-[#114b27] text-white border-[#114b27]'
                        : 'bg-white text-[#131e17] border-[#d0d9d1] hover:bg-[#e9efe9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                    <span>QRIS Akasia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`py-2 px-1 rounded-lg text-[11px] font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'bg-[#114b27] text-white border-[#114b27]'
                        : 'bg-white text-[#131e17] border-[#d0d9d1] hover:bg-[#e9efe9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">account_balance</span>
                    <span>Transfer Bank</span>
                  </button>
                </div>

                {/* Explicit COD Restriction Banner */}
                <div className="p-2 bg-[#fef2f2] border border-[#f87171]/40 rounded-lg text-[10px] text-[#991b1b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0 text-[#dc2626]">block</span>
                  <span>
                    <strong>Layanan COD Non-Aktif:</strong> Sistem Akasia Logistik tidak melayani Cash On Delivery meskipun tersedia di sistem ID Express.
                  </span>
                </div>
              </div>

              {/* Submit & Print Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleBookingSubmit}
                className="w-full mt-2 py-3.5 bg-[#114b27] hover:bg-[#0b381b] active:scale-98 text-white rounded-xl font-headline font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin material-symbols-outlined text-[20px]">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">print</span>
                )}
                <span>
                  {isRemoteBooking
                    ? '[F12] Proses Remote Booking (Cetak di Hub)'
                    : '[F12] Cetak Resi Thermal & Simpan'}
                </span>
              </button>
            </div>

            {/* HIGH-FIDELITY 100x150mm THERMAL LABEL PREVIEW */}
            <div className="bg-white rounded-xl border-2 border-[#131e17] p-4 shadow-md space-y-3 font-sans">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#131e17]">
                <div className="flex items-center gap-2">
                  <span className="bg-[#e01a22] text-white font-headline font-black text-sm px-2 py-0.5 rounded tracking-tighter">
                    ID EXPRESS
                  </span>
                  <span className="text-[10px] font-tabular font-bold text-[#131e17]">
                    {agent?.agentId || 'AG-0418'}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#414941]">
                  100×150mm Thermal Roll
                </span>
              </div>

              {/* 1D Barcode Simulation */}
              <div className="bg-white p-2 border border-[#d0d9d1] rounded flex flex-col items-center">
                <svg className="w-full h-12" fill="#000" viewBox="0 0 240 45">
                  <rect x="0" y="0" width="3" height="45" />
                  <rect x="5" y="0" width="2" height="45" />
                  <rect x="10" y="0" width="4" height="45" />
                  <rect x="16" y="0" width="2" height="45" />
                  <rect x="20" y="0" width="5" height="45" />
                  <rect x="27" y="0" width="2" height="45" />
                  <rect x="31" y="0" width="3" height="45" />
                  <rect x="36" y="0" width="4" height="45" />
                  <rect x="42" y="0" width="2" height="45" />
                  <rect x="47" y="0" width="6" height="45" />
                  <rect x="55" y="0" width="2" height="45" />
                  <rect x="60" y="0" width="4" height="45" />
                  <rect x="66" y="0" width="3" height="45" />
                  <rect x="71" y="0" width="2" height="45" />
                  <rect x="76" y="0" width="5" height="45" />
                  <rect x="83" y="0" width="2" height="45" />
                  <rect x="88" y="0" width="4" height="45" />
                  <rect x="94" y="0" width="3" height="45" />
                  <rect x="100" y="0" width="2" height="45" />
                  <rect x="105" y="0" width="5" height="45" />
                  <rect x="112" y="0" width="3" height="45" />
                  <rect x="118" y="0" width="2" height="45" />
                  <rect x="123" y="0" width="4" height="45" />
                  <rect x="130" y="0" width="2" height="45" />
                  <rect x="135" y="0" width="5" height="45" />
                  <rect x="142" y="0" width="3" height="45" />
                  <rect x="148" y="0" width="2" height="45" />
                  <rect x="153" y="0" width="4" height="45" />
                  <rect x="160" y="0" width="3" height="45" />
                  <rect x="166" y="0" width="2" height="45" />
                  <rect x="171" y="0" width="5" height="45" />
                  <rect x="178" y="0" width="3" height="45" />
                  <rect x="183" y="0" width="2" height="45" />
                  <rect x="188" y="0" width="4" height="45" />
                  <rect x="195" y="0" width="3" height="45" />
                  <rect x="201" y="0" width="2" height="45" />
                  <rect x="206" y="0" width="5" height="45" />
                  <rect x="214" y="0" width="3" height="45" />
                  <rect x="220" y="0" width="2" height="45" />
                  <rect x="225" y="0" width="5" height="45" />
                  <rect x="233" y="0" width="4" height="45" />
                </svg>
                <span className="font-tabular font-black text-sm tracking-widest text-[#131e17] mt-1">
                  {lastPrintedTrx?.idExpressAwb || 'ID01928472910'}
                </span>
              </div>

              {/* Destination Hub & Service Tag */}
              <div className="grid grid-cols-2 gap-2 border-y border-[#131e17] py-1 text-center">
                <div>
                  <span className="text-[9px] uppercase text-[#414941] block">Tujuan HUB</span>
                  <span className="font-headline font-black text-xs text-[#131e17]">
                    {destinationHub}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-[#414941] block">Layanan</span>
                  <span className="font-headline font-black text-xs text-[#e01a22]">
                    {selectedService?.code || 'iD Standard'}
                  </span>
                </div>
              </div>

              {/* Remote Booking Indicator if applicable */}
              {isRemoteBooking && (
                <div className="bg-[#fef3c7] border border-[#f59e0b] p-1 text-center rounded text-[10px] font-bold text-[#b45309] uppercase">
                  ⭐ REMOTE BOOKING — DICETAK DI HUB PUSAT AKASIA
                </div>
              )}

              {/* Recipient & Sender Micro Info */}
              <div className="space-y-1.5 text-[11px] leading-tight">
                <div className="bg-[#f4f6f4] p-1.5 rounded">
                  <span className="font-bold block">Penerima: {recipientName || 'Kresna Logistik Office'}</span>
                  <span className="text-[#414941]">{recipientAddress || 'Jl. Pemuda No. 102, Rawamangun, Jaktim'}</span>
                  <span className="block font-tabular text-[#131e17] font-semibold mt-0.5">
                    Telp: {recipientPhone || '0817-2233-8899'}
                  </span>
                </div>

                <div className="p-1">
                  <span className="font-bold block">Pengirim: {senderName || 'Hendra (PT Mega Pratama)'}</span>
                  <span className="text-[#414941]">Gerai Kuningan Tower 2 • {senderPhone || '0812-8877-3321'}</span>
                </div>
              </div>

              {/* Weight Stamp Bottom */}
              <div className="bg-[#131e17] text-white p-2 rounded flex items-center justify-between font-tabular text-xs font-bold">
                <span>Chargeable: {chargeableWeight} kg</span>
                <span>Staging: {stagingBin}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeaderAndSidebar>
  );
}
