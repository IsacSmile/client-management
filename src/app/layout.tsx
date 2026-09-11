import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Faiz Dev & Co. | Client Management',
  description: 'Internal Client & Project Management Web Application for Faiz Dev & Co.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-brand-bg text-brand-dark min-h-screen font-sans antialiased selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
