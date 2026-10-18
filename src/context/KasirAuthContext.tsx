'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { akasiaApi } from '@/lib/api';

interface Shift {
  id: string;
  shiftCode: string;
  cashierName: string;
  shiftType: string;
  startingCash: number;
  currentCash: number;
  packagesBooked?: number;
  openedAt?: string;
}

interface Agent {
  agentId: string;
  branchName: string;
  buildingName: string;
  cashDrawerBalance: number;
  commissionBalance: number;
}

interface KasirAuthContextType {
  agent: Agent | null;
  activeShift: Shift | null;
  loading: boolean;
  isShiftModalOpen: boolean;
  openShiftModal: () => void;
  closeShiftModal: () => void;
  openShift: (cashierName: string, shiftType?: string, startingCash?: number) => Promise<boolean>;
  closeShift: (actualCashCount: number, notes?: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

const KasirAuthContext = createContext<KasirAuthContextType>({
  agent: null,
  activeShift: null,
  loading: true,
  isShiftModalOpen: false,
  openShiftModal: () => {},
  closeShiftModal: () => {},
  openShift: async () => false,
  closeShift: async () => false,
  refreshSession: async () => {},
});

export function KasirAuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const refreshSession = async () => {
    try {
      const res = await akasiaApi.getActiveSession();
      if (res.success && res.session) {
        setAgent(res.session.agent);
        setActiveShift(res.session.activeShift);
      }
    } catch (err) {
      console.error('Error fetching Akasia POS session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const openShift = async (
    cashierName: string,
    shiftType: string = 'MORNING',
    startingCash: number = 500000
  ): Promise<boolean> => {
    try {
      const res = await akasiaApi.openShift({
        agentId: agent?.agentId || 'AG-0418',
        cashierName,
        shiftType,
        startingCash,
      });
      if (res.success && res.shift) {
        await refreshSession();
        setIsShiftModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Gagal buka shift kasir:', err);
      throw err;
    }
  };

  const closeShift = async (actualCashCount: number, notes?: string): Promise<boolean> => {
    try {
      const res = await akasiaApi.closeShift({
        shiftId: activeShift?.id,
        actualCashCount,
        notes,
      });
      if (res.success) {
        await refreshSession();
        setIsShiftModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Gagal tutup shift kasir:', err);
      throw err;
    }
  };

  return (
    <KasirAuthContext.Provider
      value={{
        agent,
        activeShift,
        loading,
        isShiftModalOpen,
        openShiftModal: () => setIsShiftModalOpen(true),
        closeShiftModal: () => setIsShiftModalOpen(false),
        openShift,
        closeShift,
        refreshSession,
      }}
    >
      {children}
    </KasirAuthContext.Provider>
  );
}

export function useKasirAuth() {
  return useContext(KasirAuthContext);
}
