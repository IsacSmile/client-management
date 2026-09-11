import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="bg-brand-bg text-brand-dark min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
