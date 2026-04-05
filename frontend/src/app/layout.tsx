import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Netra - India\'s Real-Time Safety Intelligence',
  description: 'Stay informed about safety threats across India. Real-time incident tracking for animal attacks, crime, road accidents, and environmental hazards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
