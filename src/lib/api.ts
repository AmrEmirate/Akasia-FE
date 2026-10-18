const API_BASE_URL = process.env.NEXT_PUBLIC_AKASIA_API_URL || 'http://localhost:5002/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Terjadi kesalahan pada request API Akasia');
  }
  return data;
}

export const akasiaApi = {
  // POS & Counter
  readScale: () => fetchApi('/pos/scale/read'),

  calculateRate: (data: {
    actualWeightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    destinationCity?: string;
  }) =>
    fetchApi('/pos/calculate-rate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createBooking: (bookingData: any) =>
    fetchApi('/pos/booking', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  getActiveSession: () => fetchApi('/pos/active-session'),

  // Manifest Batch
  getCurrentManifest: () => fetchApi('/manifest/current'),

  executeHandover: (handoverData: {
    manifestBatchId?: string;
    fleetDriverName?: string;
    driverPhone?: string;
    vehiclePlate?: string;
    signatureData?: string;
  }) =>
    fetchApi('/manifest/handover', {
      method: 'POST',
      body: JSON.stringify(handoverData),
    }),

  getManifestHistory: () => fetchApi('/manifest/history'),

  // Commission & Settlement
  getSettlementSummary: (period?: string) =>
    fetchApi(`/settlement/summary${period ? `?period=${period}` : ''}`),

  payoutSettlement: (settlementId: string) =>
    fetchApi('/settlement/payout', {
      method: 'POST',
      body: JSON.stringify({ settlementId }),
    }),

  // Multi-Search & CS
  lookupUniversal: (query: string) =>
    fetchApi(`/search/lookup?query=${encodeURIComponent(query)}`),

  recordComplaint: (data: any) =>
    fetchApi('/search/complaint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getComplaints: () => fetchApi('/search/complaints'),
};
