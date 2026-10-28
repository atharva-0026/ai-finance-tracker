import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuraFinance AI — Intelligent Expense Tracker & Financial Intelligence',
  description:
    'Secure user dashboard, sub-millisecond AI auto-categorization of expenses, Gemini financial insights, and PostgreSQL Row Level Security (RLS).',
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
