'use client';

import React from 'react';
import { KasirAuthProvider } from '@/context/KasirAuthContext';
import ShiftModal from '@/components/ShiftModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KasirAuthProvider>
      {children}
      <ShiftModal />
    </KasirAuthProvider>
  );
}
