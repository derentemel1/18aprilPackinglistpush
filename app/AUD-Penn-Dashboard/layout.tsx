import type { ReactNode } from 'react';
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono, Caveat } from 'next/font/google';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  adjustFontFallback: false,
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata = {
  title: 'AUD Progress Hub',
  description: 'AUD-Penn Operations Dashboard',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function AUDLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${caveat.variable}`}
      style={{
        fontFamily: 'var(--font-sans, "IBM Plex Sans", system-ui, sans-serif)',
      }}
    >
      {children}
    </div>
  );
}
