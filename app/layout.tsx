import type { Metadata, Viewport } from 'next';
import './globals.css';
import './beta2-button-hierarchy.css';
import './beta2-review-send-polish.css';
import './beta2-capture-generate-polish.css';
import './beta2-supporting-screens-polish.css';
import './v2-more-admin-layout.css';
import './v2-tablet-polish.css';

const iconVersion = 'ai-cas-v4';

export const metadata: Metadata = {
  title: 'AI-CAS',
  description: 'Corrective Action System powered by Applied Intelligence Framework.',
  manifest: `/manifest.webmanifest?v=${iconVersion}`,
  icons: {
    icon: [
      { url: `/icon-192.png?v=${iconVersion}`, sizes: '192x192', type: 'image/png' },
      { url: `/icon-512.png?v=${iconVersion}`, sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: `/apple-touch-icon.png?v=${iconVersion}`, sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: `/favicon.ico?v=${iconVersion}` },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AI-CAS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#02050a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
