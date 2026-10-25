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
    destinationZone?: string;
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

  getActiveSession: (agentId?: string) =>
    fetchApi(`/pos/active-session${agentId ? `?agentId=${agentId}` : ''}`),

  openShift: (data: { agentId?: string; cashierName: string; shiftType?: string; startingCash?: number }) =>
    fetchApi('/pos/shift/open', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  closeShift: (data: { shiftId?: string; actualCashCount?: number; notes?: string }) =>
    fetchApi('/pos/shift/close', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

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

  // Commission & Settlement (Role-Aware: Sub-Agent vs Akasia Pusat)
  getSettlementSummary: (period?: string, role: 'sub_agent' | 'akasia_pusat' = 'sub_agent', agentId?: string) =>
    fetchApi(
      `/settlement/summary?period=${period || ''}&role=${role}${agentId ? `&agentId=${encodeURIComponent(agentId)}` : ''}`
    ),

  getAgentsList: () => fetchApi('/settlement/agents'),

  payoutSettlement: (settlementId: string) =>
    fetchApi('/settlement/payout', {
      method: 'POST',
      body: JSON.stringify({ settlementId }),
    }),

  payoutSubAgent: (agentId: string) =>
    fetchApi('/settlement/payout', {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    }),

  // Customer Auto-Lookup & Multi-Search
  searchCustomers: (query: string) =>
    fetchApi(`/pos/customers/search?q=${encodeURIComponent(query)}`),

  lookupUniversal: (query: string) =>
    fetchApi(`/search/lookup?query=${encodeURIComponent(query)}`),

  recordComplaint: (data: any) =>
    fetchApi('/search/complaint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getComplaints: () => fetchApi('/search/complaints'),
};
