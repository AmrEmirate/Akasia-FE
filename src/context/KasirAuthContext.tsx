'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { akasiaApi, getAuthToken, setAuthToken } from '@/lib/api';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: 'AKASIA_PUSAT' | 'SUB_AGENT';
  agentId: string | null;
  branchName: string;
}

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
  user: AuthUser | null;
  agent: Agent | null;
  activeShift: Shift | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPusat: boolean;
  isSubAgent: boolean;
  isShiftModalOpen: boolean;
  openShiftModal: () => void;
  closeShiftModal: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  openShift: (cashierName: string, shiftType?: string, startingCash?: number) => Promise<boolean>;
  closeShift: (actualCashCount: number, notes?: string) => Promise<boolean>;
  refreshSession: (customAgentId?: string) => Promise<void>;
}

const KasirAuthContext = createContext<KasirAuthContextType>({
  user: null,
  agent: null,
  activeShift: null,
  loading: true,
  isAuthenticated: false,
  isPusat: false,
  isSubAgent: true,
  isShiftModalOpen: false,
  openShiftModal: () => {},
  closeShiftModal: () => {},
  login: async () => ({ success: false }),
  logout: () => {},
  openShift: async () => false,
  closeShift: async () => false,
  refreshSession: async () => {},
});

export function KasirAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const refreshSession = async (customAgentId?: string) => {
    try {
      const targetAgentId = customAgentId || user?.agentId || undefined;
      const res = await akasiaApi.getActiveSession(targetAgentId);
      if (res.success && res.session) {
        setAgent(res.session.agent);
        setActiveShift(res.session.activeShift);
      }
    } catch (err) {
      console.error('Error fetching Akasia POS session:', err);
    }
  };

  // Verify auth token or load initial session on client load
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = getAuthToken();

      if (token) {
        try {
          const meRes = await akasiaApi.getMe();
          if (meRes.success && meRes.user) {
            setUser(meRes.user);
            await refreshSession(meRes.user.agentId);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Session expired or invalid, cleaning token', err);
          setAuthToken(null);
        }
      }

      // If no token, check stored demo user or fallback session
      if (typeof window !== 'undefined') {
        const storedDemoUser = localStorage.getItem('akasia_user');
        if (storedDemoUser) {
          try {
            const parsed = JSON.parse(storedDemoUser);
            setUser(parsed);
            await refreshSession(parsed.agentId);
            setLoading(false);
            return;
          } catch (_) {}
        }
      }

      // Default baseline session (Sub-agent Kuningan AG-0418)
      await refreshSession();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await akasiaApi.login({ username, password });
      if (res.success && res.token && res.user) {
        setAuthToken(res.token);
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('akasia_user', JSON.stringify(res.user));
        }
        await refreshSession(res.user.agentId);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login gagal' };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Terjadi kesalahan saat memproses login',
      };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('akasia_user');
    }
    // Fire logout request to server if available
    akasiaApi.logout().catch(() => {});
  };

  const openShift = async (
    cashierName: string,
    shiftType: string = 'MORNING',
    startingCash: number = 500000
  ): Promise<boolean> => {
    try {
      const res = await akasiaApi.openShift({
        agentId: agent?.agentId || user?.agentId || 'AG-0418',
        cashierName: cashierName || user?.fullName || 'Kasir',
        shiftType,
        startingCash,
      });
      if (res.success && res.shift) {
        await refreshSession(user?.agentId || undefined);
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
        await refreshSession(user?.agentId || undefined);
        setIsShiftModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Gagal tutup shift kasir:', err);
      throw err;
    }
  };

  const isPusat = user?.role === 'AKASIA_PUSAT';
  const isSubAgent = user ? user.role === 'SUB_AGENT' : true;

  return (
    <KasirAuthContext.Provider
      value={{
        user,
        agent,
        activeShift,
        loading,
        isAuthenticated: !!user,
        isPusat,
        isSubAgent,
        isShiftModalOpen,
        openShiftModal: () => setIsShiftModalOpen(true),
        closeShiftModal: () => setIsShiftModalOpen(false),
        login,
        logout,
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

