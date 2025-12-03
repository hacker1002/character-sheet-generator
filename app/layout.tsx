import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Character Sheet Generator',
  description:
    'AI-powered character sheet generator using Google Gemini 2.5 Flash. Generate 8-panel character sheets from avatar images.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
