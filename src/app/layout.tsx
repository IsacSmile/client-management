import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Client Management System',
  description: 'Internal Client & Project Management Web Application',
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
