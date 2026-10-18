import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Akasia Logistik - Sub-Agent Counter POS & ID Express Operations',
  description:
    'Sistem operasional kasir drop-point gerai sub-agen terintegrasi langsung dengan ID Express Direct API, timbangan fisik presisi, dan cetak thermal 100x150mm.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#f4f6f4] text-[#131e17]">
        {children}
      </body>
    </html>
  );
}
